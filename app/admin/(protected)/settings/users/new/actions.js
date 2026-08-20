"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getRequestOrigin } from "@/lib/auth/requestMeta";
import { logAdminEvent } from "@/lib/audit/logAdminEvent";

export async function createUser(prevState, formData) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_users"]);
  if (!perms.manage_users) return { error: "You don't have permission to create users." };

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const roleId = String(formData.get("role_id") || "");
  const active = formData.get("active") === "on";

  if (!fullName) return { error: "Full name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (!roleId) return { error: "Select a role." };

  // Auth users must go through Supabase Auth itself, not a plain table insert —
  // this creates the real auth.users row (service-role required for that) and
  // sends a magic-link invite email, reusing the exact same PKCE callback /
  // reset-password flow forgot-password already uses. No password ever passes
  // through this app.
  const admin = createAdminClient();
  const origin = getRequestOrigin();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/admin/auth/callback?next=/admin/reset-password`,
  });

  if (inviteError) {
    const msg = inviteError.message || "";
    if (/already.*(registered|exists)/i.test(msg)) {
      return { error: "A user with this email already exists." };
    }
    if (inviteError.code === "over_email_send_rate_limit" || /rate limit/i.test(msg)) {
      return { error: "Too many invitation emails have been sent recently. Please wait a few minutes and try again." };
    }
    return { error: "Could not create the user account. Please try again." };
  }

  const newUserId = invited.user.id;

  // handle_new_auth_user() has already inserted a role_id: null row for this
  // id by the time inviteUserByEmail resolves (same-transaction trigger) — this
  // is a plain profile update, which RLS already allows for a manage_users
  // holder, so it goes through the normal authenticated client, not the
  // service-role one.
  const { error: profileError } = await supabase
    .from("users")
    .update({ full_name: fullName, phone: phone || null, role_id: roleId, active })
    .eq("id", newUserId);

  if (profileError) {
    return { error: "The invitation was sent, but the profile could not be finished. Contact a developer to assign a role." };
  }

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  await logAdminEvent(supabase, {
    actorId: actor.id,
    action: "user_created",
    entityId: newUserId,
    newValue: { email, full_name: fullName, role_id: roleId, active },
  });

  redirect(`/admin/settings/users/${newUserId}`);
}
