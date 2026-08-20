-- Phase 8 — Production Hardening
-- Two independent pieces: (1) a new error_logs table for the in-house error
-- logging decided on for this phase, (2) fixing the media storage-bucket
-- policy drift found during Phase 2 and explicitly deferred to "at the
-- latest, Phase 8" (see CONNECTMYTOURS_STATUS.md's Phase 2 "Unresolved item").

-- =========================================================================
-- ERROR_LOGS
-- Insert-only, written exclusively via the service-role client from
-- server-only code paths (cron route, webhook route, login action) — same
-- "no authenticated Postgres role writes this" shape as audit_logs' failed-
-- login case, so there is no insert policy for `authenticated` at all;
-- writes bypass RLS entirely via the admin client, matching how
-- whatsapp_messages' status columns are written only by the webhook route.
-- =========================================================================

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('cron', 'webhook', 'server_action', 'api_route')),
  message text not null,
  context jsonb,
  created_at timestamptz not null default now()
);

comment on table public.error_logs is
  'Server-side error log (Phase 8 "Error logging", master plan §14) — lightweight in-house '
  'alternative to an external monitoring service, per explicit decision to avoid a new '
  'dependency/account. Insert-only; no UPDATE/DELETE policy is granted to any role.';

create index error_logs_source_idx on public.error_logs(source);
create index error_logs_created_at_idx on public.error_logs(created_at);

alter table public.error_logs enable row level security;

-- Reuses view_audit_logs rather than a new permission key — same "operational
-- visibility for staff who already see the audit trail" concern, not a
-- separate capability.
create policy "error_logs_select_managed" on public.error_logs
  for select to authenticated
  using (public.has_permission('view_audit_logs'));

-- =========================================================================
-- MEDIA BUCKET POLICY DRIFT (deferred from Phase 2, resolved now)
-- media_bucket_select_authenticated and media_bucket_write_managed were
-- created directly on remote (outside any migration, most likely via
-- Supabase Studio during the Phase 0 window) and were never dropped —
-- media_bucket_select_authenticated in particular grants unscoped SELECT to
-- any authenticated user, not just manage_media holders, wider than the
-- already-correct media_bucket_select_managed policy from Phase 2's own
-- migration. Both are redundant with Phase 2's 4 correctly-scoped policies
-- (select/insert/update/delete, all requiring manage_media) and are dropped
-- here, not replaced — the correct policies already exist.
-- =========================================================================

drop policy if exists "media_bucket_select_authenticated" on storage.objects;
drop policy if exists "media_bucket_write_managed" on storage.objects;
