import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  MapPinIcon,
  CarIcon,
  HotelIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarIcon,
  PackageIcon,
  HeadsetIcon,
} from "@/components/icons";

/* Original single-destination Hero, preserved for reference / rollback.
const checklist = [
  "Chennai to Tirupati private car packages",
  "Hyderabad to Tirupati travel packages",
  "Airport pickup and drop assistance",
  "Hotel stay and itinerary planning",
  "Family, senior citizen and NRI friendly support",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-temple.jpg"
          alt="Sri Venkateswara Temple, Tirumala"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/85 to-primary-900/50" />
      </div>

      <div className="container-page relative grid gap-10 py-16 lg:grid-cols-3 lg:items-center lg:py-24">
        <div className="lg:col-span-2">
          <div className="inline-flex flex-col gap-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-primary-200" />
              Trusted Tirupati Travel Packages from Chennai &amp; Hyderabad
            </span>
            <span className="flex items-center gap-2 pl-7 text-white/80">
              <span className="text-secondary-400" aria-hidden="true">★★★★★</span>
              Rated by happy travellers with reliable pilgrimage travel support
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Tirupati Tour Packages from Chennai &amp; Hyderabad
          </h1>

          <p className="mt-4 max-w-lg text-lg font-medium text-secondary-300">
            Complete Tirupati pilgrimage travel packages with private car travel, flight-based
            plans, hotel stay and trip coordination.
          </p>
          <p className="mt-2 max-w-lg text-white/80">
            Get package details, itinerary options and pricing instantly on WhatsApp.
          </p>

          <div className="mt-6 rounded-2xl bg-black/25 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-secondary-300">
              Serving domestic and international travellers from Malaysia, Singapore, Sri Lanka,
              UK and other countries.
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-white sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Get Details on WhatsApp
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat on WhatsApp
            </a>
            <Link
              href="#packages"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              View Packages
            </Link>
          </div>

          <p className="mt-4 max-w-lg text-xs text-secondary-300">
            We are an independent private travel company. Temple schedules, tickets and
            eligibility are managed only through official authorities.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-modal sm:p-8 lg:col-span-1">
          <h2 className="font-display text-xl font-semibold text-primary-900">Quick Enquiry</h2>
          <p className="mt-1 text-sm text-neutral-500">Share your details and we&apos;ll call you back shortly.</p>
          <HeroEnquiryForm sourceLabel="home_hero" />
        </div>
      </div>
    </section>
  );
}
*/

const destinations = [
  "Tirupati",
  "Srikalahasthi",
  "Tiruvannamalai",
  "Madurai",
  "Rameshwaram",
];

const topFeatures = [
  { icon: MapPinIcon, label: "Holy Destinations" },
  { icon: CarIcon, label: "Comfortable Travel" },
  { icon: HotelIcon, label: "Quality Hotels" },
  { icon: UsersIcon, label: "Experienced Guides" },
  { icon: ShieldCheckIcon, label: "Safe & Reliable" },
];

const bottomFeatures = [
  { icon: UsersIcon, line1: "Family & Group", line2: "Tours" },
  { icon: CalendarIcon, line1: "Customized", line2: "Itineraries" },
  { icon: PackageIcon, line1: "Best Price", line2: "Guarantee" },
  { icon: HeadsetIcon, line1: "24/7 Customer", line2: "Support" },
];

export default function Hero() {
  return (
    <section className="bg-white">
      {/* Large screens: immersive overlay banner. Below lg the same
          percentage-based layout would need text as small as 4-7px to
          avoid the pieces overlapping, so mobile/tablet get a simpler
          stacked layout instead (rendered further down). */}
      <div className="relative hidden aspect-[16/9.5] w-full overflow-hidden lg:block">
        <Image
          src="/images/banner-bg.png"
          alt="Car on ghat road with South India temple backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Soft white wash over the full banner photo */}
        <div className="pointer-events-none absolute inset-0 bg-white/20" />

        {/* Left column: heading + destinations + top features */}
        <div className="absolute left-[3%] top-[20%] w-[47%]">
          <h1 className="font-display text-lg font-extrabold uppercase leading-tight text-primary-900 sm:text-3xl lg:text-5xl">
            <span className="block">South India</span>
            <span className="block text-secondary-500">Pilgrim Tour</span>
            <span className="flex justify-start gap-1.5 text-2xl tracking-wide sm:gap-2">
              <span aria-hidden="true">&rarr;</span>
              Packages
              <span aria-hidden="true">&larr;</span>
            </span>
          </h1>

          <div className="mt-2 inline-flex flex-col items-center gap-y-0.5 rounded-lg bg-primary-900 px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-wide text-white sm:mt-4 sm:rounded-xl sm:px-5 sm:py-3 sm:text-xs lg:text-sm">
            <div className="flex flex-wrap items-center gap-x-1.5">
              {destinations.slice(0, 3).map((destination, index) => (
                <span key={destination} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-secondary-400" aria-hidden="true">
                      |
                    </span>
                  )}
                  {destination}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5">
              {destinations.slice(3).map((destination, index) => (
                <span key={destination} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-secondary-400" aria-hidden="true">
                      &amp;
                    </span>
                  )}
                  {destination}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 sm:mt-8 sm:gap-4">
            {topFeatures.map((feature, index) => (
              <div
                key={feature.label}
                className="flex w-[17%] flex-col items-center gap-1 text-center sm:w-20"
              >
                <span
                  className={`flex aspect-square size-10 items-center justify-center rounded-full text-white shadow-modal ${
                    index % 2 === 0 ? "bg-primary-800" : "bg-secondary-500"
                  }`}
                >
                  <feature.icon className="h-[40%] w-[40%]" />
                </span>
                <span className="text-[5px] font-bold uppercase leading-tight text-primary-900 sm:text-[9px] lg:text-xs">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: features bar + CTA, anchored to the bottom-right */}
        <div className="absolute bottom-[2.5%] right-[3%] flex items-stretch gap-1 sm:gap-3">
          <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden rounded-lg bg-primary-900 px-1.5 py-1 sm:gap-4 sm:rounded-2xl sm:px-6 sm:py-5">
            {bottomFeatures.map((feature, index) => (
              <div
                key={feature.line1}
                className="flex items-center gap-1 sm:gap-2"
              >
                {index > 0 && (
                  <span
                    className="h-5 w-px shrink-0 bg-white/25 sm:h-8"
                    aria-hidden="true"
                  />
                )}
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-secondary-500 sm:h-9 sm:w-9">
                  <feature.icon className="h-[45%] w-[45%] text-white" />
                </span>
                <span className="flex flex-col whitespace-nowrap text-[4.5px] font-bold uppercase leading-[1.2] text-white sm:text-[10px] lg:text-xs">
                  <span>{feature.line1}</span>
                  <span className="font-medium text-white/75">
                    {feature.line2}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-modal sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-4">
            <p className="text-center font-display text-[6px] font-extrabold uppercase leading-tight text-primary-900 sm:text-sm lg:text-base">
              Start Your{" "}
              <span className="text-secondary-500">Spiritual Journey</span>{" "}
              Today!
            </p>
            <div
              className="flex items-center justify-center gap-1"
              aria-hidden="true"
            >
              <span className="h-px w-4 bg-primary-900/25 sm:w-10" />
              <span className="h-1 w-1 rotate-45 bg-primary-900/40" />
              <span className="h-px w-4 bg-primary-900/25 sm:w-10" />
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-secondary-500 px-2.5 py-1 text-[5px] font-semibold text-white shadow-soft transition hover:bg-secondary-600 sm:gap-2 sm:px-6 sm:py-2.5 sm:text-xs"
              >
                Enquire Now
                <span aria-hidden="true">&rarr;</span>
              </a>
              <span
                className="h-5 w-px shrink-0 bg-primary-900/20 sm:h-8"
                aria-hidden="true"
              />
              <div className="flex items-center gap-1 sm:gap-1.5">
                <UsersIcon className="h-2.5 w-2.5 shrink-0 text-primary-900 sm:h-5 sm:w-5" />
                <span className="flex flex-col whitespace-nowrap text-[4.5px] font-bold uppercase leading-[1.2] text-primary-900 sm:text-[9px] lg:text-xs">
                  <span>Worry Less</span>
                  <span>Travel More</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & tablet: stacked, legible banner. Reuses the same data
          but in normal document flow with readable text sizes instead
          of proportionally shrunk absolute overlays. */}
      <div className="lg:hidden">
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <Image
            src="/images/banner-bg.png"
            alt="Car on ghat road with South India temple backdrop"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        </div>

        <div className="container-page relative -mt-16 pb-6 sm:-mt-20">
          <div className="rounded-2xl bg-white p-4 shadow-modal sm:p-6">
            <h1 className="font-display text-2xl font-extrabold uppercase leading-tight text-primary-900 sm:text-3xl">
              <span className="block">South India</span>
              <span className="block text-secondary-500">Pilgrim Tour Packages</span>
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-primary-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
              {destinations.map((destination, index) => (
                <span key={destination} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-secondary-400" aria-hidden="true">
                      &bull;
                    </span>
                  )}
                  {destination}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {topFeatures.map((feature, index) => (
                <div key={feature.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-soft sm:h-11 sm:w-11 ${
                      index % 2 === 0 ? "bg-primary-800" : "bg-secondary-500"
                    }`}
                  >
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <span className="text-[10px] font-semibold leading-tight text-primary-900 sm:text-xs">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-primary-900 p-3 sm:grid-cols-4">
              {bottomFeatures.map((feature) => (
                <div key={feature.line1} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-500">
                    <feature.icon className="h-4 w-4 text-white" />
                  </span>
                  <span className="flex flex-col text-[11px] font-bold uppercase leading-tight text-white">
                    <span>{feature.line1}</span>
                    <span className="font-medium text-white/75">{feature.line2}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col items-stretch gap-3 rounded-xl border border-primary-100 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm font-extrabold uppercase text-primary-900">
                  Start Your <span className="text-secondary-500">Spiritual Journey</span> Today!
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary-900">
                  <UsersIcon className="h-4 w-4 shrink-0" />
                  Worry Less, Travel More
                </p>
              </div>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-secondary-600 sm:w-auto"
              >
                Enquire Now
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="container-page py-4">
        <p className="max-w-2xl text-xs text-neutral-500">
          We are an independent private travel company. Temple schedules,
          tickets and eligibility are managed only through official authorities.
        </p>
      </div> */}
    </section>
  );
}
