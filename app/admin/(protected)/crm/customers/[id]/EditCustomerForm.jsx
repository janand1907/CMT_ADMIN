"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateCustomer } from "./actions";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Save Changes
    </Button>
  );
}

export function EditCustomerForm({ customer }) {
  const [state, formAction] = useFormState(updateCustomer.bind(null, customer.id), { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {state?.success && <Alert tone="success">Customer updated.</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={customer.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" defaultValue={customer.phone} required />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" defaultValue={customer.whatsapp || ""} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={customer.email || ""} />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" defaultValue={customer.location || ""} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={customer.notes || ""} />
      </Field>

      <SubmitButton />
    </form>
  );
}
