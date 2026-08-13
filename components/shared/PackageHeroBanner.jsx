import Image from "next/image";
import { WhatsAppIcon, PhoneIcon, RouteIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import BalajiDarshanEnquiryForm from "./BalajiDarshanEnquiryForm";

const trustPoints = ["Trusted by travellers", "Genuine Guidance", "Trip support till return drop"];

export default function PackageHeroBanner({
  title,
  intro,
  pickupLabel,
  whatsappMessage,
  sourceLabel,
  image = "/images/hero-temple.jpg",
  imageAlt = "Sri Venkateswara Temple, Tirumala",
}) {
  const pillBadges = [pickupLabel, "Stay Assistance", "Document Guidance", "Trip Coordination"];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      </div>

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            <span className="text-green-400" aria-hidden="true">
              ★★★★★
            </span>
            Rated 4.6★ based on 30+ reviews on Trustpilot
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-xl text-white/90">{intro}</p>

          <div className="mt-5 max-w-sm rounded-2xl bg-secondary-500 p-4">
            <ul className="space-y-1.5 text-sm font-semibold text-white">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span aria-hidden="true">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 max-w-md text-sm font-semibold text-secondary-300">
            Independent private travel assistance for Tirupati pilgrimage planning.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {pillBadges.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-sm font-semibold text-primary-900"
              >
                <span className="text-secondary-500" aria-hidden="true">
                  ✓
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-secondary-600"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Check Package Price on WhatsApp
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-green-700"
            >
              <PhoneIcon className="h-5 w-5" />
              Call Now
            </a>
            <a
              href="#package-details"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-900 shadow-soft transition hover:bg-neutral-50"
            >
              <RouteIcon className="h-5 w-5" />
              View Itinerary
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-modal sm:p-8">
          <h2 className="text-center font-display text-xl font-bold text-primary-900">
            Balaji Darshan Package Enquiry
          </h2>
          <BalajiDarshanEnquiryForm sourceLabel={sourceLabel} />
        </div>
      </div>
    </section>
  );
}
