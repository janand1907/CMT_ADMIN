"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createUser } from "./actions";
import { Card } from "@/components/admin/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Send Invitation
    </Button>
  );
}

export function NewUserForm({ roles }) {
  const [state, formAction] = useFormState(createUser, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="full_name" required>
            <Input id="full_name" name="full_name" required />
          </Field>
          <Field label="Email" htmlFor="email" required hint="An invitation link is sent here to set up their password.">
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" />
          </Field>
          <Field label="Role" htmlFor="role_id" required>
            <Select id="role_id" name="role_id" required defaultValue="">
              <option value="" disabled>
                Select a role
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Checkbox name="active" defaultChecked label="Active (can sign in once they set a password)" />
        </div>
      </Card>

      <SubmitButton />
    </form>
  );
}
