"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";
import { AuthCard } from "@/components/admin/AuthCard";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function AdminLoginPage({ searchParams }) {
  const [state, formAction] = useFormState(login, { error: null });
  const resetSuccess = searchParams?.reset === "success";

  return (
    <AuthCard>
      <form action={formAction} className="space-y-4">
        <h1 className="text-center text-lg font-semibold text-gray-900">Admin Sign In</h1>

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

        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" required />
        </Field>

        <SubmitButton />

        <Link href="/admin/forgot-password" className="block text-center text-sm text-gray-500 hover:text-primary-600">
          Forgot password?
        </Link>
      </form>
    </AuthCard>
  );
}
