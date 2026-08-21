-- Post-Phase 8 enhancement — Call/WhatsApp click tracking for lead attribution.
-- Same "anon write via a narrow SECURITY DEFINER function, no RLS insert grant"
-- shape as submit_enquiry() (20260817120000_phase1_crm.sql): no existing table
-- (leads, lead_activities, audit_logs, error_logs, whatsapp_consent_events) fits
-- an anonymous click event, so a small dedicated table is added instead.
--
-- Privacy: only coarse location (country/region/city) is ever written — there is
-- no `ip` column on this table at all, so the raw client IP cannot be persisted
-- even by a future mistake. The IP is used only in-memory, server-side, for a
-- best-effort geolocation lookup in app/api/contact-click/route.js, and is
-- discarded immediately after.

create table public.contact_click_events (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('call', 'whatsapp')),
  page_path text not null,
  device_type text check (device_type in ('mobile', 'tablet', 'desktop')),
  os text,
  browser text,
  country text,
  region text,
  city text,
  created_at timestamptz not null default now()
);

comment on table public.contact_click_events is
  'Anonymous Call/WhatsApp button click events from the public site, for lead-attribution '
  'reporting (Admin > Reports > Contact Clicks). Insert-only via record_contact_click(); no '
  'personal data beyond coarse (country/region/city) location — no raw IP is ever stored.';

create index contact_click_events_created_at_idx on public.contact_click_events(created_at desc);
create index contact_click_events_action_type_idx on public.contact_click_events(action_type);

alter table public.contact_click_events enable row level security;

-- Reuses view_reports (already gates Lead/Sales/Marketing Reports) rather than
-- minting a new permission — same precedent as error_logs reusing
-- view_audit_logs in 20260822090000_phase8_hardening.sql.
create policy "contact_click_events_select_managed" on public.contact_click_events
  for select to authenticated
  using (public.has_permission('view_reports'));

-- No INSERT/UPDATE/DELETE policy for any role — every write goes through the
-- SECURITY DEFINER function below, matching submit_enquiry()'s documented shape.
create function public.record_contact_click(
  p_action_type text,
  p_page_path text,
  p_device_type text default null,
  p_os text default null,
  p_browser text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_action_type not in ('call', 'whatsapp') then
    raise exception 'invalid action_type: %', p_action_type;
  end if;

  if p_device_type is not null and p_device_type not in ('mobile', 'tablet', 'desktop') then
    p_device_type := null;
  end if;

  insert into public.contact_click_events (action_type, page_path, device_type, os, browser, country, region, city)
  values (p_action_type, left(coalesce(p_page_path, '/'), 500), p_device_type, p_os, p_browser, p_country, p_region, p_city)
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.record_contact_click is
  'The only write path for contact_click_events. Called from app/api/contact-click/route.js via '
  'the anon-key client (lib/supabase/anon.js), same pattern as submit_enquiry(). Relies on '
  'Postgres''s default EXECUTE-to-PUBLIC grant, same as submit_enquiry() — no explicit grant needed.';
