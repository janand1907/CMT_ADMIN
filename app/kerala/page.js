import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TrustStrip from "@/components/shared/TrustStrip";
import TourPackageCard from "@/components/shared/TourPackageCard";
import CityFAQSection from "@/components/city/CityFAQSection";
import CityTestimonialsSection from "@/components/city/CityTestimonialsSection";
import ContactCTA from "@/components/home/ContactCTA";
import { keralaTours } from "@/data/kerala";
import { testimonials } from "@/data/testimonials";
import { pageMetadata, localBusinessSchema, JsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import {
  CompassIcon,
  ShieldCheckIcon,
  HeadsetIcon,
  RouteIcon,
} from "@/components/icons";

export const metadata = pageMetadata("/kerala");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Kerala", href: "/kerala" },
];

const trustItems = [
  { icon: CompassIcon, label: "Custom Itineraries" },
  { icon: RouteIcon, label: "End-to-End Coordination" },
  { icon: ShieldCheckIcon, label: "Trusted Travel Partner" },
  { icon: HeadsetIcon, label: "Dedicated Coordinator Support" },
];

const whatsappMessage =
  "Hello, I would like to know more about Kerala tour packages.";

const faqs = [
  {
    question: "What is the best time to visit Kerala for these tours?",
    answer:
      "September to March is generally the most comfortable period, with cooler weather for the hill stations and calmer conditions for the backwaters.",
  },
  {
    question: "Can the itinerary be customised?",
    answer:
      "Yes. These itineraries are a starting point — your coordinator can adjust the day plan, stops and pace based on your travel dates, group size and interests.",
  },
  {
    question:
      "Is the temple darshan itinerary suitable for non-Hindu travellers?",
    answer:
      "Entry into the temple premises at Guruvayur Sri Krishna Temple is restricted to Hindus, in line with the temple's own guidelines. Our coordinator will share the current entry rules for each temple stop while planning your visit.",
  },
  {
    question: "What does the houseboat cruise include?",
    answer:
      "Cruise duration (day cruise or overnight stay) and meal inclusions depend on the specific houseboat booked for your dates. Your coordinator will confirm the exact details before your trip.",
  },
  {
    question: "Do you arrange flights or trains to Kochi?",
    answer:
      "We coordinate local transfers and sightseeing within Kerala. Flights or train tickets to reach Kochi are arranged separately, though our coordinator can guide you on timing.",
  },
];

export default function KeralaPage() {
  return (
    <>
      <JsonLd
        data={localBusinessSchema({
          pathname: "/kerala",
          areaServed: "Kerala",
          description:
            "Kerala tour travel assistance covering Munnar, Thekkady, Alleppey and Kochi.",
        })}
      />
      <Breadcrumbs items={breadcrumbItems} />

      {/* <section className="bg-gradient-to-b from-primary-50 via-white to-white py-14 md:py-20">
        <div className="container-page max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">South India · Kerala</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            Kerala Tour Packages — God&apos;s Own Country
          </h1>
          <p className="mt-4 text-neutral-600">
            Travel assistance for Kerala tours covering the hill stations of Munnar, the wildlife sanctuary at
            Thekkady, backwater houseboat cruises in Alleppey, and heritage sightseeing in Kochi — with an
            optional temple darshan circuit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#packages" className="btn-primary">
              View Packages
            </a>
            <Link href="/itinerary-planner" className="btn-secondary">
              Build Your Own Itinerary
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section> */}

      <section id="packages" className="bg-neutral-50 py-14">
        <div className="container-page">
          <h2 className="section-heading text-center">Kerala Tour Packages</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Two sample itineraries our coordinators arrange most often. Both can
            be adjusted to your travel dates and preferences — tap a card to see
            the full day-by-day plan.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {keralaTours.map((tour) => (
              <TourPackageCard key={tour.slug} {...tour} />
            ))}
          </div>
        </div>
      </section>

      <TrustStrip items={trustItems} />

      <CityFAQSection faqs={faqs} />

      <CityTestimonialsSection
        heading="What Travellers Say"
        testimonials={testimonials}
      />

      <ContactCTA
        heading="Ready to Explore Kerala?"
        description="Talk to a travel coordinator today and get a Kerala itinerary tailored to your travel dates and group size."
        whatsappMessage={whatsappMessage}
      />
    </>
  );
}
