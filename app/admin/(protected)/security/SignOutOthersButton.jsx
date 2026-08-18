"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signOutOtherSessions } from "./actions";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" loading={pending}>
      Sign out other sessions
    </Button>
  );
}

export function SignOutOthersButton() {
  const [state, formAction] = useFormState(signOutOtherSessions, { error: null, success: false });

  return (
    <form action={formAction} className="space-y-3">
      {state?.success && (
        <Alert tone="success">All other sessions have been signed out.</Alert>
      )}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <SubmitButton />
    </form>
  );
}
