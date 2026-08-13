"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { navLinks } from "@/data/nav";
import NavDropdown from "./NavDropdown";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-30 transition-colors duration-200 ${
        scrolled ? "bg-white shadow-soft" : "bg-gradient-to-b from-white/95 via-white/80 to-transparent pb-6"
      }`}
    >
      <nav
        className="container-page flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/logo.svg"
            alt="Connect My Tours logo"
            width={160}
            height={56}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) =>
            item.children ? (
              <li key={item.href}>
                <NavDropdown item={item} />
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="py-2 font-medium text-secondary-500 hover:text-primary-600"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>

        <div className="hidden md:block">
          <Link href="/contact-us" className="btn-secondary">
            Plan My Trip
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-2xl text-neutral-700 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {mobileOpen && (
        <MobileMenu
          navLinks={navLinks}
          onNavigate={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}
