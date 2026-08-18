-- Phase 0 — Foundation
-- Auth/roles/permissions, settings, audit logging, business-ID sequences.
-- No CRM/CMS/Inventory/Quotation/Booking/WhatsApp tables are created here — those are Phase 1+.

create extension if not exists pgcrypto;

-- =========================================================================
-- ROLES
-- =========================================================================

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.roles is
  'Named role containers (Super Admin, Admin/Manager, Sales Staff, Content Manager). '
  'The role is just a label — actual authorization is granted via role_permissions.';

-- =========================================================================
-- PERMISSIONS
-- =========================================================================

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.permissions is
  'Atomic capability keys (e.g. manage_users). RLS policies check via has_permission(), '
  'never a role name directly, so authorization changes are data changes, not code changes.';

-- =========================================================================
-- ROLE_PERMISSIONS (join table)
-- =========================================================================

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index role_permissions_permission_id_idx on public.role_permissions(permission_id);

-- =========================================================================
-- USERS (staff profile, 1:1 with auth.users)
-- =========================================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role_id uuid references public.roles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is
  'Staff profile row, one per public.users(id) = auth.users(id). New signups get a row with no '
  'role/permissions until a Super Admin assigns one. This fails closed instead of granting implicit access.';

create index users_role_id_idx on public.users(role_id);

-- Auto-create a public.users row whenever a new auth.users row appears, so public.users always
-- stays in sync with Supabase Auth without needing a separate signup step.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Generic updated_at maintenance, reused by users and settings below.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- =========================================================================
-- SETTINGS
-- Non-sensitive runtime configuration ONLY. Never store service-role keys,
-- WhatsApp access tokens/app secrets, or SMTP passwords here — those remain
-- environment variables / server-side secrets, never database rows.
-- =========================================================================

create table public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

comment on table public.settings is
  'Runtime business/configuration values only (business hours, automation timing, feature '
  'toggles, non-secret integration metadata like a WhatsApp phone-number-id). '
  'NEVER store SUPABASE_SERVICE_ROLE_KEY, WhatsApp access tokens/app secrets, or SMTP credentials here.';

create trigger set_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- =========================================================================
-- SEQUENCES
-- Concurrency-safe human-readable IDs (e.g. CMT-2026-0001). See functions below.
-- =========================================================================

create table public.sequences (
  entity_key text not null,
  year int not null,
  current_value bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (entity_key, year)
);

comment on table public.sequences is
  'Backing store for generate_business_id(). No RLS policies are granted on this table to '
  'any client role — all access goes through the SECURITY DEFINER function below, '
  'the only supported way to obtain a sequence value.';

-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING is atomic in Postgres: concurrent callers
-- incrementing the same (entity_key, year) row are serialized by the row lock taken during
-- the upsert, so two simultaneous callers never get the same value.
create function public.next_sequence_value(p_entity_key text, p_year int default extract(year from now())::int)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_value bigint;
begin
  insert into public.sequences (entity_key, year, current_value)
  values (p_entity_key, p_year, 1)
  on conflict (entity_key, year)
  do update set current_value = public.sequences.current_value + 1, updated_at = now()
  returning current_value into v_value;

  return v_value;
end;
$$;

create function public.generate_business_id(p_prefix text, p_entity_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_value bigint;
begin
  v_value := public.next_sequence_value(p_entity_key, v_year);
  return format('%s-%s-%s', p_prefix, v_year, lpad(v_value::text, 4, '0'));
end;
$$;

comment on function public.generate_business_id(text, text) is
  'generate_business_id(''CMT'', ''enquiry'') -> ''CMT-2026-0001''. Used wherever Phase 1+ needs a '
  'human-readable business ID.';

-- =========================================================================
-- AUDIT_LOGS
-- Append-only. entity_id is TEXT so it can reference either UUID-keyed (Phase 1+) or
-- text-keyed (settings.key) rows.
-- =========================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Immutable change log. No UPDATE/DELETE policies are granted to any role in the RLS section — '
  'so rows are only ever inserted, never altered, once RLS is enabled.';

create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);

-- =========================================================================
-- PERMISSION-CHECKING HELPER (reused by future phases' RLS policies)
-- =========================================================================

-- SECURITY DEFINER because this function is called from RLS policies on tables
-- (users, role_permissions, permissions) that themselves have restrictive RLS. Running
-- as the function owner (the migration role, which has BYPASSRLS in Supabase) lets the lookup
-- succeed regardless of the calling user's own row-level access, without ever returning row
-- data to the caller — only a boolean.
create function public.has_permission(p_permission_key text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.role_permissions rp on rp.role_id = u.role_id
    join public.permissions p on p.id = rp.permission_id
    where u.id = auth.uid()
      and u.active = true
      and p.key = p_permission_key
  );
$$;

comment on function public.has_permission(text) is
  'Single source of truth for authorization checks in RLS policies. Always call this instead of '
  'inlining a role-name check directly into an RLS policy.';

-- New permission rows are automatically granted to Super Admin, so that role never has to be
-- manually re-synced whenever a later phase adds a new permission key.
create function public.grant_new_permission_to_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.role_permissions (role_id, permission_id)
  select r.id, new.id
  from public.roles r
  where r.name = 'Super Admin'
  on conflict do nothing;
  return new;
end;
$$;

create trigger auto_grant_super_admin
  after insert on public.permissions
  for each row execute function public.grant_new_permission_to_super_admin();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.sequences enable row level security;
alter table public.audit_logs enable row level security;

-- roles / permissions / role_permissions: any authenticated staff member may read them
-- (the admin UI needs to display role names and permission lists), but only someone holding
-- manage_roles_permissions may write.
create policy "roles_select_authenticated" on public.roles
  for select to authenticated
  using (true);

create policy "roles_write_managed" on public.roles
  for all to authenticated
  using (public.has_permission('manage_roles_permissions'))
  with check (public.has_permission('manage_roles_permissions'));

create policy "permissions_select_authenticated" on public.permissions
  for select to authenticated
  using (true);

create policy "permissions_write_managed" on public.permissions
  for all to authenticated
  using (public.has_permission('manage_roles_permissions'))
  with check (public.has_permission('manage_roles_permissions'));

create policy "role_permissions_select_authenticated" on public.role_permissions
  for select to authenticated
  using (true);

create policy "role_permissions_write_managed" on public.role_permissions
  for all to authenticated
  using (public.has_permission('manage_roles_permissions'))
  with check (public.has_permission('manage_roles_permissions'));

-- users: every staff member may read their own row (so the dashboard can render "signed in as
-- ..." without needing manage_users); only manage_users can read/write everyone else's.
create policy "users_select_self_or_managed" on public.users
  for select to authenticated
  using (id = auth.uid() or public.has_permission('manage_users'));

create policy "users_insert_managed" on public.users
  for insert to authenticated
  with check (public.has_permission('manage_users'));

create policy "users_update_managed" on public.users
  for update to authenticated
  using (public.has_permission('manage_users'))
  with check (public.has_permission('manage_users'));

create policy "users_delete_managed" on public.users
  for delete to authenticated
  using (public.has_permission('manage_users'));

-- settings: read and write both require manage_settings. Conservative design — relax later if a
-- specific setting genuinely needs broader read access.
create policy "settings_select_managed" on public.settings
  for select to authenticated
  using (public.has_permission('manage_settings'));

create policy "settings_write_managed" on public.settings
  for all to authenticated
  using (public.has_permission('manage_settings'))
  with check (public.has_permission('manage_settings'));

-- sequences: intentionally NO policies for authenticated/anon — access is only through the
-- SECURITY DEFINER functions above, never direct table reads/writes.

-- audit_logs: readable only with view_audit_logs; insertable by any authenticated user but only
-- for themselves (actor_id must match the caller, or null for system-generated entries); no
-- update/delete policy exists for anyone, which makes the log immutable at the RLS layer itself.
create policy "audit_logs_select_managed" on public.audit_logs
  for select to authenticated
  using (public.has_permission('view_audit_logs'));

create policy "audit_logs_insert_self" on public.audit_logs
  for insert to authenticated
  with check (actor_id = auth.uid() or actor_id is null);

-- =========================================================================
-- SEED DATA — Phase 0 roles and permissions only
-- =========================================================================

insert into public.roles (name, description) values
  ('Super Admin', 'Full system access. Automatically granted every permission as it is created.'),
  ('Admin / Manager', 'Operational management: leads, customers, packages, quotations, follow-ups.'),
  ('Sales Staff', 'Handles assigned leads, customers, quotations, follow-ups.'),
  ('Content Manager', 'Manages packages, itineraries, blog posts, FAQs, SEO.')
on conflict (name) do nothing;

insert into public.permissions (key, description) values
  ('manage_users', 'Create, edit, deactivate staff users and assign roles.'),
  ('manage_roles_permissions', 'Edit roles, permissions, and which permissions each role grants.'),
  ('manage_settings', 'View and edit non-sensitive runtime settings.'),
  ('view_audit_logs', 'Read the audit log.')
on conflict (key) do nothing;

-- Redundant with the auto_grant_super_admin trigger for these 4 rows (the trigger already
-- granted them), but kept explicit as a self-documenting guarantee that Super Admin
-- holds every Phase 0 permission. ON CONFLICT is required since the trigger got there first.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Super Admin'
on conflict (role_id, permission_id) do nothing;

-- Admin/Manager: operational visibility, no user/role administration.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('manage_settings', 'view_audit_logs')
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff and Content Manager receive no Phase 0 permissions — their capabilities are
-- entirely CRM-/CMS-specific and will be granted starting in Phase 1 and Phase 5 respectively.
