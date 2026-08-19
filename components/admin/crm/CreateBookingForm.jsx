"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBookingFromQuotation } from "@/app/admin/(protected)/crm/quotations/[id]/actions";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Create Booking
    </Button>
  );
}

export function CreateBookingForm({ quotationId }) {
  const [state, formAction] = useFormState(createBookingFromQuotation.bind(null, quotationId), { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Travel Start Date" htmlFor="travelStartDate" required>
          <Input id="travelStartDate" name="travelStartDate" type="date" required />
        </Field>
        <Field label="Travel End Date" htmlFor="travelEndDate">
          <Input id="travelEndDate" name="travelEndDate" type="date" />
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" />
      </Field>
      <SubmitButton />
    </form>
  );
}
