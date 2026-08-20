"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function initialsFor(userEmail, userName) {
  if (userName && userName.trim()) {
    const parts = userName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (userEmail || "?").slice(0, 2).toUpperCase();
}

// Account/logout live here, not at the sidebar bottom — the sidebar is
// navigation only. Reuses the existing /admin/reset-password flow for
// "Change Password" (it already accepts any authenticated session, not just
// a recovery link — see actions.js) rather than building a second mechanism,
// and the existing logoutAction Server Action for sign-out.
export function ProfileMenu({ userEmail, userRole, userName, logoutAction }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white transition hover:bg-primary-700"
      >
        {initialsFor(userEmail, userName)}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 rounded-lg border border-gray-200 bg-white py-1.5 shadow-card">
          <div className="border-b border-gray-100 px-3 pb-2">
            <p className="truncate text-sm font-medium text-gray-900">{userName || userEmail}</p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
            {userRole && <p className="mt-0.5 text-xs text-gray-400">{userRole}</p>}
          </div>
          <Link
            href="/admin/reset-password"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Change Password
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="block w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
