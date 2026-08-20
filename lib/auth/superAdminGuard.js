// Prevents the last active Super Admin from being demoted or deactivated,
// which would leave the system with no one able to manage users or roles at
// all. Applies whether the target is acting on themself or another account —
// role_id/active are the only things that matter, not who's making the call.
export async function wouldOrphanSuperAdmin(supabase, userId, { newRoleId = null, deactivating = false } = {}) {
  const { data: superAdminRole } = await supabase.from("roles").select("id").eq("name", "Super Admin").single();
  if (!superAdminRole) return false;

  const { data: target } = await supabase.from("users").select("role_id, active").eq("id", userId).single();
  if (!target || target.role_id !== superAdminRole.id || !target.active) return false;

  if (!deactivating && newRoleId === superAdminRole.id) return false;

  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role_id", superAdminRole.id)
    .eq("active", true)
    .neq("id", userId);

  return (count || 0) === 0;
}
