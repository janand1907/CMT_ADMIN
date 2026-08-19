"use client";

import { useFormState } from "react-dom";
import { updateBookingStatus } from "@/app/admin/(protected)/crm/bookings/[id]/actions";
import { Select } from "@/components/admin/ui/FormControls";
import { BOOKING_NEXT_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/crm/bookingConstants";

export function BookingStatusControl({ bookingId, status, canEdit }) {
  const [state, formAction] = useFormState(updateBookingStatus.bind(null, bookingId), { error: null });
  const nextStatuses = BOOKING_NEXT_STATUSES[status] || [];

  return (
    <form action={formAction}>
      <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
      <Select
        name="status"
        defaultValue={status}
        disabled={!canEdit || nextStatuses.length === 0}
        onChange={(e) => e.target.form.requestSubmit()}
        className="w-44"
      >
        <option value={status}>{BOOKING_STATUS_LABELS[status]}</option>
        {nextStatuses.map((s) => (
          <option key={s} value={s}>
            Mark {BOOKING_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      {state?.error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
