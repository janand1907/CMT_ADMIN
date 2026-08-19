-- Phase 4 — WhatsApp Automation & Campaigns
-- Implements master plan §6 exactly: enquiry confirmation, quotation message
-- send (reusing the 'whatsapp' channel already reserved on quotation_messages
-- since Phase 3 — see its comment there), morning/evening follow-up
-- automation matched via Phase 2's match_packages_for_lead(), automation
-- controls + stop conditions enforced server-side/database-side, centrally
-- managed WhatsApp Business templates, and campaigns. Table/function names
-- mirror the pre-existing teardown record in
-- 20260816120000_phase1_4_teardown.sql exactly, per explicit instruction to
-- reuse the already-approved schema shape rather than inventing a new one.
-- Depends on Phase 0 (has_permission, set_updated_at), Phase 1 (leads,
-- customers, lead_activities), Phase 2 (match_packages_for_lead — called from
-- application code, not from SQL here), Phase 3 (quotations,
-- quotation_messages), Phase 3.5 (bookings).

-- =============================================================================
-- WHATSAPP_TEMPLATES
-- =============================================================================

create table public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  purpose text not null check (purpose in (
    'enquiry_confirmation', 'quotation', 'followup_morning', 'followup_evening', 'campaign', 'manual'
  )),
  category text not null default 'utility' check (category in ('utility', 'marketing', 'authentication')),
  language text not null default 'en',
  provider_template_name text,
  header_text text,
  body_text text not null check (length(trim(body_text)) > 0),
  footer_text text,
  variables jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.whatsapp_templates is
  'Centrally managed WhatsApp Business message templates (master plan §6 '
  'Template Management). purpose selects which template automated sends use '
  '(enquiry_confirmation/quotation/followup_morning/followup_evening); '
  'campaign/manual templates are chosen explicitly by staff. '
  'provider_template_name must match an approved template name in the '
  'WhatsApp Business Cloud API — sending fails cleanly (not silently) if it '
  'does not. status=inactive is the only supported deactivation path — '
  'templates are never deleted, so historical messages keep a valid '
  'template reference.';

create index whatsapp_templates_purpose_idx on public.whatsapp_templates(purpose);

create trigger set_whatsapp_templates_updated_at
  before update on public.whatsapp_templates
  for each row execute function public.set_updated_at();

-- =============================================================================
-- AUTOMATION_RULES
-- =============================================================================

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default Follow-up Automation',
  status text not null default 'paused' check (status in ('active', 'paused', 'stopped')),
  morning_time time not null default '10:00',
  evening_time time not null default '17:00',
  followup_duration_days int not null default 7 check (followup_duration_days > 0),
  max_messages int not null default 4 check (max_messages > 0),
  eligible_lead_statuses text[] not null default array['new', 'contacted', 'follow_up'],
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.automation_rules is
  'Global follow-up automation configuration (master plan §6 Automation '
  'Controls: enable/disable, morning/evening time, follow-up duration, max '
  'messages, eligible lead statuses). status is the master engine switch; '
  'per-lead pause/resume/stop lives separately in '
  'lead_followup_automation_state so one lead can be stopped without '
  'touching the global config. Defaults to status=paused so automation never '
  'sends until an Admin/Manager explicitly turns it on. Single-row usage is '
  'expected — get_eligible_followup_leads()/claim_followup_send() both read '
  'the earliest row — but is not schema-enforced.';

create trigger set_automation_rules_updated_at
  before update on public.automation_rules
  for each row execute function public.set_updated_at();

insert into public.automation_rules (name) values ('Default Follow-up Automation');

-- =============================================================================
-- LEAD_FOLLOWUP_AUTOMATION_STATE
-- =============================================================================

create table public.lead_followup_automation_state (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'stopped', 'completed')),
  stop_reason text check (stop_reason in (
    'customer_booked', 'customer_opt_out', 'lead_not_interested', 'lead_lost',
    'lead_cancelled', 'admin_manual', 'max_messages_reached'
  )),
  messages_sent int not null default 0 check (messages_sent >= 0),
  last_sent_at timestamptz,
  last_sent_date date,
  last_sent_slot text check (last_sent_slot in ('morning', 'evening')),
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.lead_followup_automation_state is
  'Per-lead automation instance (master plan §6 stop conditions + '
  'pause/resume/stop). One row per lead, created on demand the first time '
  'get_eligible_followup_leads() considers that lead eligible. '
  'last_sent_date/last_sent_slot back the atomic claim_followup_send() gate '
  'that prevents the same lead being sent to twice in one slot even under '
  'concurrent cron execution. stopped/completed are terminal — enforced by '
  'enforce_automation_state_transition_trg below, not just the UI.';

create index lead_followup_automation_state_status_idx on public.lead_followup_automation_state(status);

create trigger set_lead_followup_automation_state_updated_at
  before update on public.lead_followup_automation_state
  for each row execute function public.set_updated_at();

create function public.enforce_automation_state_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'active' and new.status in ('paused', 'stopped', 'completed'))
    or (old.status = 'paused' and new.status in ('active', 'stopped'))
  ) then
    raise exception 'Invalid automation state transition: % -> %', old.status, new.status;
  end if;

  if new.status in ('stopped', 'completed') and new.stopped_at is null then
    new.stopped_at := now();
  end if;

  return new;
end;
$$;

comment on function public.enforce_automation_state_transition() is
  'Only active<->paused and active/paused->stopped/completed are legal — '
  'matches lead_followup_automation_state''s own comment. Stop conditions '
  'must not depend solely on the client, per master plan §6, so this is '
  'enforced here as well as in the UI.';

create trigger enforce_automation_state_transition_trg
  before update on public.lead_followup_automation_state
  for each row execute function public.enforce_automation_state_transition();

-- =============================================================================
-- WHATSAPP_CONSENT_EVENTS
-- =============================================================================

create table public.whatsapp_consent_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  event_type text not null check (event_type in ('opt_in', 'opt_out')),
  source text not null default 'admin_manual' check (source in ('customer_reply', 'admin_manual', 'system')),
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.whatsapp_consent_events is
  'Append-only consent history per customer (master plan §6 stop condition: '
  '"Customer requests stop"). apply_whatsapp_consent_event() is the only '
  'supported writer — it inserts here and denormalizes the latest state onto '
  'customers.whatsapp_opt_out for a cheap check on every automated/campaign '
  'send, the same materialize-for-reads pattern bookings.balance_amount uses.';

create index whatsapp_consent_events_customer_id_idx on public.whatsapp_consent_events(customer_id);

-- =============================================================================
-- CUSTOMERS — Phase 4 dependency: consent flag
-- Genuinely required by this phase's stop conditions (master plan §6) and by
-- every send path's eligibility check; no other Phase 1 column/policy/
-- function on customers is touched.
-- =============================================================================

alter table public.customers add column whatsapp_opt_out boolean not null default false;

comment on column public.customers.whatsapp_opt_out is
  'Denormalized from the latest public.whatsapp_consent_events row for this '
  'customer. Written only by apply_whatsapp_consent_event() — never set '
  'directly by application code.';

-- =============================================================================
-- CAMPAIGNS
-- Created before whatsapp_messages so whatsapp_messages.campaign_id can
-- reference it; campaign_recipients (which needs both campaigns and
-- whatsapp_messages) is created last.
-- =============================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  template_id uuid not null references public.whatsapp_templates(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'sending', 'completed', 'partially_failed', 'failed')),
  lead_status_filter text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  completed_at timestamptz,
  total_recipients int not null default 0 check (total_recipients >= 0),
  sent_count int not null default 0 check (sent_count >= 0),
  failed_count int not null default 0 check (failed_count >= 0),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.campaigns is
  'A batch WhatsApp send to many leads using one template (master plan §2 '
  'Marketing → WhatsApp Campaigns). status honestly reflects partial failure '
  '(partially_failed is distinct from completed) — a campaign is never '
  'reported as a plain success unless every recipient actually succeeded, '
  'per explicit instruction. lead_status_filter records how recipients were '
  'selected, for display only.';

create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

-- =============================================================================
-- WHATSAPP_MESSAGES
-- =============================================================================

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  quotation_id uuid references public.quotations(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  template_id uuid references public.whatsapp_templates(id) on delete set null,
  message_type text not null check (message_type in (
    'enquiry_confirmation', 'quotation', 'followup_morning', 'followup_evening', 'campaign', 'manual', 'inbound'
  )),
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  to_phone text not null,
  body text,
  template_params jsonb not null default '{}'::jsonb,
  provider_message_id text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message text,
  sent_by uuid references public.users(id) on delete set null,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.whatsapp_messages is
  'Full send/receive log — the "message history" required by master plan §6 '
  'and the source data for §12 Marketing Reports. sent_by is null for '
  'system/automation-sent messages. A row is only ever inserted once the '
  'provider call has actually returned (sent) or failed — "queued" exists '
  'for schema completeness but the send flow never reports success before '
  'the provider confirms it, per explicit instruction. provider_message_id '
  'is the idempotency key webhook status updates match against (unique, '
  'partial, below): repeated delivery/read webhook events update the same '
  'row rather than creating duplicates.';

create index whatsapp_messages_lead_id_idx on public.whatsapp_messages(lead_id);
create index whatsapp_messages_campaign_id_idx on public.whatsapp_messages(campaign_id);
create index whatsapp_messages_status_idx on public.whatsapp_messages(status);
create index whatsapp_messages_created_at_idx on public.whatsapp_messages(created_at);
create unique index whatsapp_messages_provider_message_id_key
  on public.whatsapp_messages(provider_message_id) where provider_message_id is not null;

-- =============================================================================
-- CAMPAIGN_RECIPIENTS
-- =============================================================================

create table public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  whatsapp_message_id uuid references public.whatsapp_messages(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  skip_reason text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_recipients_unique_lead unique (campaign_id, lead_id)
);

comment on table public.campaign_recipients is
  'One row per lead targeted by a campaign — unique on (campaign_id, '
  'lead_id), so re-running recipient selection for the same campaign never '
  'duplicates a recipient (idempotent). skipped covers opted-out customers '
  'and leads with no WhatsApp number, so a campaign''s totals always add up '
  'and a campaign is never silently short-sent.';

create index campaign_recipients_campaign_id_idx on public.campaign_recipients(campaign_id);
create index campaign_recipients_status_idx on public.campaign_recipients(status);

create trigger set_campaign_recipients_updated_at
  before update on public.campaign_recipients
  for each row execute function public.set_updated_at();

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Only supported way to record consent. SECURITY INVOKER — the public
-- webhook route calls this via the service-role client (bypasses RLS, same
-- precedent as the anon enquiry endpoint), and the authenticated admin path
-- relies on the RLS insert policy below.
create function public.apply_whatsapp_consent_event(
  p_customer_id uuid,
  p_event_type text,
  p_source text default 'admin_manual',
  p_note text default null
)
returns uuid
language plpgsql
as $$
declare
  v_event_id uuid;
  v_lead record;
begin
  if p_event_type not in ('opt_in', 'opt_out') then
    raise exception 'Invalid consent event_type: %', p_event_type;
  end if;

  insert into public.whatsapp_consent_events (customer_id, event_type, source, note, created_by)
  values (p_customer_id, p_event_type, p_source, p_note, auth.uid())
  returning id into v_event_id;

  update public.customers
  set whatsapp_opt_out = (p_event_type = 'opt_out')
  where id = p_customer_id;

  if p_event_type = 'opt_out' then
    for v_lead in
      select l.id from public.leads l
      join public.lead_followup_automation_state s on s.lead_id = l.id
      where l.customer_id = p_customer_id and s.status = 'active'
    loop
      perform public.stop_lead_automation(v_lead.id, 'customer_opt_out');
    end loop;
  end if;

  return v_event_id;
end;
$$;

comment on function public.apply_whatsapp_consent_event(uuid, text, text, text) is
  'Keeps whatsapp_consent_events and customers.whatsapp_opt_out in sync and, '
  'on opt_out, immediately stops automation for every active lead this '
  'customer has — master plan §6 stop condition "Customer requests stop".';

-- Idempotent stop, safe to call from any trigger context.
create function public.stop_lead_automation(p_lead_id uuid, p_reason text)
returns void
language plpgsql
as $$
begin
  insert into public.lead_followup_automation_state (lead_id, status, stop_reason)
  values (p_lead_id, 'stopped', p_reason)
  on conflict (lead_id) do update
  set status = 'stopped', stop_reason = excluded.stop_reason
  where public.lead_followup_automation_state.status not in ('stopped', 'completed');
end;
$$;

comment on function public.stop_lead_automation(uuid, text) is
  'Safe to call on a lead with no automation state row yet (inserts one '
  'already stopped) or one already stopped/completed — the WHERE guard on '
  'the ON CONFLICT branch makes that a no-op, so an earlier stop_reason is '
  'never overwritten by a later stop condition firing.';

-- Lead status changes are the most common stop trigger (not_interested,
-- lost, cancelled, confirmed) — master plan §6 stop conditions.
create function public.stop_automation_on_lead_status()
returns trigger
language plpgsql
as $$
declare
  v_reason text;
begin
  if new.status = old.status then
    return new;
  end if;

  v_reason := case new.status
    when 'not_interested' then 'lead_not_interested'
    when 'lost' then 'lead_lost'
    when 'cancelled' then 'lead_cancelled'
    when 'confirmed' then 'customer_booked'
    else null
  end;

  if v_reason is not null then
    perform public.stop_lead_automation(new.id, v_reason);
  end if;

  return new;
end;
$$;

create trigger stop_automation_on_lead_status_trg
  after update on public.leads
  for each row
  when (new.status is distinct from old.status)
  execute function public.stop_automation_on_lead_status();

-- Booking confirmation is the authoritative "customer books" signal — fires
-- even if the lead's own status was, for some reason, never updated to
-- confirmed directly.
create function public.stop_automation_on_booking_status()
returns trigger
language plpgsql
as $$
begin
  if new.booking_status = 'confirmed' and old.booking_status is distinct from 'confirmed' then
    perform public.stop_lead_automation(new.lead_id, 'customer_booked');
  end if;
  return new;
end;
$$;

create trigger stop_automation_on_booking_status_trg
  after update on public.bookings
  for each row
  when (new.booking_status is distinct from old.booking_status)
  execute function public.stop_automation_on_booking_status();

-- Every outbound send that actually reached "sent" (not "failed") gets a
-- lead_activities entry — master plan §3 Lead Timeline explicitly lists
-- "WhatsApp follow-up sent" as an example entry.
create function public.log_whatsapp_message_activity()
returns trigger
language plpgsql
as $$
begin
  if new.direction = 'outbound' and new.status != 'failed' then
    insert into public.lead_activities (lead_id, actor_id, action, description, metadata)
    values (
      new.lead_id, new.sent_by, 'whatsapp_message_sent',
      format('WhatsApp %s message sent', new.message_type),
      jsonb_build_object('whatsapp_message_id', new.id, 'message_type', new.message_type, 'to', new.to_phone)
    );
  end if;
  return new;
end;
$$;

create trigger log_whatsapp_message_activity_trg
  after insert on public.whatsapp_messages
  for each row execute function public.log_whatsapp_message_activity();

-- Eligibility scan for the cron follow-up job. The one write it performs
-- (provisioning missing automation-state rows for newly-eligible leads) is
-- idempotent via ON CONFLICT DO NOTHING. Actual send-slot exclusivity is
-- enforced separately and atomically by claim_followup_send() below, so a
-- lead returned here twice under concurrent/overlapping cron runs still
-- cannot be messaged twice.
create function public.get_eligible_followup_leads(p_slot text)
returns table (
  lead_id uuid,
  customer_id uuid,
  destination text,
  package_interested text
)
language plpgsql
as $$
declare
  v_rules public.automation_rules;
begin
  if p_slot not in ('morning', 'evening') then
    raise exception 'Invalid slot: %', p_slot;
  end if;

  select * into v_rules from public.automation_rules order by created_at limit 1;
  if v_rules is null or v_rules.status != 'active' then
    return;
  end if;

  insert into public.lead_followup_automation_state (lead_id)
  select l.id
  from public.leads l
  join public.customers c on c.id = l.customer_id
  where l.status = any(v_rules.eligible_lead_statuses)
    and c.whatsapp_opt_out = false
    and not exists (
      select 1 from public.lead_followup_automation_state s where s.lead_id = l.id
    )
  on conflict (lead_id) do nothing;

  return query
  select l.id, l.customer_id, l.destination, l.package_interested
  from public.leads l
  join public.customers c on c.id = l.customer_id
  join public.lead_followup_automation_state s on s.lead_id = l.id
  where s.status = 'active'
    and l.status = any(v_rules.eligible_lead_statuses)
    and c.whatsapp_opt_out = false
    and s.messages_sent < v_rules.max_messages
    and (current_date - l.created_at::date) <= v_rules.followup_duration_days
    and not (s.last_sent_date = current_date and s.last_sent_slot = p_slot);
end;
$$;

comment on function public.get_eligible_followup_leads(text) is
  'Called by the cron route via the service-role client (no staff session '
  'exists for a scheduled job), so it runs with RLS bypassed — the function '
  'itself still fully re-checks automation_rules.status, eligible statuses, '
  'opt-out, message cap, and duration window.';

-- Atomic claim gate for one lead/slot. The UPDATE ... WHERE NOT (already
-- sent this slot today) ... RETURNING pattern relies on Postgres row
-- locking, so two concurrent cron invocations cannot both claim the same
-- lead/slot — master plan §6: automation must be idempotent, no duplicate
-- messages. Caller must only actually send the WhatsApp message if this
-- returns true, and only after it returns true (claim-then-send, not
-- send-then-claim, so a provider failure after a successful claim is simply
-- one fewer message this lead ever gets, never a duplicate).
create function public.claim_followup_send(p_lead_id uuid, p_slot text)
returns boolean
language plpgsql
as $$
declare
  v_rules public.automation_rules;
  v_new_count int;
  v_claimed boolean := false;
begin
  select * into v_rules from public.automation_rules order by created_at limit 1;

  update public.lead_followup_automation_state
  set messages_sent = messages_sent + 1,
      last_sent_at = now(),
      last_sent_date = current_date,
      last_sent_slot = p_slot
  where lead_id = p_lead_id
    and status = 'active'
    and not (last_sent_date = current_date and last_sent_slot = p_slot)
  returning messages_sent into v_new_count;

  if found then
    v_claimed := true;
    if v_rules is not null and v_new_count >= v_rules.max_messages then
      update public.lead_followup_automation_state
      set status = 'completed'
      where lead_id = p_lead_id and status = 'active';
    end if;
  end if;

  return v_claimed;
end;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.whatsapp_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.lead_followup_automation_state enable row level security;
alter table public.whatsapp_consent_events enable row level security;
alter table public.campaigns enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.campaign_recipients enable row level security;

-- --- whatsapp_templates: any WhatsApp-permissioned staff can read (shared
-- --- reference data, same shape as packages under view_inventory); only
-- --- manage_whatsapp_templates can write. No delete — deactivate instead.
create policy "whatsapp_templates_select_scoped" on public.whatsapp_templates
  for select to authenticated
  using (
    public.has_permission('view_whatsapp_messages_own')
    or public.has_permission('view_whatsapp_messages_all')
    or public.has_permission('manage_whatsapp_templates')
    or public.has_permission('manage_whatsapp_automation')
    or public.has_permission('manage_whatsapp_campaigns')
  );

create policy "whatsapp_templates_write_managed" on public.whatsapp_templates
  for all to authenticated
  using (public.has_permission('manage_whatsapp_templates'))
  with check (public.has_permission('manage_whatsapp_templates'));

-- --- automation_rules: Admin/Manager-only, both read and write — Sales
-- --- Staff has no visibility into global automation configuration.
create policy "automation_rules_select_managed" on public.automation_rules
  for select to authenticated
  using (public.has_permission('manage_whatsapp_automation'));

create policy "automation_rules_write_managed" on public.automation_rules
  for update to authenticated
  using (public.has_permission('manage_whatsapp_automation'))
  with check (public.has_permission('manage_whatsapp_automation'));

-- --- lead_followup_automation_state: read matches the bookings own/all
-- --- shape via the lead join. Write also accepts edit_leads/edit_bookings
-- --- (not lead-scoped further) because stop_lead_automation() runs as the
-- --- acting staff member from the leads/bookings status-change triggers
-- --- above — by the time those triggers fire, the underlying leads/bookings
-- --- row update has already passed ITS OWN row-scoped RLS check, so a Sales
-- --- Staff member marking their own lead "Lost" must be able to write the
-- --- resulting automation-state row even without manage_whatsapp_automation.
create policy "lead_followup_automation_state_select_scoped" on public.lead_followup_automation_state
  for select to authenticated
  using (
    public.has_permission('manage_whatsapp_automation')
    or exists (
      select 1 from public.leads l
      where l.id = lead_followup_automation_state.lead_id
      and (
        public.has_permission('view_whatsapp_messages_all')
        or (public.has_permission('view_whatsapp_messages_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "lead_followup_automation_state_write_managed" on public.lead_followup_automation_state
  for all to authenticated
  using (
    public.has_permission('manage_whatsapp_automation')
    or public.has_permission('edit_leads')
    or public.has_permission('edit_bookings')
  )
  with check (
    public.has_permission('manage_whatsapp_automation')
    or public.has_permission('edit_leads')
    or public.has_permission('edit_bookings')
  );

-- --- whatsapp_consent_events: read matches lead scoping via customer's
-- --- leads; insert allowed to whoever can already manage the customer
-- --- record (existing Phase 1 permission) or manage automation. Append-only
-- --- — no update/delete, matching lead_activities/audit_logs.
create policy "whatsapp_consent_events_select_scoped" on public.whatsapp_consent_events
  for select to authenticated
  using (
    public.has_permission('manage_whatsapp_automation')
    or public.has_permission('manage_customers')
    or exists (
      select 1 from public.leads l
      where l.customer_id = whatsapp_consent_events.customer_id
      and (
        public.has_permission('view_whatsapp_messages_all')
        or (public.has_permission('view_whatsapp_messages_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "whatsapp_consent_events_insert_managed" on public.whatsapp_consent_events
  for insert to authenticated
  with check (
    public.has_permission('manage_customers') or public.has_permission('manage_whatsapp_automation')
  );

-- --- campaigns / campaign_recipients: Admin/Manager-only end to end.
create policy "campaigns_select_managed" on public.campaigns
  for select to authenticated
  using (public.has_permission('manage_whatsapp_campaigns'));

create policy "campaigns_write_managed" on public.campaigns
  for all to authenticated
  using (public.has_permission('manage_whatsapp_campaigns'))
  with check (public.has_permission('manage_whatsapp_campaigns'));

create policy "campaign_recipients_select_managed" on public.campaign_recipients
  for select to authenticated
  using (public.has_permission('manage_whatsapp_campaigns'));

create policy "campaign_recipients_write_managed" on public.campaign_recipients
  for all to authenticated
  using (public.has_permission('manage_whatsapp_campaigns'))
  with check (public.has_permission('manage_whatsapp_campaigns'));

-- --- whatsapp_messages: read matches lead scoping (own/all), or any
-- --- Marketing-management permission (campaigns/automation/templates staff
-- --- need to see what was actually sent). Insert additionally accepts
-- --- send_quotations — reused from Phase 3 exactly as instructed — since
-- --- sending a quotation via WhatsApp is gated by that existing permission,
-- --- not a new one. No update/delete for the authenticated role: status
-- --- transitions (sent -> delivered -> read, or failed) are written only by
-- --- the webhook route via the service-role client, which bypasses RLS.
create policy "whatsapp_messages_select_scoped" on public.whatsapp_messages
  for select to authenticated
  using (
    public.has_permission('manage_whatsapp_automation')
    or public.has_permission('manage_whatsapp_campaigns')
    or public.has_permission('manage_whatsapp_templates')
    or exists (
      select 1 from public.leads l
      where l.id = whatsapp_messages.lead_id
      and (
        public.has_permission('view_whatsapp_messages_all')
        or (public.has_permission('view_whatsapp_messages_own') and (l.assigned_to = auth.uid() or l.assigned_to is null))
      )
    )
  );

create policy "whatsapp_messages_insert_scoped" on public.whatsapp_messages
  for insert to authenticated
  with check (
    public.has_permission('send_quotations')
    or public.has_permission('manage_whatsapp_campaigns')
    or public.has_permission('manage_whatsapp_automation')
    or public.has_permission('manage_whatsapp_templates')
  );

-- =============================================================================
-- PERMISSIONS & SEED DATA
-- =============================================================================

insert into public.permissions (key, description) values
  ('view_whatsapp_messages_own', 'View WhatsApp message history for leads assigned to you, or unassigned.'),
  ('view_whatsapp_messages_all', 'View WhatsApp message history for every lead.'),
  ('manage_whatsapp_templates', 'Create, edit, and activate/deactivate WhatsApp templates.'),
  ('manage_whatsapp_automation', 'Configure follow-up automation rules and control per-lead automation state.'),
  ('manage_whatsapp_campaigns', 'Create and send WhatsApp campaigns.')
on conflict (key) do nothing;

-- Admin / Manager: full marketing operational access, same shape as their
-- quotations/bookings grants in Phase 3/3.5.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_whatsapp_messages_all', 'manage_whatsapp_templates',
  'manage_whatsapp_automation', 'manage_whatsapp_campaigns'
)
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff: message-history visibility on their own leads only — the
-- Marketing menu (templates/automation config/campaigns) is not in their
-- §10 scope, same treatment as quotations' send_quotations being withheld
-- from a broader Sales Staff grant.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'view_whatsapp_messages_own'
where r.name = 'Sales Staff'
on conflict (role_id, permission_id) do nothing;

-- Content Manager: no WhatsApp access — not in their §10 scope (Pages, Page
-- Builder, Blog, Banners, FAQs, Testimonials, SEO). Super Admin is
-- auto-granted every permission via the existing Phase 0
-- grant_new_permission_to_super_admin trigger.

-- Seed templates for the three automated send paths this phase implements,
-- so the system is usable immediately after migration without requiring an
-- admin to hand-author templates first. provider_template_name matches name
-- 1:1 — an operator replacing these with real Meta-approved templates only
-- needs to update provider_template_name plus the approved variable count.
insert into public.whatsapp_templates (name, purpose, category, provider_template_name, body_text, variables) values
  (
    'Enquiry Confirmation', 'enquiry_confirmation', 'utility', 'enquiry_confirmation',
    'Hi {{1}}, thank you for your enquiry with ConnectMyTours! Your enquiry number is {{2}}. Our team will get back to you shortly.',
    '[{"index":1,"label":"Customer Name"},{"index":2,"label":"Enquiry Number"}]'::jsonb
  ),
  (
    'Quotation Ready', 'quotation', 'utility', 'quotation_ready',
    'Hi {{1}}, your quotation {{2}} for {{3}} is ready — total {{4}}, valid until {{5}}. Reply here for any questions.',
    '[{"index":1,"label":"Customer Name"},{"index":2,"label":"Quotation Number"},{"index":3,"label":"Package/Destination"},{"index":4,"label":"Total Amount"},{"index":5,"label":"Valid Until"}]'::jsonb
  ),
  (
    'Morning Follow-up', 'followup_morning', 'marketing', 'followup_morning',
    'Good morning {{1}}! Still planning your trip to {{2}}? Check out {{3}} — a great match for what you had in mind.',
    '[{"index":1,"label":"Customer Name"},{"index":2,"label":"Destination"},{"index":3,"label":"Package Name"}]'::jsonb
  ),
  (
    'Evening Follow-up', 'followup_evening', 'marketing', 'followup_evening',
    'Hi {{1}}, don''t miss out on {{2}} for your {{3}} trip. Let us know if you''d like a quotation!',
    '[{"index":1,"label":"Customer Name"},{"index":2,"label":"Package Name"},{"index":3,"label":"Destination"}]'::jsonb
  )
on conflict (name) do nothing;
