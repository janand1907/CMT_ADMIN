import { createAnonClient } from "@/lib/supabase/anon";
import { parseUserAgent } from "@/lib/auth/parseUserAgent";

// Modeled directly on app/api/enquiry/route.js's client-IP resolution.
function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || null;
}

// Best-effort only: on any failure/timeout this returns nulls and the click is
// still recorded without location, since tracking must never block or fail the
// customer's Call/WhatsApp action. The IP is used only for this in-memory
// lookup and is never returned, logged, or passed to record_contact_click.
async function lookupCoarseLocation(ip) {
  if (!ip || ip === "unknown") return { country: null, region: null, city: null };

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(2000) }
    );
    const data = await response.json();
    if (data.status !== "success") return { country: null, region: null, city: null };
    return { country: data.country || null, region: data.regionName || null, city: data.city || null };
  } catch {
    return { country: null, region: null, city: null };
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { actionType, pagePath } = body || {};
  if (actionType !== "call" && actionType !== "whatsapp") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  const { browser, platform, deviceType } = parseUserAgent(userAgent);
  const ip = getClientIp(request);
  const location = await lookupCoarseLocation(ip);

  const supabase = createAnonClient();
  const { error } = await supabase.rpc("record_contact_click", {
    p_action_type: actionType,
    p_page_path: typeof pagePath === "string" && pagePath ? pagePath : "/",
    p_device_type: deviceType,
    p_os: platform,
    p_browser: browser,
    p_country: location.country,
    p_region: location.region,
    p_city: location.city,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[contact-click] failed to record event:", error.message);
  }

  // Always 200 — the caller (TrackedContactLink) never inspects this response;
  // the tel:/wa.me navigation has already proceeded regardless.
  return Response.json({ ok: true });
}
