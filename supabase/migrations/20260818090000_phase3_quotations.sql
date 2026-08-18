-- Phase 3 — Quotations
-- Quotation builder, multiple package options/items, per-item pricing
-- (rack/B2B/custom/discount/final), status lifecycle, revision history,
-- messages/view-tracking log, public share-link view (future-ready for
-- WhatsApp/PDF per master plan §5 — those two remain explicitly deferred,
-- see comments below). Depends on Phase 0 (has_permission, set_updated_at,
-- generate_business_id) Phase 1 (leads, customers, lead_activities) and
-- Phase 2 (packages, package_images, media).

-- =============================================================================
-- QUOTATIONS
-- One row per quotation "version" in the sense that revising archives the
-- current state into quotation_revisions and reopens this same row to draft
-- (version incremented) rather than creating a new quotations row — so a
-- quotation keeps one stable id/URL/share_token across its whole lifecycle.
-- =============================================================================

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  lead_id uuid not null references public.leads(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  valid_until date,
  notes text,
  terms_and_conditions text,
  subtotal numeric not null default 0 check (subtotal >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total_amount numeric not null default 0 check (total_amount >= 0),
  currency text not null default 'INR',
  version int not null default 1 check (version >= 1),
  share_token uuid not null default gen_random_uuid() unique,
  view_count int not null default 0 check (view_count >= 0),
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quotations is
  'Lifecycle: draft -> sent -> viewed -> accepted/rejected/expired, enforced by '
  'enforce_quotation_status_transition_trg. Revising a non-draft, non-accepted '
  'quotation (create_quotation_revision()) archives current state into '
  'quotation_revisions and reopens this row to draft with version + 1 — the '
  'quotation_number/share_token/id never change across revisions. Never deleted '
  '(no delete policy), matching leads/customers — rejected/expired quotations '
  'stay as pipeline history. PDF generation and actual WhatsApp Business API '
  'sending are master-plan-labeled "future-ready" (§5), not Phase 3 requirements '
  '— not implemented here, same documented-gap treatment as Phase 2''s hotels/ '
  'vehicles. Web-link sharing and view tracking ARE implemented (share_token + '
  'get_quotation_by_token() below) since both are achievable without any '
  'external API.';

create index quotations_lead_id_idx on public.quotations(lead_id);
create index quotations_customer_id_idx on public.quotations(customer_id);
create index quotations_status_idx on public.quotations(status);
create index quotations_created_at_idx on public.quotations(created_at);

create trigger set_quotations_updated_at
  before update on public.quotations
  for each row execute function public.set_updated_at();

-- =============================================================================
-- QUOTATION_ITEMS
-- Multiple package options per quotation (master plan §5 "multiple quotation
-- items"). package_name/package_image_media_id are snapshots taken at add
-- time so a quotation's history stays intact even if the source package is
-- later renamed/deleted (package_id -> set null, package_name survives).
-- =============================================================================

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  package_id uuid references public.packages(id) on delete set null,
  package_name text not null,
  package_image_media_id uuid references public.media(id) on delete set null,
  rack_price numeric check (rack_price is null or rack_price >= 0),
  b2b_price numeric check (b2b_price is null or b2b_price >= 0),
  custom_price numeric check (custom_price is null or custom_price >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  discount_percent numeric check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100)),
  final_price numeric not null check (final_price >= 0),
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotation_items_package_name_not_blank check (length(trim(package_name)) > 0)
);

create index quotation_items_quotation_id_idx on public.quotation_items(quotation_id);

create trigger set_quotation_items_updated_at
  before update on public.quotation_items
  for each row execute function public.set_updated_at();

-- =============================================================================
-- QUOTATION_REVISIONS
-- Append-only. One row per archived version, holding a full JSON snapshot of
-- the quotation + its items at that version. No UPDATE/DELETE policy exists.
-- =============================================================================

create table public.quotation_revisions (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  version int not null,
  snapshot jsonb not null,
  change_note text,
  changed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint quotation_revisions_unique_version unique (quotation_id, version)
);

create index quotation_revisions_quotation_id_idx on public.quotation_revisions(quotation_id);

-- =============================================================================
-- QUOTATION_MESSAGES
-- Append-only message/history log — status changes, share-link views, and
-- manual staff notes. Distinct from quotation_revisions (full-state snapshots)
-- the way lead_activities is distinct from lead_notes in Phase 1.
-- =============================================================================

create table public.quotation_messages (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  channel text not null check (channel in ('status', 'web_link', 'whatsapp', 'email', 'note')),
  message text not null,
  metadata jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index quotation_messages_quotation_id_idx on public.quotation_messages(quotation_id);
create index quotation_messages_created_at_idx on public.quotation_messages(created_at);

comment on table public.quotation_messages is
  '''whatsapp''/''email'' channel values are reserved for Phase 4 (actual sending '
  'is a Phase 4 WhatsApp Business API concern, per the status doc''s explicit '
  'Phase 3 dependency note) — Phase 3 only ever writes ''status'', ''web_link'', '
  'and ''note'' rows.';

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Keeps quotations.total_amount derived from subtotal/discount_amount on every
-- insert/update, one single formula, instead of trusting callers to compute it.
create function public.sync_quotation_total()
returns trigger
language plpgsql
as $$
begin
  new.total_amount := greatest(coalesce(new.subtotal, 0) - coalesce(new.discount_amount, 0), 0);
  return new;
end;
$$;

create trigger sync_quotation_total_trg
  before insert or update on public.quotations
  for each row execute function public.sync_quotation_total();

-- Recomputes the parent quotation's subtotal whenever its items change. Only
-- writes subtotal — sync_quotation_total_trg (above) derives total_amount from
-- that same UPDATE statement, so the two triggers never fight over the formula.
create function public.recalc_quotation_subtotal()
returns trigger
language plpgsql
as $$
declare
  v_quotation_id uuid := coalesce(new.quotation_id, old.quotation_id);
begin
  update public.quotations
  set subtotal = (
    select coalesce(sum(final_price), 0)
    from public.quotation_items
    where quotation_id = v_quotation_id
  )
  where id = v_quotation_id;

  return coalesce(new, old);
end;
$$;

create trigger recalc_quotation_subtotal_trg
  after insert or update or delete on public.quotation_items
  for each row execute function public.recalc_quotation_subtotal();

-- Atomic quotation + items creation as a single statement, so a mid-request
-- failure can never leave a quotation with zero items. SECURITY INVOKER
-- (default) — every internal insert/select still runs under RLS as the
-- calling staff member, exactly like a direct client insert would.
create function public.create_quotation(
  p_lead_id uuid,
  p_valid_until date,
  p_notes text,
  p_terms_and_conditions text,
  p_discount_amount numeric,
  p_items jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_customer_id uuid;
  v_quotation_id uuid;
  v_quotation_number text;
  v_item jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one quotation item is required';
  end if;

  select customer_id into v_customer_id from public.leads where id = p_lead_id;
  if v_customer_id is null then
    raise exception 'Lead not found';
  end if;

  v_quotation_number := public.generate_business_id('QUO', 'quotation');

  insert into public.quotations (
    quotation_number, lead_id, customer_id, valid_until, notes,
    terms_and_conditions, discount_amount, created_by
  ) values (
    v_quotation_number, p_lead_id, v_customer_id, p_valid_until, p_notes,
    p_terms_and_conditions, coalesce(p_discount_amount, 0), auth.uid()
  )
  returning id into v_quotation_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'package_name', '') = '' then
      raise exception 'Each quotation item requires a package name';
    end if;

    insert into public.quotation_items (
      quotation_id, package_id, package_name, package_image_media_id,
      rack_price, b2b_price, custom_price, discount_amount, discount_percent,
      final_price, notes, sort_order
    ) values (
      v_quotation_id,
      nullif(v_item->>'package_id', '')::uuid,
      v_item->>'package_name',
      nullif(v_item->>'package_image_media_id', '')::uuid,
      nullif(v_item->>'rack_price', '')::numeric,
      nullif(v_item->>'b2b_price', '')::numeric,
      nullif(v_item->>'custom_price', '')::numeric,
      coalesce(nullif(v_item->>'discount_amount', '')::numeric, 0),
      nullif(v_item->>'discount_percent', '')::numeric,
      (v_item->>'final_price')::numeric,
      nullif(v_item->>'notes', ''),
      coalesce((v_item->>'sort_order')::int, 0)
    );
  end loop;

  return v_quotation_id;
end;
$$;

comment on function public.create_quotation(uuid, date, text, text, numeric, jsonb) is
  'Whole-request atomicity for "create quotation with N items" — a failure '
  'partway through rolls back the entire function call (single implicit '
  'transaction), so no orphaned zero-item quotation can ever be left behind.';

-- Every new quotation gets a "created" message + a lead_activities entry
-- (visible on the lead''s existing Activity tab — this IS the lead/customer
-- integration point), and nudges the lead forward to quotation_prepared if it
-- hasn''t progressed past Contacted yet. Never regresses a lead already
-- further along (e.g. Negotiation).
create function public.log_quotation_created()
returns trigger
language plpgsql
as $$
begin
  insert into public.quotation_messages (quotation_id, channel, message, created_by)
  values (new.id, 'status', format('Quotation %s created (draft)', new.quotation_number), auth.uid());

  insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
  values (
    new.lead_id, auth.uid(), 'quotation_created',
    format('Quotation %s created', new.quotation_number),
    jsonb_build_object('quotation_id', new.id, 'quotation_number', new.quotation_number)
  );

  update public.leads
  set status = 'quotation_prepared'
  where id = new.lead_id
    and status in ('new', 'contacted');

  return new;
end;
$$;

create trigger log_quotation_created_trg
  after insert on public.quotations
  for each row execute function public.log_quotation_created();

-- State machine. draft->sent requires send_quotations on top of the RLS
-- update policy's edit_quotations, mirroring enforce_lead_reassignment's
-- "RLS is the coarse gate, the trigger gives a specific readable error and
-- an extra permission check" pattern from Phase 1. draft is only reachable
-- from sent/viewed/rejected/expired via create_quotation_revision() below —
-- the app UI never exposes a bare "set status to draft" control.
create function public.enforce_quotation_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'draft' and new.status = 'sent')
    or (old.status = 'sent' and new.status in ('viewed', 'accepted', 'rejected', 'expired', 'draft'))
    or (old.status = 'viewed' and new.status in ('accepted', 'rejected', 'expired', 'draft'))
    or (old.status in ('rejected', 'expired') and new.status = 'draft')
  ) then
    raise exception 'Invalid quotation status transition: % -> %', old.status, new.status;
  end if;

  if new.status = 'sent' and not public.has_permission('send_quotations') then
    raise exception 'Missing send_quotations permission';
  end if;

  if new.status = 'sent' then
    new.sent_at := now();
  elsif new.status = 'accepted' then
    new.accepted_at := now();
  elsif new.status = 'rejected' then
    new.rejected_at := now();
  end if;

  return new;
end;
$$;

create trigger enforce_quotation_status_transition_trg
  before update on public.quotations
  for each row execute function public.enforce_quotation_status_transition();

-- Logs every status change (message + lead activity) and advances the lead to
-- quotation_sent the first time a quotation is actually sent, same
-- never-regress guard as log_quotation_created() above.
create function public.log_quotation_status_change()
returns trigger
language plpgsql
as $$
begin
  insert into public.quotation_messages (quotation_id, channel, message, created_by, metadata)
  values (
    new.id, 'status',
    format('Status changed from %s to %s', old.status, new.status),
    auth.uid(),
    jsonb_build_object('from', old.status, 'to', new.status)
  );

  insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
  values (
    new.lead_id, auth.uid(), 'quotation_status_changed',
    format('Quotation %s: %s -> %s', new.quotation_number, old.status, new.status),
    jsonb_build_object('quotation_id', new.id, 'from', old.status, 'to', new.status)
  );

  if new.status = 'sent' then
    update public.leads
    set status = 'quotation_sent'
    where id = new.lead_id
      and status in ('new', 'contacted', 'quotation_prepared');
  end if;

  return new;
end;
$$;

create trigger log_quotation_status_change_trg
  after update on public.quotations
  for each row
  when (new.status is distinct from old.status)
  execute function public.log_quotation_status_change();

-- Archives the current quotation+items state, then reopens the same row to
-- draft with version + 1. Refuses to revise a still-draft quotation (nothing
-- sent yet to preserve) or an accepted one (booking-committed; Phase 3.5
-- concern, not reopened here). SECURITY INVOKER — caller needs edit_quotations
-- via the normal quotations/quotation_revisions RLS policies below.
create function public.create_quotation_revision(p_quotation_id uuid, p_change_note text default null)
returns int
language plpgsql
as $$
declare
  v_quotation public.quotations;
  v_items jsonb;
  v_version int;
begin
  select * into v_quotation from public.quotations where id = p_quotation_id;
  if not found then
    raise exception 'Quotation not found';
  end if;

  if v_quotation.status = 'draft' then
    raise exception 'Quotation is already a draft';
  end if;
  if v_quotation.status = 'accepted' then
    raise exception 'An accepted quotation cannot be revised';
  end if;

  select coalesce(jsonb_agg(to_jsonb(i.*) order by i.sort_order), '[]'::jsonb)
  into v_items
  from public.quotation_items i
  where i.quotation_id = p_quotation_id;

  v_version := v_quotation.version;

  insert into public.quotation_revisions (quotation_id, version, snapshot, change_note, changed_by)
  values (
    p_quotation_id, v_version,
    jsonb_build_object('quotation', to_jsonb(v_quotation), 'items', v_items),
    p_change_note, auth.uid()
  );

  update public.quotations
  set version = version + 1, status = 'draft'
  where id = p_quotation_id;

  insert into public.quotation_messages (quotation_id, channel, message, created_by)
  values (
    p_quotation_id, 'note',
    case when p_change_note is not null and trim(p_change_note) <> ''
      then 'Revision created: ' || p_change_note
      else 'Revision created' end,
    auth.uid()
  );

  return v_version;
end;
$$;

-- Public share-link entry point (anon, no staff session) — mirrors
-- submit_enquiry()'s narrow SECURITY DEFINER pattern from Phase 1. No RLS
-- grant to anon on quotations/quotation_items/quotation_messages anywhere in
-- this migration; this single function is the only way anon ever reads or
-- affects a quotation row. Flips sent -> viewed on open (never overrides a
-- terminal accepted/rejected/expired status) and logs every open as a
-- quotation_messages row, satisfying master plan §5's "tracked for views".
create function public.get_quotation_by_token(p_share_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_result jsonb;
begin
  select id into v_id from public.quotations where share_token = p_share_token;
  if v_id is null then
    return null;
  end if;

  update public.quotations
  set view_count = view_count + 1,
      first_viewed_at = coalesce(first_viewed_at, now()),
      last_viewed_at = now(),
      status = case when status = 'sent' then 'viewed' else status end
  where id = v_id;

  insert into public.quotation_messages (quotation_id, channel, message)
  values (v_id, 'web_link', 'Quotation opened via share link');

  select jsonb_build_object(
    'quotation_number', q.quotation_number,
    'status', q.status,
    'valid_until', q.valid_until,
    'notes', q.notes,
    'terms_and_conditions', q.terms_and_conditions,
    'subtotal', q.subtotal,
    'discount_amount', q.discount_amount,
    'total_amount', q.total_amount,
    'currency', q.currency,
    'customer_name', c.name,
    'enquiry_number', l.enquiry_number,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'package_name', i.package_name,
        'image_path', m.storage_path,
        'rack_price', i.rack_price,
        'b2b_price', i.b2b_price,
        'custom_price', i.custom_price,
        'discount_amount', i.discount_amount,
        'final_price', i.final_price,
        'notes', i.notes
      ) order by i.sort_order), '[]'::jsonb)
      from public.quotation_items i
      left join public.media m on m.id = i.package_image_media_id
      where i.quotation_id = q.id
    )
  )
  into v_result
  from public.quotations q
  join public.customers c on c.id = q.customer_id
  join public.leads l on l.id = q.lead_id
  where q.id = v_id;

  return v_result;
end;
$$;

comment on function public.get_quotation_by_token(uuid) is
  'No explicit grant statement needed — Postgres grants EXECUTE on new '
  'functions to PUBLIC by default (same as submit_enquiry() in Phase 1), which '
  'is what lets the public /quote/[token] page call this as anon.';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.quotation_revisions enable row level security;
alter table public.quotation_messages enable row level security;

-- --- quotations: view_quotations_all sees everything; view_quotations_own
-- --- sees only quotations whose parent lead is assigned to them or
-- --- unassigned — identical scoping shape to leads_select_scoped in Phase 1.

create policy "quotations_select_scoped" on public.quotations
  for select to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = quotations.lead_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "quotations_insert_scoped" on public.quotations
  for insert to authenticated
  with check (
    public.has_permission('create_quotations')
    and created_by = auth.uid()
    and exists (
      select 1 from public.leads l
      where l.id = quotations.lead_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "quotations_update_scoped" on public.quotations
  for update to authenticated
  using (
    public.has_permission('edit_quotations')
    and exists (
      select 1 from public.leads l
      where l.id = quotations.lead_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  )
  with check (
    public.has_permission('edit_quotations')
    and exists (
      select 1 from public.leads l
      where l.id = quotations.lead_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

-- No delete policy — quotations are never deleted, matching leads/customers.

-- --- quotation_items: read matches parent quotation's scoping; write also
-- --- requires the parent quotation still be in draft (post-send, items are
-- --- frozen — the only way back to an editable state is create_quotation_revision()).

create policy "quotation_items_select_scoped" on public.quotation_items
  for select to authenticated
  using (
    exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_items.quotation_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "quotation_items_write_managed" on public.quotation_items
  for all to authenticated
  using (
    public.has_permission('edit_quotations')
    and exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_items.quotation_id
      and q.status = 'draft'
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  )
  with check (
    public.has_permission('edit_quotations')
    and exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_items.quotation_id
      and q.status = 'draft'
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

-- --- quotation_revisions: read matches parent scoping; insert only via
-- --- create_quotation_revision() (SECURITY INVOKER, so this policy still
-- --- applies to it) — no update/delete, append-only like lead_activities.

create policy "quotation_revisions_select_scoped" on public.quotation_revisions
  for select to authenticated
  using (
    exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_revisions.quotation_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "quotation_revisions_insert_scoped" on public.quotation_revisions
  for insert to authenticated
  with check (
    public.has_permission('edit_quotations')
    and exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_revisions.quotation_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

-- --- quotation_messages: read matches parent scoping; insert only requires
-- --- "can see this quotation" (not edit_quotations) — same shape as Phase 1's
-- --- lead_activities_insert_scoped, since this table is also written by
-- --- triggers running as the invoking staff member during ordinary
-- --- view/update statements they already had access to perform. No
-- --- update/delete — append-only.

create policy "quotation_messages_select_scoped" on public.quotation_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_messages.quotation_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "quotation_messages_insert_scoped" on public.quotation_messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.quotations q
      join public.leads l on l.id = q.lead_id
      where q.id = quotation_messages.quotation_id
      and (
        public.has_permission('view_quotations_all')
        or (public.has_permission('view_quotations_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

-- =============================================================================
-- PERMISSIONS & SEED DATA
-- =============================================================================

insert into public.permissions (key, description) values
  ('view_quotations_own', 'View quotations for leads assigned to you, or unassigned.'),
  ('view_quotations_all', 'View every quotation regardless of lead assignment.'),
  ('create_quotations', 'Create a new quotation for a lead.'),
  ('edit_quotations', 'Edit quotation details/items, change status, create revisions.'),
  ('send_quotations', 'Transition a quotation from draft to sent.')
on conflict (key) do nothing;

-- Admin / Manager: full quotation operational access.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_quotations_all', 'create_quotations', 'edit_quotations', 'send_quotations'
)
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff: own-assigned-leads scope only, per master plan §10
-- ("Sales Staff: Assigned leads, Customer records, Quotations, ...").
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_quotations_own', 'create_quotations', 'edit_quotations', 'send_quotations'
)
where r.name = 'Sales Staff'
on conflict (role_id, permission_id) do nothing;

-- Content Manager: no quotation access — not listed under their §10 scope
-- (Pages, Page Builder, Blog, Banners, FAQs, Testimonials, SEO).
