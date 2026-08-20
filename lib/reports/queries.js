// Server-side only. Every function takes the caller's own session-scoped
// client (lib/supabase/server.js) — never the service-role client — so RLS
// (Admin/Manager's existing view_leads_all/view_quotations_all/
// view_bookings_all/view_whatsapp_messages_all/manage_whatsapp_automation/
// manage_whatsapp_campaigns grants from Phase 1/3/3.5/4) is the real
// visibility boundary, not application code.
//
// Aggregation is done here, once per table per report, by fetching only the
// lean columns each metric needs and reducing in JS — not a SQL view/function.
// Justified by scale: this is a single small travel agency's CRM (low
// hundreds of rows, not millions), so one plain query per table stays well
// within "avoid fetching thousands of rows" while avoiding new DB surface
// area for a dataset this size. Raw rows never reach the browser — only the
// computed aggregates are returned from these Server Component-only functions.
//
// Every function returns { data } on success or { error: string } on
// failure — callers must render an explicit error state, never treat a
// failed query as an empty/zero result (Phase 7 instruction §12/§22).

const IST_OFFSET_MINUTES = 5.5 * 60;

// Fixed +5:30 offset, no DST in India — safe to compute without a tz database.
// Matches the Asia/Kolkata convention already used for customer-facing dates
// (lib/email/enquiry-email.js).
function istTodayBoundsUtc() {
  const now = new Date();
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60000);
  const istMidnightAsUtc = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
  const startUtc = new Date(istMidnightAsUtc.getTime() - IST_OFFSET_MINUTES * 60000);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60000);
  return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() };
}

function istDateLabel(isoTimestamp) {
  const shifted = new Date(new Date(isoTimestamp).getTime() + IST_OFFSET_MINUTES * 60000);
  return shifted.toISOString().slice(0, 10);
}

// [{ label, count }], most frequent first, stable-sorted by label as a tiebreaker.
function groupCount(rows, labelFn) {
  const counts = new Map();
  for (const row of rows) {
    const label = labelFn(row);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Dashboard KPIs (master plan §12). "Conversion rate" is split into Lead
// conversion rate and Quotation conversion rate per §2's more specific
// wording (explicit decision — see CONNECTMYTOURS_STATUS.md Phase 7).
export async function getDashboardKpis(supabase) {
  const nowIso = new Date().toISOString();
  const [leadsRes, quotationsRes, bookingsRes, followupsRes] = await Promise.all([
    supabase.from("leads").select("id, status, created_at"),
    supabase.from("quotations").select("id, status, sent_at, total_amount"),
    supabase.from("bookings").select("id, booking_status"),
    supabase.from("lead_followups").select("id", { count: "exact", head: true }).eq("completed", false).lt("scheduled_at", nowIso),
  ]);

  const error = leadsRes.error || quotationsRes.error || bookingsRes.error || followupsRes.error;
  if (error) return { error: error.message };

  const leads = leadsRes.data || [];
  const quotations = quotationsRes.data || [];
  const bookings = bookingsRes.data || [];

  const { startUtc, endUtc } = istTodayBoundsUtc();
  const todaysEnquiries = leads.filter((l) => l.created_at >= startUtc && l.created_at < endUtc).length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const lostLeads = leads.filter((l) => l.status === "lost").length;
  const confirmedLeadCount = leads.filter((l) => l.status === "confirmed").length;
  const leadConversionRate = leads.length > 0 ? round1((confirmedLeadCount / leads.length) * 100) : 0;

  const pendingQuotations = quotations.filter((q) => ["draft", "sent", "viewed"].includes(q.status)).length;
  const sentQuotations = quotations.filter((q) => q.sent_at != null);
  const acceptedQuotations = quotations.filter((q) => q.status === "accepted");
  const quotationConversionRate = sentQuotations.length > 0 ? round1((acceptedQuotations.length / sentQuotations.length) * 100) : 0;
  // Excludes rejected/expired ("dead" quotations) — same "value reflects live/won
  // business, not dead-ends" rule as Sales Reports' Booking value.
  const quotationValue = quotations
    .filter((q) => !["rejected", "expired"].includes(q.status))
    .reduce((sum, q) => sum + Number(q.total_amount || 0), 0);

  const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed").length;

  return {
    data: {
      todaysEnquiries,
      newLeads,
      pendingQuotations,
      followUpsDue: followupsRes.count || 0,
      confirmedBookings,
      lostLeads,
      leadConversionRate,
      quotationConversionRate,
      quotationValue,
    },
  };
}

// Lead Reports (master plan §12): date-wise, source-wise, destination-wise,
// package-wise, staff-wise, status-wise. destination/package_interested are
// free-text fields on leads (not FKs into the Phase 2 packages/destinations
// catalog — a lead can express interest before matching an exact package),
// so grouping is by the literal text value, "Unspecified" when blank/null.
export async function getLeadReports(supabase) {
  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, destination, package_interested, status, lead_sources(name), assigned_user:users(full_name)");
  if (error) return { error: error.message };

  const leads = data || [];

  return {
    data: {
      total: leads.length,
      dateWise: groupCount(leads, (l) => istDateLabel(l.created_at)),
      sourceWise: groupCount(leads, (l) => l.lead_sources?.name || "Unspecified"),
      destinationWise: groupCount(leads, (l) => (l.destination || "").trim() || "Unspecified"),
      packageWise: groupCount(leads, (l) => (l.package_interested || "").trim() || "Unspecified"),
      staffWise: groupCount(leads, (l) => l.assigned_user?.full_name || "Unassigned"),
      statusWise: groupCount(leads, (l) => l.status),
    },
  };
}

// Sales Reports (master plan §12): quotations sent/accepted/rejected,
// booking value, conversion rate.
export async function getSalesReports(supabase) {
  const [quotationsRes, bookingsRes] = await Promise.all([
    supabase.from("quotations").select("id, status, sent_at, total_amount"),
    supabase.from("bookings").select("id, booking_status, total_amount"),
  ]);
  const error = quotationsRes.error || bookingsRes.error;
  if (error) return { error: error.message };

  const quotations = quotationsRes.data || [];
  const bookings = bookingsRes.data || [];

  const sent = quotations.filter((q) => q.sent_at != null);
  const accepted = quotations.filter((q) => q.status === "accepted");
  const rejected = quotations.filter((q) => q.status === "rejected");
  const conversionRate = sent.length > 0 ? round1((accepted.length / sent.length) * 100) : 0;
  // Excludes cancelled bookings — explicit decision, see CONNECTMYTOURS_STATUS.md Phase 7.
  const bookingValue = bookings
    .filter((b) => b.booking_status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return {
    data: {
      quotationsSent: sent.length,
      quotationsAccepted: accepted.length,
      quotationsRejected: rejected.length,
      bookingValue,
      conversionRate,
    },
  };
}

// Marketing Reports (master plan §12): WhatsApp sent/delivered/failed,
// follow-up activity, campaign performance. Status funnel is
// queued -> sent -> delivered -> read, or failed (Phase 4 schema) — "sent"
// counts everything that left the queue (sent/delivered/read), "delivered"
// the subset actually confirmed delivered (delivered/read), "failed" the
// terminal failure state. Zero rows today is expected, not a bug: Phase 4
// remains QA-incomplete pending real Meta/staging credentials (no message
// has ever actually been sent), so this legitimately renders an empty state.
export async function getMarketingReports(supabase) {
  const [messagesRes, automationRes, campaignsRes] = await Promise.all([
    supabase.from("whatsapp_messages").select("id, status"),
    supabase.from("lead_followup_automation_state").select("id, status, messages_sent"),
    supabase
      .from("campaigns")
      .select("id, name, status, total_recipients, sent_count, failed_count, created_at")
      .order("created_at", { ascending: false }),
  ]);
  const error = messagesRes.error || automationRes.error || campaignsRes.error;
  if (error) return { error: error.message };

  const messages = messagesRes.data || [];
  const automationStates = automationRes.data || [];

  const sentCount = messages.filter((m) => ["sent", "delivered", "read"].includes(m.status)).length;
  const deliveredCount = messages.filter((m) => ["delivered", "read"].includes(m.status)).length;
  const failedCount = messages.filter((m) => m.status === "failed").length;

  return {
    data: {
      whatsapp: { sent: sentCount, delivered: deliveredCount, failed: failedCount, total: messages.length },
      followUpActivity: {
        byStatus: groupCount(automationStates, (a) => a.status),
        totalMessagesSent: automationStates.reduce((sum, a) => sum + (a.messages_sent || 0), 0),
      },
      campaigns: campaignsRes.data || [],
    },
  };
}
