import Image from "next/image";

// Shared shell for the three public admin auth pages (login, forgot-password,
// reset-password) — same original logo (public/logo.svg, already used on the
// public site's Navbar/Footer) so the admin auth flow doesn't read as an
// unbranded, disconnected surface.
export function AuthCard({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="Connect My Tours" width={160} height={56} priority className="h-10 w-auto" />
        </div>
        {children}
      </div>
    </div>
  );
}
