"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createLead } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/crm/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Lead
    </Button>
  );
}

export function NewLeadForm({ sources, staff }) {
  const [state, formAction] = useFormState(createLead, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Customer" />
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
      </Card>

      <Card>
        <CardHeader title="Trip Details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Destination" htmlFor="destination">
            <Input id="destination" name="destination" />
          </Field>
          <Field label="Departure City" htmlFor="departureCity">
            <Input id="departureCity" name="departureCity" />
          </Field>
          <Field label="Travel Date" htmlFor="travelDate">
            <Input id="travelDate" name="travelDate" type="date" />
          </Field>
          <Field label="Return Date" htmlFor="returnDate">
            <Input id="returnDate" name="returnDate" type="date" />
          </Field>
          <Field label="Adults" htmlFor="adults">
            <Input id="adults" name="adults" type="number" min="0" defaultValue="1" />
          </Field>
          <Field label="Kids" htmlFor="kids">
            <Input id="kids" name="kids" type="number" min="0" defaultValue="0" />
          </Field>
          <Field label="Infants" htmlFor="infants">
            <Input id="infants" name="infants" type="number" min="0" defaultValue="0" />
          </Field>
          <Field label="Budget (₹)" htmlFor="budget">
            <Input id="budget" name="budget" type="number" min="0" step="0.01" />
          </Field>
          <Field label="Package Interested" htmlFor="packageInterested">
            <Input id="packageInterested" name="packageInterested" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Message / Requirements" htmlFor="message">
            <Textarea id="message" name="message" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Pipeline" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue="medium">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Source" htmlFor="sourceId">
            <Select id="sourceId" name="sourceId" defaultValue="">
              <option value="">Unspecified</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assign To" htmlFor="assignedTo">
            <Select id="assignedTo" name="assignedTo" defaultValue="">
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
