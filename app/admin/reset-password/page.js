import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./ResetPasswordForm";
import { AuthCard } from "@/components/admin/AuthCard";
import { LinkButton } from "@/components/admin/ui/Button";

export default async function ResetPasswordPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasError = searchParams?.error === "invalid_link";
  const hasValidSession = Boolean(user) && !hasError;

  return (
    <AuthCard>
      <h1 className="text-center text-lg font-semibold text-gray-900">Reset Password</h1>

      {hasValidSession ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4">
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <LinkButton href="/admin/forgot-password" className="w-full">
            Request new link
          </LinkButton>
        </div>
      )}

      <Link href="/admin/login" className="block text-center text-sm text-gray-500 hover:text-primary-600">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
