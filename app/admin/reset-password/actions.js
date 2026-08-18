"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(prevState, formData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = createClient();

  // Reset-password is only reachable with the short-lived recovery session created by
  // the auth callback. If it's missing (expired link, already used, repeated
  // submission after a prior success signed the session out), fail safely instead of
  // calling updateUser with no session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "This reset link has expired or was already used. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  // Force re-login with the new password rather than leaving the recovery session active.
  await supabase.auth.signOut();
  redirect("/admin/login?reset=success");
}
