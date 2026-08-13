import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ItineraryPlanner from "@/components/shared/ItineraryPlanner";
import ContactCTA from "@/components/home/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/itinerary-planner");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Itinerary Planner", href: "/itinerary-planner" },
];

export default function ItineraryPlannerPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <ItineraryPlanner />

      <ContactCTA
        heading="Ready to Confirm Your Trip?"
        description="Share your planned itinerary with a travel coordinator and get hotel, transfer and pricing details tailored to your dates."
        whatsappMessage="Hello, I've put together an itinerary and would like help confirming it."
      />
    </>
  );
}
