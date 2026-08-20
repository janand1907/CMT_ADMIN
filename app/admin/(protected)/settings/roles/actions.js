"use server";

import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { logAdminEvent } from "@/lib/audit/logAdminEvent";

export async function updateRolePermissions(roleId, permissionIds) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_roles_permissions"]);
  if (!perms.manage_roles_permissions) return { error: "You don't have permission to manage roles and permissions." };

  const { data: role } = await supabase.from("roles").select("id, name").eq("id", roleId).single();
  if (!role) return { error: "Role not found." };
  if (role.name === "Super Admin") {
    return { error: "Super Admin's permissions are granted automatically and cannot be edited." };
  }

  const { data: current } = await supabase.from("role_permissions").select("permission_id").eq("role_id", roleId);
  const currentIds = new Set((current || []).map((r) => r.permission_id));
  const nextIds = new Set(permissionIds);

  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase.from("role_permissions").insert(toAdd.map((permission_id) => ({ role_id: roleId, permission_id })));
    if (error) return { error: error.message };
  }

  if (toRemove.length > 0) {
    const { error } = await supabase.from("role_permissions").delete().eq("role_id", roleId).in("permission_id", toRemove);
    if (error) return { error: error.message };
  }

  if (toAdd.length === 0 && toRemove.length === 0) {
    return { error: null, success: true };
  }

  const { data: permissionRows } = await supabase.from("permissions").select("id, key").in("id", [...toAdd, ...toRemove]);
  const keyById = Object.fromEntries((permissionRows || []).map((p) => [p.id, p.key]));

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  await logAdminEvent(supabase, {
    actorId: actor.id,
    action: "role_permissions_updated",
    entityType: "role",
    entityId: roleId,
    previousValue: { removed: toRemove.map((id) => keyById[id]) },
    newValue: { added: toAdd.map((id) => keyById[id]) },
  });

  return { error: null, success: true };
}
