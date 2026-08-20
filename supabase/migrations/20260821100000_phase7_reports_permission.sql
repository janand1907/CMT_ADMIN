-- Phase 7 — Reports & Analytics
-- Adds exactly one new permission gating the Reports pages/menu. No new RLS
-- policies on leads/quotations/bookings/whatsapp_messages/campaigns/
-- lead_followup_automation_state: Admin/Manager already holds view_leads_all,
-- view_quotations_all, view_bookings_all, view_whatsapp_messages_all,
-- manage_whatsapp_automation, and manage_whatsapp_campaigns from Phase 1/3/
-- 3.5/4, which already grant full read visibility on every table these
-- reports read from. Reports queries run through the staff's own session
-- (lib/supabase/server.js), never the service-role client — RLS on those
-- existing tables remains the real security boundary.

insert into public.permissions (key, description) values
  ('view_reports', 'View the Reports section (Dashboard KPIs, Lead/Sales/Marketing Reports).')
on conflict (key) do nothing;

-- Master plan §10: "Admin / Manager: ... Reports" — Sales Staff and Content
-- Manager do not have Reports in their role's area list, so neither receives
-- this permission. Super Admin gets it automatically via the existing
-- auto_grant_super_admin trigger (Phase 0), same as every other permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'view_reports'
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;
