// Shared audit_logs writer for Phase 8.1's user/role-management actions. The
// actor always has a real session here (unlike login/logout's service-role
// path in recordLoginEvent.js, which can fire with no session on a failed
// login) — audit_logs_insert_self already covers a normal authenticated-
// client insert, so there's no need to reach for the service-role client.
export async function logAdminEvent(supabase, { actorId, action, entityType = "user", entityId, previousValue = null, newValue = null }) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    previous_value: previousValue,
    new_value: newValue,
  });
  if (error) console.error(`Failed to record ${action} audit event:`, error.message);
}
