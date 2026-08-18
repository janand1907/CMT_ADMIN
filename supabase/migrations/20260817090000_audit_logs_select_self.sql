-- Lets any authenticated user read their own audit_logs rows (e.g. their own
-- login history on /admin/security), independent of the view_audit_logs
-- permission that audit_logs_select_managed already gates for staff-wide access.
create policy "audit_logs_select_self" on public.audit_logs
  for select to authenticated
  using (actor_id = auth.uid());
