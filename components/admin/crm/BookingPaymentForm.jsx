"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBookingPayment } from "@/app/admin/(protected)/crm/bookings/[id]/actions";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/crm/bookingConstants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Save
    </Button>
  );
}

export function BookingPaymentForm({ bookingId, amountPaid, totalAmount, paymentStatus, canEdit }) {
  const [state, formAction] = useFormState(updateBookingPayment.bind(null, bookingId), { error: null });

  if (!canEdit) return null;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount Paid" htmlFor="amountPaid" hint={`Total ₹${totalAmount}`}>
          <Input id="amountPaid" name="amountPaid" type="number" min="0" max={totalAmount} step="0.01" defaultValue={amountPaid} />
        </Field>
        <Field label="Payment Status" htmlFor="paymentStatus">
          <Select id="paymentStatus" name="paymentStatus" defaultValue={paymentStatus}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <SubmitButton />
    </form>
  );
}
