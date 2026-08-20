import { Roboto, DM_Sans } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { pageMetadata, travelAgencySchema, JsonLd } from "@/lib/seo";
import { getMenuByLocation } from "@/lib/cms/publicQueries";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  ...pageMetadata("/"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

// Phase 6: header/footer nav is fetched here (the one Server Component in the
// chrome chain) and passed down through SiteChrome into Navbar/Footer, which
// each fall back to the existing static data/nav.js links when their location
// has no CMS menu defined yet — same "remain visually stable" pattern as the
// homepage/FAQ/testimonials integrations.
export default async function RootLayout({ children }) {
  const [headerLinks, footerLinks] = await Promise.all([getMenuByLocation("header"), getMenuByLocation("footer")]);

  return (
    <html lang="en" className={`${roboto.variable} ${dmSans.variable}`}>
      <body>
        <JsonLd data={travelAgencySchema()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-card"
        >
          Skip to main content
        </a>
        <SiteChrome headerLinks={headerLinks} footerLinks={footerLinks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
