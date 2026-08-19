// Vocabulary shared by the Marketing → Follow-up Automation / WhatsApp Templates
// admin pages. Must stay in sync with the `check` constraints in
// supabase/migrations/20260818190000_phase4_whatsapp_automation.sql.

export const AUTOMATION_ENGINE_STATUSES = ["active", "paused", "stopped"];

export const AUTOMATION_ENGINE_STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  stopped: "Stopped",
};

export const AUTOMATION_ENGINE_STATUS_TONES = {
  active: "green",
  paused: "amber",
  stopped: "red",
};

export const LEAD_AUTOMATION_STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  stopped: "Stopped",
  completed: "Completed",
};

export const LEAD_AUTOMATION_STATUS_TONES = {
  active: "green",
  paused: "amber",
  stopped: "red",
  completed: "gray",
};

// Mirrors enforce_automation_state_transition()'s own guard exactly — active can only
// move to paused/stopped (completed is engine-only, set by claim_followup_send() on
// hitting max_messages), paused can only resume to active or stop; stopped/completed
// are terminal, so they get no options here.
export const AUTOMATION_STATE_NEXT_STATUSES = {
  active: ["paused", "stopped"],
  paused: ["active", "stopped"],
  stopped: [],
  completed: [],
};

export const STOP_REASON_LABELS = {
  customer_booked: "Customer booked",
  customer_opt_out: "Customer opted out",
  lead_not_interested: "Lead not interested",
  lead_lost: "Lead lost",
  lead_cancelled: "Lead cancelled",
  admin_manual: "Stopped by admin",
  max_messages_reached: "Max messages reached",
};

export const WHATSAPP_TEMPLATE_PURPOSE_LABELS = {
  enquiry_confirmation: "Enquiry Confirmation",
  quotation: "Quotation",
  followup_morning: "Morning Follow-up",
  followup_evening: "Evening Follow-up",
  campaign: "Campaign",
  manual: "Manual",
};

export const WHATSAPP_MESSAGE_STATUS_LABELS = {
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
};

export const WHATSAPP_MESSAGE_STATUS_TONES = {
  queued: "gray",
  sent: "blue",
  delivered: "indigo",
  read: "green",
  failed: "red",
};
