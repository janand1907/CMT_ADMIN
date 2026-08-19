// Single source of truth for booking vocabulary, shared by the bookings
// list/detail/create pages. Must stay in sync with the `check` constraints
// and enforce_booking_status_transition() in
// supabase/migrations/20260818170000_phase3_5_bookings.sql.

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_TONES = {
  pending: "amber",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
};

// Only forward transitions the trigger allows — mirrors
// enforce_booking_status_transition() exactly. completed/cancelled are
// terminal, so they map to an empty list.
export const BOOKING_NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUSES = ["pending", "partial", "paid", "refunded"];

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_TONES = {
  pending: "amber",
  partial: "indigo",
  paid: "green",
  refunded: "gray",
};
