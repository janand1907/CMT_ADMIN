"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordLoginEvent } from "@/lib/auth/recordLoginEvent";

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordLoginEvent({ email, success: false });
    return { error: error.message };
  }

  await recordLoginEvent({ email, userId: data.user.id, success: true });

  redirect("/admin/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
