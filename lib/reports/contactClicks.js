// Server-side only, session-scoped client — RLS (contact_click_events_select_managed,
// gated on has_permission('view_reports')) is the real visibility boundary here, same
// convention as lib/reports/queries.js. Kept as its own file rather than added to
// queries.js since contact-click tracking is a separate domain from the CRM reports there.

const RANGE_DAYS = { today: 0, yesterday: 1, "7d": 7, "30d": 30 };

// Plain rolling/day-boundary windows in UTC — this report doesn't carry the IST
// business-hours precision lib/reports/queries.js uses for lead reports, since click
// timing here is only ever eyeballed at day granularity.
function rangeStartUtc(range) {
  const now = new Date();
  if (range === "today") return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (range === "yesterday") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - 1);
    return start;
  }
  const days = RANGE_DAYS[range];
  return days ? new Date(now.getTime() - days * 24 * 60 * 60000) : null;
}

function rangeEndUtc(range) {
  if (range !== "yesterday") return null;
  return new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
}

const PAGE_SIZE = 25;

export async function getContactClickEvents(supabase, { action, device, range, page = 1 } = {}) {
  let query = supabase
    .from("contact_click_events")
    .select("id, action_type, page_path, device_type, os, browser, country, region, city, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (action === "call" || action === "whatsapp") query = query.eq("action_type", action);
  if (["mobile", "tablet", "desktop"].includes(device)) query = query.eq("device_type", device);

  const start = rangeStartUtc(range);
  if (start) query = query.gte("created_at", start.toISOString());
  const end = rangeEndUtc(range);
  if (end) query = query.lt("created_at", end.toISOString());

  const from = (Math.max(1, page) - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) return { error: error.message };
  return { data: { rows: data || [], count: count || 0, pageSize: PAGE_SIZE } };
}

export async function getContactClickSummary(supabase) {
  const todayStart = rangeStartUtc("today").toISOString();

  const [totalCalls, totalWhatsapp, callsToday, whatsappToday] = await Promise.all([
    supabase.from("contact_click_events").select("id", { count: "exact", head: true }).eq("action_type", "call"),
    supabase.from("contact_click_events").select("id", { count: "exact", head: true }).eq("action_type", "whatsapp"),
    supabase
      .from("contact_click_events")
      .select("id", { count: "exact", head: true })
      .eq("action_type", "call")
      .gte("created_at", todayStart),
    supabase
      .from("contact_click_events")
      .select("id", { count: "exact", head: true })
      .eq("action_type", "whatsapp")
      .gte("created_at", todayStart),
  ]);

  const firstError = [totalCalls, totalWhatsapp, callsToday, whatsappToday].find((r) => r.error)?.error;
  if (firstError) return { error: firstError.message };

  return {
    data: {
      totalCalls: totalCalls.count || 0,
      totalWhatsapp: totalWhatsapp.count || 0,
      totalContactClicks: (totalCalls.count || 0) + (totalWhatsapp.count || 0),
      callsToday: callsToday.count || 0,
      whatsappToday: whatsappToday.count || 0,
    },
  };
}
