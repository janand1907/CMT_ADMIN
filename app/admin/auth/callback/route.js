import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the PKCE `code` from a Supabase recovery-link email for a session.
// Must be a Route Handler (not a page) — persisting the session requires setting
// cookies during the exchange, which needs a real Set-Cookie response.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/admin/reset-password";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/reset-password?error=invalid_link`);
}
