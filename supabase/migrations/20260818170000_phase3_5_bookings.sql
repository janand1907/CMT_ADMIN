-- Phase 3.5 — Booking Foundation
-- The master plan does not define a detailed booking lifecycle or commercial
-- model (see CONNECTMYTOURS_STATUS.md "Phase 3.5" entry) — this migration
-- implements only the scope explicitly authorized by the user in place of the
-- missing master-plan section: fixed booking_status/payment_status vocab, no
-- payment gateway integration, one booking per accepted quotation. Depends on
-- Phase 0 (has_permission, set_updated_at, generate_business_id), Phase 1
-- (leads, customers, lead_activities), Phase 3 (quotations).

-- =============================================================================
-- BOOKINGS
-- One booking per accepted quotation (unique quotation_id below) — a
-- quotation already represents one committed package deal, so there is no
-- scenario in this authorized scope where one quotation produces multiple
-- bookings. lead_id/customer_id are copied from the quotation at creation
-- time rather than re-derived via a join on every read, mirroring how
-- quotation_items snapshots package_name instead of always joining packages.
-- =============================================================================

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  quotation_id uuid not null unique references public.quotations(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  travel_start_date date not null,
  travel_end_date date,
  total_amount numeric not null check (total_amount >= 0),
  amount_paid numeric not null default 0 check (amount_paid >= 0),
  balance_amount numeric generated always as (total_amount - amount_paid) stored,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid', 'refunded')),
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_travel_dates_order check (travel_end_date is null or travel_end_date >= travel_start_date),
  constraint bookings_amount_paid_not_over_total check (amount_paid <= total_amount)
);

comment on table public.bookings is
  'Authorized Phase 3.5 scope only: booking_status in (pending, confirmed, '
  'completed, cancelled), payment_status in (pending, partial, paid, refunded) '
  'as bare state tracking with no payment gateway/collection integration. One '
  'booking per quotation (unique quotation_id), created only from an accepted '
  'quotation via create_booking() below. Never deleted (no delete policy), '
  'matching leads/customers/quotations — cancellation is a booking_status '
  'value, not row removal.';

create index bookings_lead_id_idx on public.bookings(lead_id);
create index bookings_customer_id_idx on public.bookings(customer_id);
create index bookings_booking_status_idx on public.bookings(booking_status);
create index bookings_created_at_idx on public.bookings(created_at);

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Atomic accepted-quotation -> booking creation. SECURITY INVOKER (default) —
-- caller still needs create_bookings plus the same lead-scoping the RLS
-- insert policy below enforces, exactly like create_quotation() in Phase 3.
create function public.create_booking(
  p_quotation_id uuid,
  p_travel_start_date date,
  p_travel_end_date date default null,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_quotation public.quotations;
  v_booking_id uuid;
  v_booking_number text;
begin
  select * into v_quotation from public.quotations where id = p_quotation_id;
  if not found then
    raise exception 'Quotation not found';
  end if;

  if v_quotation.status != 'accepted' then
    raise exception 'A booking can only be created from an accepted quotation';
  end if;

  if exists (select 1 from public.bookings where quotation_id = p_quotation_id) then
    raise exception 'A booking already exists for this quotation';
  end if;

  if p_travel_start_date is null then
    raise exception 'Travel start date is required';
  end if;

  v_booking_number := public.generate_business_id('BKG', 'bookings');

  insert into public.bookings (
    booking_number, quotation_id, lead_id, customer_id,
    travel_start_date, travel_end_date, total_amount, notes, created_by
  ) values (
    v_booking_number, p_quotation_id, v_quotation.lead_id, v_quotation.customer_id,
    p_travel_start_date, p_travel_end_date, v_quotation.total_amount, p_notes, auth.uid()
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

comment on function public.create_booking(uuid, date, date, text) is
  'Only supported way to create a booking — enforces accepted-quotation-only '
  'and one-booking-per-quotation at the application layer, ahead of the '
  'unique constraint that also guards it at the storage layer.';

-- Every new booking gets a lead_activities entry, visible on the lead's
-- existing Activity tab — mirrors log_quotation_created() in Phase 3. Not
-- SECURITY DEFINER: relies on lead_activities_insert_scoped (Phase 1) letting
-- the acting user write an activity for a lead they already have visibility
-- into, which create_booking()'s own RLS-gated insert already guaranteed.
create function public.log_booking_created()
returns trigger
language plpgsql
as $$
begin
  insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
  values (
    new.lead_id, auth.uid(), 'booking_created',
    format('Booking %s created', new.booking_number),
    jsonb_build_object('booking_id', new.id, 'booking_number', new.booking_number, 'quotation_id', new.quotation_id)
  );
  return new;
end;
$$;

create trigger log_booking_created_trg
  after insert on public.bookings
  for each row execute function public.log_booking_created();

-- All booking_status transitions in this authorized scope are staff-initiated
-- (unlike quotations, bookings have no public/customer-facing page or
-- SECURITY DEFINER side-effect path, so there is no system-controlled
-- transition to separate out here — every transition is gated purely by the
-- bookings_update_scoped RLS policy below, requiring edit_bookings). Terminal
-- states (completed, cancelled) have no further transitions.
create function public.enforce_booking_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.booking_status = old.booking_status then
    return new;
  end if;

  if not (
    (old.booking_status = 'pending' and new.booking_status in ('confirmed', 'cancelled'))
    or (old.booking_status = 'confirmed' and new.booking_status in ('completed', 'cancelled'))
  ) then
    raise exception 'Invalid booking status transition: % -> %', old.booking_status, new.booking_status;
  end if;

  return new;
end;
$$;

create trigger enforce_booking_status_transition_trg
  before update on public.bookings
  for each row execute function public.enforce_booking_status_transition();

-- Logs the status change on the lead's Activity tab and — the one
-- system-meaningful side effect in this scope — advances the lead to
-- 'confirmed' the first time its booking is confirmed, using the same
-- never-regress guard as quotation_prepared/quotation_sent in Phase 3 (only
-- moves leads still in an earlier, non-terminal state). leads.status already
-- has a 'confirmed' value with no other writer, and the master plan's
-- Dashboard KPI "Confirmed bookings" (§2) has no meaning without this link.
-- Relies on the same RLS fact log_quotation_status_change() already depends
-- on: every role granted edit_bookings (Admin/Manager, Sales Staff) is also
-- granted edit_leads from Phase 1, so this update satisfies leads_update_scoped.
create function public.log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
  values (
    new.lead_id, auth.uid(), 'booking_status_change',
    format('Booking %s status changed %s -> %s', new.booking_number, old.booking_status, new.booking_status),
    jsonb_build_object('booking_id', new.id, 'from', old.booking_status, 'to', new.booking_status)
  );

  if new.booking_status = 'confirmed' then
    update public.leads
    set status = 'confirmed'
    where id = new.lead_id
      and status not in ('confirmed', 'not_interested', 'lost', 'cancelled');
  end if;

  return new;
end;
$$;

create trigger log_booking_status_change_trg
  after update on public.bookings
  for each row
  when (new.booking_status is distinct from old.booking_status)
  execute function public.log_booking_status_change();

-- payment_status/amount_paid is bare state tracking only (no gateway) —
-- recorded on the Activity tab the same way a status change is, so payment
-- updates show up in the lead's history without a separate ledger table
-- (a ledger is out of the authorized scope).
create function public.log_booking_payment_change()
returns trigger
language plpgsql
as $$
begin
  insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
  values (
    new.lead_id, auth.uid(), 'booking_payment_change',
    format('Booking %s payment: %s (paid %s of %s)', new.booking_number, new.payment_status, new.amount_paid, new.total_amount),
    jsonb_build_object(
      'booking_id', new.id, 'payment_status', new.payment_status,
      'amount_paid', new.amount_paid, 'total_amount', new.total_amount
    )
  );
  return new;
end;
$$;

create trigger log_booking_payment_change_trg
  after update on public.bookings
  for each row
  when (new.payment_status is distinct from old.payment_status or new.amount_paid is distinct from old.amount_paid)
  execute function public.log_booking_payment_change();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.bookings enable row level security;

-- Same own/all scoping shape as quotations_select_scoped in Phase 3, joined
-- through the booking's own lead_id.
create policy "bookings_select_scoped" on public.bookings
  for select to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = bookings.lead_id
      and (
        public.has_permission('view_bookings_all')
        or (public.has_permission('view_bookings_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "bookings_insert_scoped" on public.bookings
  for insert to authenticated
  with check (
    public.has_permission('create_bookings')
    and exists (
      select 1 from public.leads l
      where l.id = bookings.lead_id
      and (
        public.has_permission('view_bookings_all')
        or (public.has_permission('view_bookings_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "bookings_update_scoped" on public.bookings
  for update to authenticated
  using (
    public.has_permission('edit_bookings')
    and exists (
      select 1 from public.leads l
      where l.id = bookings.lead_id
      and (
        public.has_permission('view_bookings_all')
        or (public.has_permission('view_bookings_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  )
  with check (
    public.has_permission('edit_bookings')
    and exists (
      select 1 from public.leads l
      where l.id = bookings.lead_id
      and (
        public.has_permission('view_bookings_all')
        or (public.has_permission('view_bookings_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

-- No delete policy — bookings are never deleted, matching leads/customers/
-- quotations. Cancellation is a booking_status value, not row removal.

-- =============================================================================
-- PERMISSIONS & SEED DATA
-- =============================================================================

insert into public.permissions (key, description) values
  ('view_bookings_own', 'View bookings for leads assigned to you, or unassigned.'),
  ('view_bookings_all', 'View every booking regardless of lead assignment.'),
  ('create_bookings', 'Create a booking from an accepted quotation.'),
  ('edit_bookings', 'Edit booking travel/payment details and change booking status.')
on conflict (key) do nothing;

-- Admin / Manager: full booking operational access, same shape as their
-- quotations grant in Phase 3.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('view_bookings_all', 'create_bookings', 'edit_bookings')
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff: own-assigned-leads scope only, same shape as their quotations
-- grant (view_own + create + edit, no *_all).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('view_bookings_own', 'create_bookings', 'edit_bookings')
where r.name = 'Sales Staff'
on conflict (role_id, permission_id) do nothing;

-- Content Manager: no booking access — not listed under their §10 scope
-- (Pages, Page Builder, Blog, Banners, FAQs, Testimonials, SEO), same as
-- quotations. Super Admin is auto-granted every permission via the existing
-- Phase 0 grant_new_permission_to_super_admin trigger.
