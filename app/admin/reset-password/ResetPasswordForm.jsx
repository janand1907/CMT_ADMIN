"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {pending ? "Updating..." : "Update password"}
    </button>
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

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
