import Link from "next/link";
import Image from "next/image";
import { footerQuickLinks } from "@/data/nav";
import { siteConfig } from "@/config/site";
import { footerDisclaimer } from "@/data/legal";
import {
  PhoneIcon,
  WhatsAppIcon,
  MailIcon,
  ClockIcon,
  MapPinIcon,
} from "@/components/icons";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-page grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16 lg:py-16">
        <div>
          <span className="inline-flex rounded-lg bg-white p-2">
            <Image
              src="/logo.svg"
              alt="Connect My Tours logo"
              width={140}
              height={49}
              className="h-9 w-auto"
            />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary-200">
            {siteConfig.tagline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Independently owned and operated — not affiliated with, endorsed by,
            or officially connected with TTD or any government body. Honest,
            coordinator-led support from enquiry to darshan.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/50">
            Quick Links
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-white/80">
            {footerQuickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/50">
            Contact Information
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <a
                href={`tel:${siteConfig.phone}`}
                className="transition hover:text-white"
              >
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <a
                href={`https://wa.me/${
                  siteConfig.whatsapp
                }?text=${encodeURIComponent(
                  siteConfig.whatsappDefaultMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                Chat with us
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition hover:text-white"
              >
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <span>{siteConfig.officeHours}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <span>Serving Chennai, Bangalore, Hyderabad & Tirupati</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 pb-6 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Privacy &amp; legal</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link
              href="/cancellation-refund-policy"
              className="hover:text-white"
            >
              Cancellation &amp; Refund
            </Link>
            <Link href="/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
          </div>
        </div>
        {/* <p className="container-page pb-6 text-[11px] leading-relaxed text-white/50">{footerDisclaimer}</p>
        <p className="container-page pb-6 text-[11px] leading-relaxed text-white/40">
          Kerala tour photos via Wikimedia Commons: Munnar tea plantations (Yusuf, public domain) · Periyar
          Lake boat cruise, Thekkady (Jonathanawhite, public domain) · Houseboat, Punnamada backwaters,
          Alleppey (Varghesepunnamada, CC BY 4.0) · Chinese fishing nets, Fort Kochi (Vis M, CC BY-SA 4.0) ·
          Guruvayur Sri Krishna Temple (Aruna, CC BY-SA).
        </p> */}
      </div>
    </footer>
  );
}
