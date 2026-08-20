import { createAdminClient } from "@/lib/supabase/admin";

// Phase 8: lightweight in-house error log (master plan §14 "Error logging"),
// no external monitoring service — explicit decision to avoid a new
// dependency/account for this. Best-effort: a failure to write the log must
// never break the caller's own error handling, so this never throws.
export async function logServerError(source, error, context = {}) {
  try {
    const admin = createAdminClient();
    await admin.from("error_logs").insert({
      source,
      message: error instanceof Error ? error.message : String(error),
      context,
    });
  } catch (loggingError) {
    console.error("[logServerError] failed to write error log:", loggingError);
  }
}
