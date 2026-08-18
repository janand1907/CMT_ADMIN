-- Phase 1-4 Teardown — intentional application reset to Phase 0 foundation.
-- Drops every table/function introduced by the CRM (Phase 1), Inventory (Phase 2),
-- Quotations (Phase 3), Booking Foundation (Phase 3.5), and WhatsApp Automation
-- (Phase 4) migrations, removes their permission grants from the Phase 0
-- permissions/role_permissions tables, and reverts a Phase 0 RLS policy that Phase 1
-- had extended. Phase 0 tables (roles, permissions, role_permissions, users,
-- settings, sequences, audit_logs) and all Phase 0 functions/triggers are untouched.
-- This file intentionally has no matching "up" migration still present in this
-- repo — supabase/migrations/20260813174904_phase1_crm.sql and later Phase 1-4
-- files were removed from the repo after this teardown was applied; see
-- CONNECTMYTOURS_STATUS.md for the reset record.

-- =========================================================================
-- PHASE 4 — WhatsApp Automation & Campaigns
-- =========================================================================
drop table if exists public.whatsapp_consent_events cascade;
drop table if exists public.campaign_recipients cascade;
drop table if exists public.whatsapp_messages cascade;
drop table if exists public.campaigns cascade;
drop table if exists public.automation_rules cascade;
drop table if exists public.lead_followup_automation_state cascade;
drop table if exists public.whatsapp_templates cascade;

drop function if exists public.apply_whatsapp_consent_event cascade;
drop function if exists public.stop_lead_automation cascade;
drop function if exists public.stop_automation_on_booking_status cascade;
drop function if exists public.stop_automation_on_lead_status cascade;

-- =========================================================================
-- PHASE 3.5 — Booking Foundation
-- =========================================================================
drop table if exists public.bookings cascade;

drop function if exists public.sync_booking_from_quotation cascade;
drop function if exists public.set_booking_status_timestamps cascade;
drop function if exists public.log_booking_status_change cascade;

-- =========================================================================
-- PHASE 3 — Quotations
-- =========================================================================
drop table if exists public.quotation_messages cascade;
drop table if exists public.quotation_revisions cascade;
drop table if exists public.quotation_items cascade;
drop table if exists public.quotations cascade;

drop function if exists public.sync_quotation_customer_id cascade;
drop function if exists public.compute_quotation_totals cascade;
drop function if exists public.log_quotation_status_change cascade;
drop function if exists public.compute_quotation_item_final_price cascade;
drop function if exists public.trigger_quotation_totals_recalc cascade;
drop function if exists public.log_quotation_item_price_change cascade;
drop function if exists public.create_quotation_revision cascade;
drop function if exists public.quotation_lead_owner_matches cascade;

-- =========================================================================
-- PHASE 2 — Inventory
-- =========================================================================
drop table if exists public.seo_metadata cascade;
drop table if exists public.package_images cascade;
drop table if exists public.package_pricing cascade;
drop table if exists public.packages cascade;
drop table if exists public.media cascade;
drop table if exists public.package_categories cascade;
drop table if exists public.destinations cascade;

drop function if exists public.log_package_pricing_change cascade;
drop function if exists public.match_packages_for_lead cascade;

-- =========================================================================
-- PHASE 1 — CRM
-- =========================================================================
drop table if exists public.lead_tasks cascade;
drop table if exists public.lead_followups cascade;
drop table if exists public.lead_activities cascade;
drop table if exists public.lead_tag_assignments cascade;
drop table if exists public.leads cascade;
drop table if exists public.customers cascade;
drop table if exists public.lead_tags cascade;
drop table if exists public.lead_sources cascade;

drop function if exists public.enforce_lead_reassignment cascade;
drop function if exists public.log_lead_status_change cascade;

-- Revert the Phase 1 staff-directory RLS extension on the Phase 0 `users` table
-- back to its original Phase 0 form (drops the `assign_leads`-permission branch,
-- since assign_leads no longer exists).
drop policy if exists "users_select_self_or_managed" on public.users;

create policy "users_select_self_or_managed" on public.users
  for select to authenticated
  using (id = auth.uid() or public.has_permission('manage_users'));

-- =========================================================================
-- PERMISSIONS — remove every Phase 1-4 permission grant (cascades to role_permissions)
-- =========================================================================
delete from public.permissions where key in (
  -- Phase 1 — CRM
  'view_leads_own', 'view_leads_all', 'create_leads', 'edit_leads', 'assign_leads',
  'manage_customers', 'manage_lead_metadata', 'manage_followups', 'manage_tasks',
  -- Phase 2 — Inventory
  'manage_inventory', 'manage_package_pricing', 'manage_media',
  -- Phase 3 — Quotations
  'view_quotations_own', 'view_quotations_all', 'create_quotations', 'edit_quotations',
  'send_quotations', 'approve_quotations', 'manage_quotation_pricing',
  -- Phase 3.5 — Bookings
  'view_bookings_own', 'view_bookings_all', 'create_bookings', 'edit_bookings',
  -- Phase 4 — WhatsApp
  'view_whatsapp_messages_own', 'view_whatsapp_messages_all', 'manage_whatsapp_templates',
  'manage_whatsapp_automation', 'manage_whatsapp_campaigns'
);

-- =========================================================================
-- TEST/DEMO/QA DATA CLEANUP — Phase 0 tables kept, contents reset
-- =========================================================================
-- Audit log rows generated while exercising the now-removed Phase 1-4 features.
truncate table public.audit_logs;

-- Business-ID counters generated while exercising the now-removed Phase 1-4 features.
truncate table public.sequences;
