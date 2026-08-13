import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { keralaTours } from "@/data/kerala";
import { testimonials } from "@/data/testimonials";
import { pageMetadata } from "@/lib/seo";

const tour = keralaTours.find((t) => t.slug === "gods-own-country");

export const metadata = pageMetadata("/kerala/gods-own-country");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Kerala", href: "/kerala" },
  { label: tour.title, href: "/kerala/gods-own-country" },
];

export default function KeralaGodsOwnCountryPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Kerala Tour Package"
      title={tour.title}
      intro={tour.intro}
      highlights={tour.serviceHighlights}
      pkg={tour}
      breadcrumbItems={breadcrumbItems}
      itinerary={{ heading: `${tour.title} — Day-by-Day Itinerary`, days: tour.itinerary }}
      inclusionsExclusions={{
        heading: "What's Included",
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        note: "Exact inclusions and exclusions will be confirmed by your coordinator based on your chosen hotel category and travel dates.",
      }}
      testimonials={{ heading: "What Travellers Say", testimonials }}
    />
  );
}
