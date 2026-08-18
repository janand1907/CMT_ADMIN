"use server";

import { createClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/auth/requestMeta";

// Supabase's resetPasswordForEmail never reveals whether the address is registered —
// it returns success either way. We keep that property by always returning the same
// generic message, regardless of outcome, so no branch of this action can be used to
// enumerate admin accounts.
export async function requestPasswordReset(prevState, formData) {
  const email = String(formData.get("email") || "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const supabase = createClient();
  const origin = getRequestOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/auth/callback?next=/admin/reset-password`,
  });

  if (error) {
    console.error("resetPasswordForEmail error:", error.message);
  }

  return {
    status: "success",
    message: "If that email is registered, a password reset link has been sent.",
  };
}
