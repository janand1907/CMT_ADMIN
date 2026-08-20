"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateUser } from "./actions";
import { Field, Input, Select } from "@/components/admin/ui/FormControls";
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

export function EditUserForm({ user, roles }) {
  const [state, formAction] = useFormState(updateUser.bind(null, user.id), { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {state?.success && <Alert tone="success">User updated.</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="full_name" required>
          <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={user.phone || ""} />
        </Field>
        <Field label="Role" htmlFor="role_id" required>
          <Select id="role_id" name="role_id" defaultValue={user.role_id || ""} required>
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

      <SubmitButton />
    </form>
  );
}
