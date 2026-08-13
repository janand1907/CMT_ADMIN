"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function NavDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef(null);

  function openMenu() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  }

  function scheduleClose() {
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-1">
        <Link
          href={item.href}
          className="py-2 font-medium text-secondary-500 hover:text-primary-600"
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`Toggle ${item.label} submenu`}
          onClick={() => setOpen((o) => !o)}
          className="rounded p-1 text-secondary-500 hover:text-primary-600"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path
              d="M2 4l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 min-w-[240px] rounded-xl bg-white p-2 shadow-card"
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
