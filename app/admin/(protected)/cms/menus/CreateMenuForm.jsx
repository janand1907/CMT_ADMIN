"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createMenu } from "./actions";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { MENU_LOCATION_LABELS } from "@/lib/cms/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Create Menu
    </Button>
  );
}

export function CreateMenuForm() {
  const [state, formAction] = useFormState(createMenu, { error: null });

  return (
    <form action={formAction} className="flex items-end gap-3">
      {state?.error && <Alert tone="error" className="w-full">{state.error}</Alert>}
      <div className="flex-1">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" required />
        </Field>
      </div>
      <div className="w-40">
        <Field label="Location" htmlFor="location">
          <Select id="location" name="location" defaultValue="custom">
            {Object.entries(MENU_LOCATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <SubmitButton />
    </form>
  );
}
