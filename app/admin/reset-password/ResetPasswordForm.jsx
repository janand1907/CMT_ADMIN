"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "./actions";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? "Updating..." : "Update password"}
    </Button>
  );
}

export default function ResetPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-gray-500">Choose a new password for your admin account.</p>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Field label="New password" htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={8} />
      </Field>

      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </Field>

      <SubmitButton />
    </form>
  );
}
