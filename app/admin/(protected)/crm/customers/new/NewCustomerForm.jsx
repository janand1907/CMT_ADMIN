"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createCustomer } from "./actions";
import { Card } from "@/components/admin/ui/Card";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Customer
    </Button>
  );
}

export function NewCustomerForm() {
  const [state, formAction] = useFormState(createCustomer, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Phone" htmlFor="phone" required>
            <Input id="phone" name="phone" required />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp" hint="Defaults to phone if left blank.">
            <Input id="whatsapp" name="whatsapp" />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input id="location" name="location" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" />
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
