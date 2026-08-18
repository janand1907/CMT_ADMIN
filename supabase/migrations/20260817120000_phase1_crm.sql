-- Phase 1 — CRM
-- Enquiry capture, lead pipeline, customer records, notes, activity timeline,
-- follow-ups, tasks, lead tags, lead source tracking.
-- Depends on Phase 0 (roles/permissions/has_permission/generate_business_id).

-- =========================================================================
-- LEAD_SOURCES (catalog)
-- =========================================================================

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.lead_sources is
  'Marketing/channel catalog a lead came from (Google, Direct, Referral, ...). '
  'Managed by staff holding manage_lead_metadata.';

-- =========================================================================
-- LEAD_TAGS (catalog)
-- =========================================================================

create table public.lead_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- CUSTOMERS
-- One row per unique phone number. The public enquiry function and the staff
-- "add lead" flow both dedupe against this table via find_or_create_customer()
-- below, so the same person submitting twice never creates two customer rows.
-- =========================================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_phone_key unique (phone),
  constraint customers_name_not_blank check (length(trim(name)) > 0),
  constraint customers_phone_not_blank check (length(trim(phone)) > 0)
);

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- =========================================================================
-- LEADS
-- "Lead" and "enquiry" are the same record — enquiry_number is the
-- human-readable business ID (CMT-2026-0001) generated via generate_business_id().
-- =========================================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  enquiry_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  destination text,
  departure_city text,
  travel_date date,
  return_date date,
  adults int not null default 0,
  kids int not null default 0,
  infants int not null default 0,
  package_interested text,
  budget numeric,
  message text,
  submitted_page text,
  source_id uuid references public.lead_sources(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  status text not null default 'new' check (status in (
    'new', 'contacted', 'quotation_prepared', 'quotation_sent', 'follow_up',
    'negotiation', 'confirmed', 'not_interested', 'lost', 'cancelled'
  )),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_person_counts_not_negative check (adults >= 0 and kids >= 0 and infants >= 0)
);

comment on table public.leads is
  'Lead pipeline: new -> contacted -> quotation_prepared -> quotation_sent -> '
  'follow_up -> negotiation -> confirmed, or not_interested / lost / cancelled. '
  'Leads are never deleted (no delete_leads permission exists) — closed leads are '
  'status-transitioned instead, so pipeline history is never lost.';

create index leads_customer_id_idx on public.leads(customer_id);
create index leads_assigned_to_idx on public.leads(assigned_to);
create index leads_status_idx on public.leads(status);
create index leads_source_id_idx on public.leads(source_id);
create index leads_created_at_idx on public.leads(created_at);

create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- =========================================================================
-- LEAD_NOTES
-- =========================================================================

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  note text not null check (length(trim(note)) > 0),
  created_at timestamptz not null default now()
);

create index lead_notes_lead_id_idx on public.lead_notes(lead_id);

-- =========================================================================
-- LEAD_ACTIVITIES
-- Append-only timeline. Status/priority/assignment changes and lead creation
-- are logged by triggers below, so those entries can never be forgotten by
-- application code. No UPDATE/DELETE policies are granted, mirroring audit_logs.
-- =========================================================================

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index lead_activities_lead_id_idx on public.lead_activities(lead_id);
create index lead_activities_created_at_idx on public.lead_activities(created_at);

-- =========================================================================
-- LEAD_FOLLOWUPS
-- Lightweight scheduled-contact reminders (one lead can have several over its
-- life). Distinct from lead_tasks below, which is the typed general task queue.
-- =========================================================================

create table public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  scheduled_at timestamptz not null,
  notes text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index lead_followups_lead_id_idx on public.lead_followups(lead_id);
create index lead_followups_scheduled_at_idx on public.lead_followups(scheduled_at);

-- =========================================================================
-- LEAD_TASKS
-- =========================================================================

create table public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (type in ('call', 'send_quotation', 'follow_up', 'request_payment', 'confirm_booking')),
  due_at timestamptz,
  assigned_to uuid references public.users(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'cancelled')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lead_tasks_lead_id_idx on public.lead_tasks(lead_id);
create index lead_tasks_assigned_to_idx on public.lead_tasks(assigned_to);
create index lead_tasks_status_idx on public.lead_tasks(status);

create trigger set_lead_tasks_updated_at
  before update on public.lead_tasks
  for each row execute function public.set_updated_at();

-- =========================================================================
-- LEAD_TAG_ASSIGNMENTS (join table)
-- =========================================================================

create table public.lead_tag_assignments (
  lead_id uuid not null references public.leads(id) on delete cascade,
  tag_id uuid not null references public.lead_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (lead_id, tag_id)
);

create index lead_tag_assignments_tag_id_idx on public.lead_tag_assignments(tag_id);

-- =========================================================================
-- FUNCTIONS
-- =========================================================================

-- Dedupe-by-phone, shared by submit_enquiry() (public intake) and the staff
-- "add lead" flow, so the "same phone number never creates two customers" rule
-- lives in exactly one place. Plain invoker security — normal manage_customers
-- RLS applies when called directly by a staff session; submit_enquiry() below
-- calls it from within its own SECURITY DEFINER context for the public path.
create function public.find_or_create_customer(
  p_name text,
  p_phone text,
  p_whatsapp text default null,
  p_email text default null,
  p_location text default null
)
returns uuid
language plpgsql
as $$
declare
  v_customer_id uuid;
begin
  select id into v_customer_id from public.customers where phone = p_phone;

  if v_customer_id is null then
    insert into public.customers (name, phone, whatsapp, email, location)
    values (p_name, p_phone, coalesce(p_whatsapp, p_phone), p_email, p_location)
    returning id into v_customer_id;
  else
    -- Never overwrite a value staff/customer already gave us with a blank one.
    update public.customers
    set whatsapp = coalesce(customers.whatsapp, p_whatsapp, p_phone),
        email = coalesce(customers.email, p_email),
        location = coalesce(customers.location, p_location)
    where id = v_customer_id;
  end if;

  return v_customer_id;
end;
$$;

-- Public enquiry intake. SECURITY DEFINER so the public site (anon role, no
-- staff session) can create a customer + lead without any table-level RLS
-- grant to anon — this single narrow function is the only write surface
-- exposed to the public, instead of widening RLS or using the service-role key.
create function public.submit_enquiry(
  p_name text,
  p_phone text,
  p_email text default null,
  p_whatsapp text default null,
  p_departure_city text default null,
  p_travel_date date default null,
  p_persons int default null,
  p_package_interested text default null,
  p_message text default null,
  p_submitted_page text default null,
  p_source_name text default null
)
returns table(enquiry_number text, lead_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_source_id uuid;
  v_enquiry_number text;
  v_lead_id uuid;
begin
  if p_name is null or trim(p_name) = '' then
    raise exception 'name is required';
  end if;
  if p_phone is null or trim(p_phone) = '' then
    raise exception 'phone is required';
  end if;

  v_customer_id := public.find_or_create_customer(p_name, p_phone, p_whatsapp, p_email, null);

  select id into v_source_id from public.lead_sources where name = p_source_name;
  if v_source_id is null then
    select id into v_source_id from public.lead_sources where name = 'Direct';
  end if;

  v_enquiry_number := public.generate_business_id('CMT', 'enquiry');

  insert into public.leads (
    enquiry_number, customer_id, departure_city, travel_date, adults,
    package_interested, message, submitted_page, source_id
  ) values (
    v_enquiry_number, v_customer_id, p_departure_city, p_travel_date, coalesce(p_persons, 0),
    p_package_interested, p_message, p_submitted_page, v_source_id
  )
  returning id into v_lead_id;

  return query select v_enquiry_number, v_lead_id;
end;
$$;

comment on function public.submit_enquiry is
  'The only write path the public site uses for enquiries. Validation/rate-limiting/honeypot '
  'run in app/api/enquiry/route.js before this is called; this function only does the DB work.';

-- Every lead gets a "created" timeline entry, regardless of whether it came
-- through submit_enquiry() (public, actor_id null) or a staff insert.
create function public.log_lead_created()
returns trigger
language plpgsql
as $$
begin
  insert into public.lead_activities (lead_id, actor_id, action, description)
  values (
    new.id,
    auth.uid(),
    'created',
    case when new.submitted_page is not null
      then 'Enquiry submitted via ' || new.submitted_page
      else 'Enquiry submitted'
    end
  );
  return new;
end;
$$;

create trigger log_lead_created_trg
  after insert on public.leads
  for each row execute function public.log_lead_created();

-- Status/priority/assignment changes are logged unconditionally by this
-- trigger so no code path (quick-status dropdown, full edit form, future
-- Phase 3/4 automation) can forget to write a timeline entry for them.
create function public.log_lead_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
    values (
      new.id, auth.uid(), 'status_changed',
      format('Status changed from %s to %s', old.status, new.status),
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  if new.priority is distinct from old.priority then
    insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
    values (
      new.id, auth.uid(), 'priority_changed',
      format('Priority changed from %s to %s', old.priority, new.priority),
      jsonb_build_object('from', old.priority, 'to', new.priority)
    );
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
    values (
      new.id, auth.uid(), 'assigned',
      case when new.assigned_to is null then 'Lead unassigned' else 'Lead assigned' end,
      jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to)
    );
  end if;

  return new;
end;
$$;

create trigger log_lead_status_change_trg
  after update on public.leads
  for each row execute function public.log_lead_status_change();

-- RLS's own USING/WITH CHECK on leads already blocks a non-assign_leads holder
-- from reassigning a lead to anyone but themself (see leads_update policy
-- below) — this trigger runs first and raises a specific, readable error
-- instead of RLS's generic "row violates row-level security policy".
create function public.enforce_lead_reassignment()
returns trigger
language plpgsql
as $$
begin
  if new.assigned_to is distinct from old.assigned_to and not public.has_permission('assign_leads') then
    if not (
      (old.assigned_to is null and new.assigned_to = auth.uid())
      or (old.assigned_to = auth.uid() and new.assigned_to is null)
    ) then
      raise exception 'You do not have permission to reassign this lead.';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_lead_reassignment_trg
  before update on public.leads
  for each row execute function public.enforce_lead_reassignment();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.lead_sources enable row level security;
alter table public.lead_tags enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_followups enable row level security;
alter table public.lead_tasks enable row level security;
alter table public.lead_tag_assignments enable row level security;

-- --- lead_sources / lead_tags: catalogs any authenticated staff can read; only
-- --- manage_lead_metadata holders can maintain them.

create policy "lead_sources_select_authenticated" on public.lead_sources
  for select to authenticated
  using (true);

create policy "lead_sources_write_managed" on public.lead_sources
  for all to authenticated
  using (public.has_permission('manage_lead_metadata'))
  with check (public.has_permission('manage_lead_metadata'));

create policy "lead_tags_select_authenticated" on public.lead_tags
  for select to authenticated
  using (true);

create policy "lead_tags_write_managed" on public.lead_tags
  for all to authenticated
  using (public.has_permission('manage_lead_metadata'))
  with check (public.has_permission('manage_lead_metadata'));

-- --- customers: single manage_customers permission covers full CRUD. No
-- --- delete policy — customer records are never deleted through the app.

create policy "customers_select_managed" on public.customers
  for select to authenticated
  using (public.has_permission('manage_customers'));

create policy "customers_insert_managed" on public.customers
  for insert to authenticated
  with check (public.has_permission('manage_customers'));

create policy "customers_update_managed" on public.customers
  for update to authenticated
  using (public.has_permission('manage_customers'))
  with check (public.has_permission('manage_customers'));

-- --- leads: view_leads_all sees everything; view_leads_own sees only leads
-- --- assigned to them or unassigned. No delete policy — leads are status-
-- --- transitioned (not_interested/lost/cancelled), never deleted.

create policy "leads_select_scoped" on public.leads
  for select to authenticated
  using (
    public.has_permission('view_leads_all')
    or (public.has_permission('view_leads_own') and (assigned_to = auth.uid() or assigned_to is null))
  );

create policy "leads_insert_managed" on public.leads
  for insert to authenticated
  with check (public.has_permission('create_leads'));

create policy "leads_update_scoped" on public.leads
  for update to authenticated
  using (
    public.has_permission('edit_leads')
    and (
      public.has_permission('view_leads_all')
      or (public.has_permission('view_leads_own') and (assigned_to = auth.uid() or assigned_to is null))
    )
  )
  with check (
    public.has_permission('edit_leads')
    and (public.has_permission('view_leads_all') or assigned_to = auth.uid() or assigned_to is null)
  );

-- --- lead_notes / lead_activities / lead_followups / lead_tasks / lead_tag_assignments:
-- --- all scoped to "can the caller see the parent lead", matching leads_select_scoped.

create policy "lead_notes_select_scoped" on public.lead_notes
  for select to authenticated
  using (exists (
    select 1 from public.leads l
    where l.id = lead_notes.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_notes_insert_scoped" on public.lead_notes
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.has_permission('edit_leads')
    and exists (
      select 1 from public.leads l
      where l.id = lead_notes.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  );

create policy "lead_notes_update_own" on public.lead_notes
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "lead_notes_delete_own_or_managed" on public.lead_notes
  for delete to authenticated
  using (author_id = auth.uid() or public.has_permission('view_leads_all'));

create policy "lead_activities_select_scoped" on public.lead_activities
  for select to authenticated
  using (exists (
    select 1 from public.leads l
    where l.id = lead_activities.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_activities_insert_scoped" on public.lead_activities
  for insert to authenticated
  with check (exists (
    select 1 from public.leads l
    where l.id = lead_activities.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_followups_select_scoped" on public.lead_followups
  for select to authenticated
  using (exists (
    select 1 from public.leads l
    where l.id = lead_followups.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_followups_write_managed" on public.lead_followups
  for all to authenticated
  using (
    public.has_permission('manage_followups')
    and exists (
      select 1 from public.leads l
      where l.id = lead_followups.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  )
  with check (
    public.has_permission('manage_followups')
    and exists (
      select 1 from public.leads l
      where l.id = lead_followups.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  );

create policy "lead_tasks_select_scoped" on public.lead_tasks
  for select to authenticated
  using (exists (
    select 1 from public.leads l
    where l.id = lead_tasks.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_tasks_write_managed" on public.lead_tasks
  for all to authenticated
  using (
    public.has_permission('manage_tasks')
    and exists (
      select 1 from public.leads l
      where l.id = lead_tasks.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  )
  with check (
    public.has_permission('manage_tasks')
    and exists (
      select 1 from public.leads l
      where l.id = lead_tasks.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  );

create policy "lead_tag_assignments_select_scoped" on public.lead_tag_assignments
  for select to authenticated
  using (exists (
    select 1 from public.leads l
    where l.id = lead_tag_assignments.lead_id
      and (
        public.has_permission('view_leads_all')
        or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
  ));

create policy "lead_tag_assignments_write_scoped" on public.lead_tag_assignments
  for all to authenticated
  using (
    public.has_permission('edit_leads')
    and exists (
      select 1 from public.leads l
      where l.id = lead_tag_assignments.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  )
  with check (
    public.has_permission('edit_leads')
    and exists (
      select 1 from public.leads l
      where l.id = lead_tag_assignments.lead_id
        and (
          public.has_permission('view_leads_all')
          or (public.has_permission('view_leads_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
        )
    )
  );

-- Staff directory read needed to populate "assign to" pickers. Sales Staff
-- (view_leads_own only) never need this: view_leads_own only ever surfaces
-- assigned_to = self or null, both resolvable without a directory lookup.
drop policy if exists "users_select_self_or_managed" on public.users;

create policy "users_select_self_or_managed" on public.users
  for select to authenticated
  using (id = auth.uid() or public.has_permission('manage_users') or public.has_permission('assign_leads'));

-- =========================================================================
-- PERMISSIONS & SEED DATA
-- =========================================================================

insert into public.permissions (key, description) values
  ('view_leads_own', 'View leads/enquiries assigned to you, or unassigned.'),
  ('view_leads_all', 'View every lead/enquiry regardless of assignment.'),
  ('create_leads', 'Manually create a lead/enquiry.'),
  ('edit_leads', 'Edit lead details, status, priority, notes, tags.'),
  ('assign_leads', 'Assign or reassign a lead to any staff member.'),
  ('manage_customers', 'Create and edit customer profiles.'),
  ('manage_lead_metadata', 'Manage the lead tag and lead source catalogs.'),
  ('manage_followups', 'Schedule and complete lead follow-ups.'),
  ('manage_tasks', 'Create and manage lead tasks.')
on conflict (key) do nothing;

-- Admin / Manager: full CRM operational access.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_leads_all', 'create_leads', 'edit_leads', 'assign_leads',
  'manage_customers', 'manage_lead_metadata', 'manage_followups', 'manage_tasks'
)
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff: their assigned (or unassigned) leads, customer records, follow-ups, tasks.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_leads_own', 'edit_leads', 'manage_customers', 'manage_followups', 'manage_tasks'
)
where r.name = 'Sales Staff'
on conflict (role_id, permission_id) do nothing;

-- Content Manager receives no CRM permissions — its scope is Phase 5 (CMS).

insert into public.lead_sources (name) values
  ('Google'), ('Organic SEO'), ('Facebook'), ('Instagram'),
  ('WhatsApp'), ('Direct'), ('Referral'), ('Other')
on conflict (name) do nothing;

insert into public.lead_tags (name, color) values
  ('HOT', 'red'),
  ('VIP', 'purple'),
  ('Family', 'blue'),
  ('Group', 'indigo'),
  ('Corporate', 'gray'),
  ('Budget', 'amber'),
  ('Urgent', 'red'),
  ('High Value', 'green')
on conflict (name) do nothing;
