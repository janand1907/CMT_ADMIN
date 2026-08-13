import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPinIcon, ClockIcon, ShieldCheckIcon, HeadsetIcon, RouteIcon, CompassIcon } from "@/components/icons";

const cardTrustItems = [
  { icon: ShieldCheckIcon, label: "Trusted Travel Partner" },
  { icon: HeadsetIcon, label: "24x7 Support" },
  { icon: RouteIcon, label: "End-to-End Coordination" },
  { icon: CompassIcon, label: "Custom Itineraries" },
];

export default function TourPackageCard({
  slug,
  image,
  title,
  duration,
  location,
  theme,
  bestFor,
  price,
  bookUrl,
  highlights = [],
}) {
  const whatsappMessage = `Hello, I would like to know more about the ${title}.`;

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-300/20">
        {image ? (
          <Image src={image} alt={title} fill loading="lazy" className="object-cover" />
        ) : (
          <span className="font-display text-sm font-medium text-primary-600/70">Photo coming soon</span>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-800 shadow-soft">
          <ClockIcon className="h-3.5 w-3.5" />
          {duration}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-primary-800">{title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPinIcon className="h-4 w-4 shrink-0" />
          {location}
        </p>
        {theme && <p className="mt-1 text-sm italic text-neutral-500">{theme}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
          <div>
            <p className="font-semibold uppercase tracking-wide text-neutral-400">Duration</p>
            <p className="mt-0.5 font-medium text-primary-800">{duration}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-neutral-400">Best For</p>
            <p className="mt-0.5 font-medium text-primary-800">{bestFor}</p>
          </div>
        </div>

        <ul className="mt-4 flex-1 space-y-1.5 text-sm text-neutral-600">
          {highlights.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-0.5 text-primary-500" aria-hidden="true">
                ✓
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">Price</span>
          <span className="text-base font-bold text-primary-900">{price}</span>
        </div>

        {slug && (
          <Link href={`/kerala/${slug}`} className="btn-primary mt-4 w-full text-center">
            View Full Itinerary
          </Link>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link href={bookUrl} className="btn-secondary px-4 py-2 text-center text-sm">
            Enquire Now
          </Link>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp px-4 py-2 text-center text-sm"
          >
            WhatsApp
          </a>
        </div>

        <ul className="mt-4 grid grid-cols-4 gap-2 border-t border-neutral-100 pt-4">
          {cardTrustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-1 text-center">
              <Icon className="h-4 w-4 text-secondary-500" aria-hidden="true" />
              <span className="text-[10px] leading-tight text-neutral-500">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
