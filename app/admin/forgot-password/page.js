"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "./actions";
import { AuthCard } from "@/components/admin/AuthCard";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? "Sending..." : "Send reset link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, { status: null, message: null });

  return (
    <AuthCard>
      <div>
        <h1 className="text-center text-lg font-semibold text-gray-900">Forgot Password</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Enter your admin email and we&apos;ll send you a password reset link.
        </p>
      </div>

      {state?.status === "success" ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.message}</p>
      ) : (
        <form action={formAction} className="space-y-4">
          {state?.status === "error" && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
          )}

          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </Field>

          <SubmitButton />
        </form>
      )}

      <Link href="/admin/login" className="block text-center text-sm text-gray-500 hover:text-primary-600">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
