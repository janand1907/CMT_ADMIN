"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export default function AdminLoginPage({ searchParams }) {
  const [state, formAction] = useFormState(login, { error: null });
  const resetSuccess = searchParams?.reset === "success";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-gray-900">Admin Sign In</h1>

        {resetSuccess && !state?.error && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Password updated. Sign in with your new password.
          </p>
        )}

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
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

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <SubmitButton />

        <Link href="/admin/forgot-password" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          Forgot password?
        </Link>
      </form>
    </div>
  );
}
