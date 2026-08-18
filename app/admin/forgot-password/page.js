"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, { status: null, message: null });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Forgot Password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your admin email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {state?.status === "success" ? (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.status === "error" && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.message}
              </p>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <SubmitButton />
          </form>
        )}

        <Link href="/admin/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
