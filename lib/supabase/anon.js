import { createClient } from "@supabase/supabase-js";

// Stateless anon-key client for server-side code with no cookie/session context
// (e.g. the public enquiry Route Handler). Only ever used to call narrow,
// SECURITY DEFINER RPCs like submit_enquiry() — normal table RLS still applies
// to anything else called through this client.
export function createAnonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
