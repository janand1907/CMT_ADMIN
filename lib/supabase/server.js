import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Next.js 14.2 pins `cookies()` as synchronous — do not `await` it here.
// (Next 15 made it async; this repo is not on Next 15.)
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — session refresh is handled by
            // middleware instead, so this can be safely ignored here.
          }
        },
      },
      global: {
        // postgrest-js calls the ambient global `fetch`, which Next.js patches to
        // cache GETs (force-cache) by default on 14.x. That silently serves stale
        // admin data after writes even though revalidatePath runs. Opt every
        // Supabase request out of Next's Data Cache.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
