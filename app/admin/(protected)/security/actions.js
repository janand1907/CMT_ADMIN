"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// scope: "others" revokes every refresh token except the one behind the
// current request's cookies, so this device stays signed in while all other
// devices/browsers are forced to re-authenticate.
export async function signOutOtherSessions() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut({ scope: "others" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/security");
  return { error: null, success: true };
}
