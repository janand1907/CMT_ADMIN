// Single source of truth for lead pipeline / task vocabulary, shared by every
// CRM list, detail, and form page — keeps status labels/colors/options from
// drifting apart as pages accumulate. Must stay in sync with the `check`
// constraints in supabase/migrations/20260817120000_phase1_crm.sql.

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quotation_prepared",
  "quotation_sent",
  "follow_up",
  "negotiation",
  "confirmed",
  "not_interested",
  "lost",
  "cancelled",
];

export const LEAD_STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  quotation_prepared: "Quotation Prepared",
  quotation_sent: "Quotation Sent",
  follow_up: "Follow-up",
  negotiation: "Negotiation",
  confirmed: "Confirmed",
  not_interested: "Not Interested",
  lost: "Lost",
  cancelled: "Cancelled",
};

export const LEAD_STATUS_TONES = {
  new: "blue",
  contacted: "indigo",
  quotation_prepared: "purple",
  quotation_sent: "purple",
  follow_up: "amber",
  negotiation: "amber",
  confirmed: "green",
  not_interested: "gray",
  lost: "red",
  cancelled: "gray",
};

export const PRIORITIES = ["low", "medium", "high"];

export const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };

export const PRIORITY_TONES = { low: "gray", medium: "amber", high: "red" };

export const TASK_TYPES = ["call", "send_quotation", "follow_up", "request_payment", "confirm_booking"];

export const TASK_TYPE_LABELS = {
  call: "Call",
  send_quotation: "Send Quotation",
  follow_up: "Follow-up",
  request_payment: "Request Payment",
  confirm_booking: "Confirm Booking",
};

export const TASK_STATUSES = ["pending", "in_progress", "done", "cancelled"];

export const TASK_STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export const TASK_STATUS_TONES = { pending: "gray", in_progress: "blue", done: "green", cancelled: "red" };

export function formatDate(value, options) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", ...options });
}

export function formatDateOnly(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}
