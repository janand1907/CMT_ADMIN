"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateQuotationDetails } from "@/app/admin/(protected)/crm/quotations/[id]/actions";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Save
    </Button>
  );
}

export function QuotationDetailsForm({ quotationId, validUntil, notes, termsAndConditions, discountAmount }) {
  const [state, formAction] = useFormState(updateQuotationDetails.bind(null, quotationId), { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valid Until" htmlFor="validUntil">
          <Input id="validUntil" name="validUntil" type="date" defaultValue={validUntil || ""} />
        </Field>
        <Field label="Quotation Discount ₹" htmlFor="discountAmount">
          <Input id="discountAmount" name="discountAmount" type="number" min="0" step="0.01" defaultValue={discountAmount ?? 0} />
        </Field>
      </div>
      <Field label="Notes (shown to customer)" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={notes || ""} />
      </Field>
      <Field label="Terms & Conditions" htmlFor="termsAndConditions">
        <Textarea id="termsAndConditions" name="termsAndConditions" defaultValue={termsAndConditions || ""} />
      </Field>
      <SubmitButton />
    </form>
  );
}
