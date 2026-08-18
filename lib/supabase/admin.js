import { createClient } from "@supabase/supabase-js";

// Service-role client for trusted, server-only writes — e.g. the public enquiry endpoint, which
// has no staff session and must bypass RLS after its own validation/rate-limiting has run.
// Never import this from a Client Component and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
