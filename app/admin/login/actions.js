"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordLoginEvent, recordLogoutEvent } from "@/lib/auth/recordLoginEvent";
import { getRequestMeta } from "@/lib/auth/requestMeta";
import { logServerError } from "@/lib/logging/logServerError";

// Same in-memory-per-process technique as app/api/enquiry/route.js's limiter
// (Phase 8) — but only failed attempts count, not every login. A legitimate
// staff member logging in repeatedly in a day must never get locked out;
// only repeated wrong passwords should. Keyed on IP+email so one bad actor
// guessing many emails from one IP, or one email being brute-forced from
// many IPs, both still get throttled independently per combination.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 5;
const failedAttempts = new Map();

function rateLimitKey(ip, email) {
  return `${ip}:${String(email).toLowerCase()}`;
}

function isRateLimited(key) {
  const now = Date.now();
  const timestamps = (failedAttempts.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  failedAttempts.set(key, timestamps);
  return timestamps.length >= RATE_LIMIT_MAX_FAILURES;
}

function recordFailure(key) {
  const now = Date.now();
  const timestamps = (failedAttempts.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  failedAttempts.set(key, timestamps);
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const { ip } = getRequestMeta();
  const key = rateLimitKey(ip, email);

  if (isRateLimited(key)) {
    return { error: "Too many failed attempts. Please try again in a few minutes." };
  }

  const supabase = createClient();
  let data, error;
  try {
    ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch (thrown) {
    // Genuinely unexpected (network/Supabase outage), distinct from a normal
    // wrong-password `error` return above — the only thing in this action
    // worth a server error log, not a user-facing detail.
    await logServerError("server_action", thrown, { stage: "signInWithPassword" });
    return { error: "Something went wrong. Please try again." };
  }

  if (error) {
    recordFailure(key);
    await recordLoginEvent({ email, success: false });
    return { error: error.message };
  }

  await recordLoginEvent({ email, userId: data.user.id, success: true });

  redirect("/admin/dashboard");
}

export async function logout() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();
  if (user) await recordLogoutEvent({ userId: user.id });

  redirect("/admin/login");
}
