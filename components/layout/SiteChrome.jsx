"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromoPopup from "@/components/enquiry/PromoPopup";
import MobileContactBar from "@/components/layout/MobileContactBar";

// Admin routes render their own chrome (or none at all), so the public
// Navbar/Footer/PromoPopup must not wrap them. Splitting this out avoids
// restructuring the app into route groups just to get a second root layout.
export default function SiteChrome({ children, headerLinks, footerLinks }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return children;
  }

  // The Homepage's hero is a full-bleed banner designed to sit under the
  // transparent/fading header (Navbar.jsx), so it must not get this offset.
  // Every other public page has ordinary content starting at the top, which
  // Navbar's fixed h-16 (64px, same at every breakpoint — it has no
  // responsive height variants) would otherwise hide the top of.
  const isHome = pathname === "/";

  return (
    <>
      <Navbar links={headerLinks} />
      <main id="main-content" className={isHome ? undefined : "pt-16"}>
        {children}
      </main>
      <Footer links={footerLinks} />
      {/* Matches MobileContactBar's own height — keeps the fixed bottom bar
          from covering the last row of footer content when scrolled to the
          bottom, mobile only (the bar itself is mobile-only). */}
      <div aria-hidden="true" className="h-16 sm:hidden" />
      <PromoPopup />
      <MobileContactBar />
    </>
  );
}
