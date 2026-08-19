"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function NavLink({ href, label, onNavigate }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

function SidebarContent({ sections, onNavigate }) {
  return (
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{section.label}</p>
          <div className="mt-1 space-y-0.5">
            {section.items.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ sections, userEmail, userRole, logoutAction, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 px-4 py-4">
            <Link href="/admin/dashboard" className="text-sm font-semibold text-gray-900">
              ConnectMyTours Admin
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarContent sections={sections} />
          </div>
          <div className="border-t border-gray-100 p-4">
            <p className="truncate text-xs font-medium text-gray-700">{userEmail}</p>
            <p className="text-xs text-gray-400">{userRole}</p>
            <form action={logoutAction} className="mt-2">
              <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col bg-white shadow-modal">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <span className="text-sm font-semibold text-gray-900">ConnectMyTours Admin</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarContent sections={sections} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-gray-100 p-4">
              <p className="truncate text-xs font-medium text-gray-700">{userEmail}</p>
              <form action={logoutAction} className="mt-2">
                <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-900">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="text-sm font-semibold text-gray-900">
            ConnectMyTours Admin
          </Link>
          <div className="w-8" />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
