// Single source of truth for quotation vocabulary, shared by the quotations
// list/builder/detail pages. Must stay in sync with the `check` constraint on
// public.quotations.status and the transition rules in
// enforce_quotation_status_transition() in
// supabase/migrations/20260818090000_phase3_quotations.sql.

export const QUOTATION_STATUSES = ["draft", "sent", "viewed", "accepted", "rejected", "expired"];

export const QUOTATION_STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

export const QUOTATION_STATUS_TONES = {
  draft: "gray",
  sent: "blue",
  viewed: "indigo",
  accepted: "green",
  rejected: "red",
  expired: "amber",
};

// Only forward transitions the UI exposes directly via a status update. `draft`
// is never a manual target here — the only way back to draft is
// create_quotation_revision(), matching the DB trigger's own comment that "the
// app UI never exposes a bare set status to draft control".
export const QUOTATION_NEXT_STATUSES = {
  draft: ["sent"],
  sent: ["viewed", "accepted", "rejected", "expired"],
  viewed: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

// Revision is only meaningful once something has actually been sent, and
// never once accepted (booking-committed) — mirrors create_quotation_revision()'s
// own guard clauses exactly.
export function canRevise(status) {
  return status !== "draft" && status !== "accepted";
}

export const QUOTATION_MESSAGE_CHANNEL_LABELS = {
  status: "Status",
  web_link: "Web Link",
  whatsapp: "WhatsApp",
  email: "Email",
  note: "Note",
};

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateOnly(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}
