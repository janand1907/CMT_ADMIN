import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestMeta } from "@/lib/auth/requestMeta";
import { parseUserAgent } from "@/lib/auth/parseUserAgent";

// Failed login attempts have no authenticated Postgres role, so they can't satisfy
// audit_logs_insert_self (actor_id = auth.uid()). Both outcomes go through the
// service-role client — the same "trusted, server-only write" pattern already used
// elsewhere in lib/supabase/admin.js — rather than weakening RLS for this table.
// Never stores the password, access token, or refresh token — only email, outcome,
// and connection metadata.
export async function recordLoginEvent({ email, userId = null, success }) {
  const { ip, userAgent } = getRequestMeta();
  const { browser, platform } = parseUserAgent(userAgent);

  const admin = createAdminClient();

  // audit_logs.entity_id is NOT NULL, and a failed attempt has no session to supply a
  // user id. Look up the targeted account by email so the attempt is attributed to it —
  // this also makes it show up on that account's own /admin/security activity list —
  // falling back to the raw email as entity_id when it doesn't match any account.
  let actorId = userId;
  if (!actorId && email) {
    const { data: matchedUser } = await admin.from("users").select("id").eq("email", email).maybeSingle();
    actorId = matchedUser?.id ?? null;
  }

  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId,
    action: success ? "login_success" : "login_failed",
    entity_type: "auth_session",
    entity_id: actorId ?? email ?? "unknown",
    new_value: {
      email,
      ip,
      user_agent: userAgent,
      browser,
      platform,
    },
  });

  if (error) {
    console.error("Failed to record login event:", error.message);
  }
}
