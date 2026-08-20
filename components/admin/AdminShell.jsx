"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HomeIcon, UsersIcon, PackageIcon, DocumentIcon, MegaphoneIcon, ChartBarIcon, UserIcon, SettingsIcon } from "@/components/icons";

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
// Desktop: narrow icon rail (default state) + a hover-revealed flyout panel
// per group. The flyout is a DOM descendant of the same wrapper the rail
// icons live in (positioned absolutely, but still nested inside it) — moving
// the mouse from an icon into the panel never leaves that wrapper, so
// onMouseLeave only fires once the pointer truly leaves the combined region.
// That's what avoids the classic "gap between rail and panel" flicker bug,
// without a setTimeout/debounce hack.
// ---------------------------------------------------------------------------

function RailIcon({ section, isActive, isOpen, onOpen }) {
  const Icon = NAV_ICON_MAP[section.icon];
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-label={section.label}
      aria-expanded={isOpen}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : isOpen
            ? "bg-gray-100 text-gray-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }`}
    >
      {Icon && <Icon className="h-5 w-5" />}
    </button>
  );
}

function FlyoutItemLink({ item, onNavigate }) {
  const pathname = usePathname();
  const active = isItemActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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

function FlyoutPanel({ section, userEmail, userRole, logoutAction, onNavigate }) {
  const isAccount = section.label === "Account";
  return (
    <div className="absolute left-14 top-0 z-20 flex h-full w-56 flex-col border-r border-gray-200 bg-white py-3 shadow-card">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{section.label}</p>
      <div className="space-y-0.5 px-2">
        {section.items.map((item) => (
          <FlyoutItemLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {isAccount && (
        <div className="mt-auto border-t border-gray-100 px-3 pt-3">
          <p className="truncate text-xs font-medium text-gray-700">{userEmail}</p>
          <p className="text-xs text-gray-400">{userRole}</p>
          <form action={logoutAction} className="mt-2">
            <button type="submit" className="text-xs font-medium text-gray-500 hover:text-primary-600">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DesktopNav({ sections, userEmail, userRole, logoutAction }) {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState(null);
  const openSection = sections.find((s) => s.label === openLabel) || null;

  return (
    <div className="relative hidden lg:flex" onMouseLeave={() => setOpenLabel(null)}>
      <div className="flex w-14 flex-col items-center gap-1 border-r border-gray-200 bg-white py-3">
        <Link href="/admin/dashboard" className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
          <Image src="/favicon.png" alt="Connect My Tours" width={28} height={28} priority className="h-7 w-7 rounded" />
        </Link>
        {sections.map((section) => (
          <RailIcon
            key={section.label}
            section={section}
            isActive={sectionIsActive(pathname, section)}
            isOpen={openLabel === section.label}
            onOpen={() => setOpenLabel(section.label)}
          />
        ))}
      </div>
      {openSection && (
        <FlyoutPanel
          section={openSection}
          userEmail={userEmail}
          userRole={userRole}
          logoutAction={logoutAction}
          onNavigate={() => setOpenLabel(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile: unchanged tap-based drawer with full labeled sections — hover has
// no equivalent on touch, so this keeps its own, separate, already-working
// interaction model rather than reusing the desktop rail.
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

function BrandLink({ onClick }) {
  return (
    <Link href="/admin/dashboard" onClick={onClick} className="flex items-center">
      <Image src="/logo.svg" alt="Connect My Tours" width={140} height={49} priority className="h-8 w-auto" />
    </Link>
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

export function AdminShell({ sections, userEmail, userRole, logoutAction, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useAuthStateRedirect();

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
      <DesktopNav sections={sections} userEmail={userEmail} userRole={userRole} logoutAction={logoutAction} />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-64 flex-col bg-white shadow-modal">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <BrandLink onClick={() => setMobileOpen(false)} />
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <MobileSidebarContent sections={sections} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-gray-100 p-3">
              <p className="truncate text-xs font-medium text-gray-700">{userEmail}</p>
              <p className="text-xs text-gray-400">{userRole}</p>
              <form action={logoutAction} className="mt-2">
                <button type="submit" className="text-xs font-medium text-gray-500 hover:text-primary-600">
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
          <BrandLink />
          <div className="w-8" />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
