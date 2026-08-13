import Breadcrumbs from "@/components/shared/Breadcrumbs";
import TrustStrip from "@/components/shared/TrustStrip";
import PackageCard from "@/components/shared/PackageCard";
import ContactCTA from "@/components/home/ContactCTA";
import { pageMetadata, localBusinessSchema, JsonLd } from "@/lib/seo";
import { CompassIcon, SparklesIcon, CarIcon, RouteIcon, PlaneIcon } from "@/components/icons";

export const metadata = pageMetadata("/south-india");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "South India", href: "/south-india" },
];

const destinations = [
  {
    slug: "kerala",
    iconName: "CompassIcon",
    icon: CompassIcon,
    title: "Kerala Tour Packages",
    description:
      "Munnar hill stations, Thekkady wildlife, Alleppey backwater houseboats and Fort Kochi heritage, with an optional temple darshan circuit.",
    includesText: "Hill stations, backwaters & heritage sightseeing",
    buttonLabel: "View Kerala Packages",
    bookUrl: "/kerala",
  },
  {
    slug: "tirupati",
    icon: SparklesIcon,
    title: "Tirupati Balaji Darshan",
    description:
      "On-ground travel support within Tirupati — local transportation coordination, accommodation coordination, and darshan queue assistance.",
    includesText: "Local transfers & darshan queue assistance",
    buttonLabel: "View Tirupati Assistance",
    bookUrl: "/tirupati",
  },
  {
    slug: "chennai",
    icon: CarIcon,
    title: "Chennai to Tirupati Package",
    description:
      "Comfortable Chennai to Tirupati travel with private AC car transport, pickup, hotel stay options and return drop support.",
    includesText: "Private car, route planning & optional hotel stay",
    buttonLabel: "View Chennai Package",
    bookUrl: "/chennai",
  },
  {
    slug: "bangalore",
    icon: RouteIcon,
    title: "Bangalore to Tirupati Package",
    description:
      "Round-trip transportation coordination, darshan queue assistance and accommodation coordination for pilgrims travelling from Bangalore.",
    includesText: "Round-trip transfers & accommodation coordination",
    buttonLabel: "View Bangalore Package",
    bookUrl: "/bangalore",
  },
  {
    slug: "hyderabad",
    icon: PlaneIcon,
    title: "Hyderabad to Tirupati Package",
    description:
      "Tirupati package from Hyderabad with convenient travel planning, pickup support, hotel stay options and smooth trip coordination.",
    includesText: "Travel planning, transfers & optional stay support",
    buttonLabel: "View Hyderabad Package",
    bookUrl: "/hyderabad",
  },
];

export default function SouthIndiaPage() {
  return (
    <>
      <JsonLd
        data={localBusinessSchema({
          pathname: "/south-india",
          areaServed: ["Kerala", "Tirupati", "Chennai", "Bangalore", "Hyderabad"],
          description: "South India travel assistance covering Kerala tours and Tirupati pilgrimage packages.",
        })}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section className="bg-gradient-to-b from-primary-50 via-white to-white py-14 md:py-20">
        <div className="container-page max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">South India</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            South India Tour & Travel Assistance
          </h1>
          <p className="mt-4 text-neutral-600">
            From Kerala&apos;s hills and backwaters to Tirupati Balaji darshan, we coordinate travel across South
            India&apos;s most-visited destinations. Choose a destination below to see package options and get
            travel assistance tailored to your trip.
          </p>
        </div>
      </section>

      <TrustStrip />

      <section className="container-page py-14">
        <h2 className="section-heading text-center">Explore Our South India Destinations</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <PackageCard key={dest.slug} {...dest} />
          ))}
        </div>
      </section>

      <ContactCTA
        heading="Planning a South India Trip?"
        description="Talk to a travel coordinator today and get travel assistance tailored to your destinations and schedule."
      />
    </>
  );
}
