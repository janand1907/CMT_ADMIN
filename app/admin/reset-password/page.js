import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasError = searchParams?.error === "invalid_link";
  const hasValidSession = Boolean(user) && !hasError;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Reset Password</h1>

        {hasValidSession ? (
          <ResetPasswordForm />
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/admin/forgot-password"
              className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center font-medium text-white"
            >
              Request new link
            </Link>
          </div>
        )}

        <Link href="/admin/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
