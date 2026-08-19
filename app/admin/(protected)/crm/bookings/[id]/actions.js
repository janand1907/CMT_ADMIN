"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function bookingPath(bookingId) {
  return `/admin/crm/bookings/${bookingId}`;
}

export async function updateBookingStatus(bookingId, prevState, formData) {
  const supabase = createClient();
  // enforce_booking_status_transition_trg raises its own readable exception
  // for an invalid transition, and bookings_update_scoped RLS enforces
  // edit_bookings — no need to duplicate either check here.
  const { error } = await supabase.from("bookings").update({ booking_status: formData.get("status") }).eq("id", bookingId);
  if (error) return { error: error.message };
  revalidatePath(bookingPath(bookingId));
  return { error: null };
}

export async function updateBookingPayment(bookingId, prevState, formData) {
  const supabase = createClient();
  const amountPaid = formData.get("amountPaid");
  // bookings_amount_paid_not_over_total check constraint rejects amount_paid
  // > total_amount, so an over-payment surfaces as a readable Postgres error.
  const { error } = await supabase
    .from("bookings")
    .update({
      amount_paid: amountPaid === "" ? 0 : Number(amountPaid),
      payment_status: formData.get("paymentStatus"),
    })
    .eq("id", bookingId);
  if (error) return { error: error.message };
  revalidatePath(bookingPath(bookingId));
  return { error: null };
}

export async function updateBookingDetails(bookingId, prevState, formData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      travel_start_date: formData.get("travelStartDate") || null,
      travel_end_date: formData.get("travelEndDate") || null,
      notes: formData.get("notes") || null,
    })
    .eq("id", bookingId);
  if (error) return { error: error.message };
  revalidatePath(bookingPath(bookingId));
  return { error: null };
}
