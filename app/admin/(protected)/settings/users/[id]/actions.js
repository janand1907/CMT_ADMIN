"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPermissions } from "@/lib/auth/getPermissions";
import { wouldOrphanSuperAdmin } from "@/lib/auth/superAdminGuard";
import { logAdminEvent } from "@/lib/audit/logAdminEvent";

async function requireManageUsers(supabase) {
  const perms = await getPermissions(supabase, ["manage_users"]);
  return perms.manage_users;
}

export async function updateUser(userId, prevState, formData) {
  const supabase = createClient();
  if (!(await requireManageUsers(supabase))) return { error: "You don't have permission to edit users." };

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const roleId = String(formData.get("role_id") || "");

  if (!fullName) return { error: "Full name is required." };
  if (!roleId) return { error: "Select a role." };

  const { data: before } = await supabase.from("users").select("role_id, active").eq("id", userId).single();

  if (before.role_id !== roleId) {
    const orphan = await wouldOrphanSuperAdmin(supabase, userId, { newRoleId: roleId });
    if (orphan) {
      return { error: "Cannot change this role — this is the only active Super Admin. Assign Super Admin to another account first." };
    }
  }

  const { error } = await supabase.from("users").update({ full_name: fullName, phone: phone || null, role_id: roleId }).eq("id", userId);

  if (error) return { error: error.message };

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  await logAdminEvent(supabase, {
    actorId: actor.id,
    action: "user_updated",
    entityId: userId,
    newValue: { full_name: fullName, phone: phone || null },
  });

  if (before.role_id !== roleId) {
    await logAdminEvent(supabase, {
      actorId: actor.id,
      action: "user_role_changed",
      entityId: userId,
      previousValue: { role_id: before.role_id },
      newValue: { role_id: roleId },
    });
  }

  revalidatePath(`/admin/settings/users/${userId}`);
  return { error: null, success: true };
}

export async function setUserActive(userId, active) {
  const supabase = createClient();
  if (!(await requireManageUsers(supabase))) return { error: "You don't have permission to change user status." };

  if (!active) {
    const orphan = await wouldOrphanSuperAdmin(supabase, userId, { deactivating: true });
    if (orphan) {
      return { error: "Cannot deactivate — this is the only active Super Admin. Assign Super Admin to another account first." };
    }
  }

  const { error } = await supabase.from("users").update({ active }).eq("id", userId);
  if (error) return { error: error.message };

  // has_permission() already checks active=true, so authorization is lost the
  // instant this commits — this additionally revokes the refresh token so an
  // already-open session can't even keep loading the low-risk unguarded
  // pages, mirroring the existing "Sign out other sessions" pattern on
  // /admin/security.
  if (!active) {
    const admin = createAdminClient();
    const { error: signOutError } = await admin.auth.admin.signOut(userId, "global");
    if (signOutError) console.error("Failed to revoke sessions for deactivated user:", signOutError.message);
  }

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  await logAdminEvent(supabase, {
    actorId: actor.id,
    action: active ? "user_activated" : "user_deactivated",
    entityId: userId,
  });

  revalidatePath(`/admin/settings/users/${userId}`);
  revalidatePath("/admin/settings/users");
  return { error: null, success: true };
}
