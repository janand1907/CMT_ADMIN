"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HomeIcon, UsersIcon, PackageIcon, DocumentIcon, MegaphoneIcon, ChartBarIcon, UserIcon, SettingsIcon } from "@/components/icons";
import { ProfileMenu } from "@/components/admin/ProfileMenu";

// navConfig.js stores a string key (not a component) since sections cross
// the server->client prop boundary in AdminNav.jsx — resolved here instead.
const NAV_ICON_MAP = {
  home: HomeIcon,
  users: UsersIcon,
  package: PackageIcon,
  document: DocumentIcon,
  megaphone: MegaphoneIcon,
  chart: ChartBarIcon,
  user: UserIcon,
  settings: SettingsIcon,
};

function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function sectionIsActive(pathname, section) {
  return section.items.some((item) => isItemActive(pathname, item.href));
}

// ---------------------------------------------------------------------------
// Desktop: two independent layers.
//   Layer A — the icon rail is ONE persistent element (not a second panel
//   that mounts on hover). Its own width transitions on :hover, in pure CSS
//   (Tailwind's hover:/group-hover: variants, no onMouseEnter/Leave state) —
//   80px collapsed, 128px on hover, revealing the label spans that are
//   always in the DOM, just clipped by overflow-hidden until it widens. It's
//   position:absolute inside a fixed-width reserved wrapper, so growing it
//   never affects the permanent submenu/content's layout.
//   Layer B — permanent submenu column, always visible, whose content is
//   driven by `selectedLabel` (synced to the current route only) — hover
//   never touches it.
//   Clicking a rail row is a real navigation to that group's first item —
//   the permanent submenu then follows the route change on its own via the
//   existing pathname-sync effect, no separate "select" handler needed.
// ---------------------------------------------------------------------------

function RailRow({ section, isSelected }) {
  const Icon = NAV_ICON_MAP[section.icon];
  const firstHref = section.items[0]?.href;
  return (
    <Link
      href={firstHref}
      aria-label={section.label}
      aria-current={isSelected ? "true" : undefined}
      className={`mx-2 flex items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        isSelected ? "bg-primary-50 text-primary-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">{section.label}</span>
    </Link>
  );
}

function SubmenuLink({ item }) {
  const pathname = usePathname();
  const active = isItemActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`block rounded-md border-l-2 px-2.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-primary-600 bg-primary-50 text-primary-700"
          : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {item.label}
    </Link>
  );
}

function PermanentSubmenu({ section }) {
  if (!section) return null;
  return (
    <div className="hidden w-56 shrink-0 border-r border-gray-200 bg-white py-4 lg:block">
      <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{section.label}</p>
      <nav className="space-y-0.5 px-3">
        {section.items.map((item) => (
          <SubmenuLink key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );
}

function DesktopNav({ sections, selectedLabel }) {
  const selectedSection = sections.find((s) => s.label === selectedLabel) || null;

  return (
    <div className="hidden lg:flex">
      {/* Reserves a fixed 80px in the real flex layout — the inner div's
          hover-expanded width is position:absolute, so it never resizes
          this wrapper and never pushes the permanent submenu/content. */}
      <div className="relative w-20 shrink-0">
        <div className="group absolute inset-y-0 left-0 z-30 flex w-20 flex-col gap-1 overflow-hidden border-r border-gray-200 bg-white py-3 shadow-none transition-all duration-200 ease-out hover:w-32 hover:shadow-card">
          {sections.map((section) => (
            <RailRow key={section.label} section={section} isSelected={selectedLabel === section.label} />
          ))}
        </div>
      </div>
      <PermanentSubmenu section={selectedSection} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile: unchanged tap-based drawer with full labeled sections — nav only,
// no account block (that lives in the header's ProfileMenu now, same as
// desktop, so sign-out has exactly one location regardless of viewport).
// ---------------------------------------------------------------------------

function MobileNavLink({ href, label, onNavigate }) {
  const pathname = usePathname();
  const active = isItemActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-md border-l-2 px-2.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-primary-600 bg-primary-50 text-primary-700"
          : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileSidebarContent({ sections, onNavigate }) {
  return (
    <nav className="space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{section.label}</p>
          <div className="mt-1 space-y-0.5">
            {section.items.map((item) => (
              <MobileNavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Header: full-width, above the nav/content row. Logo left (+ mobile
// hamburger), profile avatar/dropdown right — account/logout lives here now,
// not at the sidebar bottom, so the sidebar is navigation-only per the
// explicit instruction.
// ---------------------------------------------------------------------------

function Header({ onMobileMenuClick, userEmail, userRole, userName, logoutAction }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/admin/dashboard" className="flex items-center">
          <Image src="/logo.svg" alt="Connect My Tours" width={140} height={49} priority className="h-8 w-auto" />
        </Link>
      </div>
      <ProfileMenu userEmail={userEmail} userRole={userRole} userName={userName} logoutAction={logoutAction} />
    </header>
  );
}

// Root cause of "auto-logout doesn't work": nothing in the client ever
// listened for Supabase auth state changes. Middleware already re-checks the
// session on every server round-trip and correctly redirects then — the gap
// is an already-open tab whose session is invalidated in the background (a
// natural refresh-token expiry/revocation, or /admin/security's "Sign out
// other sessions", which calls signOut({scope:"others"}) and had no way to
// ever reach an already-open tab). onAuthStateChange fires SIGNED_OUT for
// exactly these cases — including a failed background token refresh — so
// this reacts immediately instead of waiting for the user's next navigation.
// Not a client-side security boundary: middleware/RLS remain the actual
// enforcement, this only makes an already-invalid session stop being usable.
function useAuthStateRedirect() {
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = "/admin/login";
    });
    return () => subscription.unsubscribe();
  }, []);
}

export function AdminShell({ sections, userEmail, userRole, userName, logoutAction, children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(
    () => sections.find((s) => sectionIsActive(pathname, s))?.label ?? sections[0]?.label
  );
  useAuthStateRedirect();

  // Current route is the source of truth for which group's permanent
  // submenu is shown (refresh, back/forward, direct URL) — hover never
  // touches this state, only this effect and a rail click do.
  useEffect(() => {
    const active = sections.find((s) => sectionIsActive(pathname, s));
    if (active) setSelectedLabel(active.label);
  }, [pathname, sections]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header
        onMobileMenuClick={() => setMobileOpen(true)}
        userEmail={userEmail}
        userRole={userRole}
        userName={userName}
        logoutAction={logoutAction}
      />

      <div className="flex flex-1">
        <DesktopNav sections={sections} selectedLabel={selectedLabel} />

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
            <div className="relative flex h-full w-64 flex-col bg-white shadow-modal">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <Image src="/logo.svg" alt="Connect My Tours" width={140} height={49} className="h-8 w-auto" />
                <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <MobileSidebarContent sections={sections} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
