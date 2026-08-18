"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PromoPopup from "@/components/enquiry/PromoPopup";

// Admin routes render their own chrome (or none at all), so the public
// Navbar/Footer/PromoPopup must not wrap them. Splitting this out avoids
// restructuring the app into route groups just to get a second root layout.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return children;
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <PromoPopup />
    </>
  );
}
