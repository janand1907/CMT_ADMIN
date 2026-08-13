import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { chennaiPackages } from "@/data/packages";
import { testimonials } from "@/data/testimonials";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/chennai/srivani-vip-break-darshan");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Chennai", href: "/chennai" },
  { label: "Srivani VIP Break Darshan", href: "/chennai/srivani-vip-break-darshan" },
];

export default function ChennaiSrivaniPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Chennai Departure"
      title="Srivani VIP Break Darshan Travel Assistance from Chennai"
      intro="Travelling from Chennai for Srivani VIP Break Darshan? We coordinate your transportation and accommodation around your break darshan schedule, subject to availability set by the temple authority."
      highlights={[
        "Transportation coordination from Chennai to Tirumala",
        "Accommodation coordination close to the darshan queue complex",
        "Guidance on documents and requirements to carry",
        "Coordinator support before and during your visit",
      ]}
      pkg={chennaiPackages[0]}
      breadcrumbItems={breadcrumbItems}
      hero={{
        pickupLabel: "Chennai Pickup",
        whatsappMessage:
          "Hi, I'd like to know the price of the Srivani VIP Break Darshan package from Chennai.",
        sourceLabel: "chennai_srivani_vip_darshan",
      }}
      serviceIntro={{
        heading: "Tirupati Travel Assistance from Chennai",
        paragraphs: [
          "We provide private Chennai to Tirupati travel assistance for devotees and international travellers visiting South India. Our service includes pickup support, hotel coordination, private transportation and trip guidance for a smooth Tirupati pilgrimage experience.",
          "Our team helps travellers from Malaysia, Singapore, USA, Canada, Sri Lanka and other countries with comfortable Tirupati travel planning, local coordination and return trip support.",
        ],
        secondary: {
          heading: "Tirupati Travel Package",
          paragraph:
            "Our Tirupati travel package includes private car transport, hotel stay options and trip coordination. Final package cost may vary based on travel date, vehicle type, accommodation choice and group size.",
        },
        highlight: {
          eyebrow: "Travel Package Highlights",
          title: "Chennai to Tirumala Pickup & Travel by Car",
          subtitle: "Private Car · Hotel Options · Trip Guidance",
        },
      }}
      planningProcess={{
        heading: "How Devotees Can Plan Their Tirupati Visit",
        description:
          "Devotees planning a Tirupati trip can arrange travel, hotel accommodation and official booking steps in advance. Our team provides private Tirupati travel assistance from Chennai with pickup support and trip planning support.",
        steps: [
          { title: "Choose Your Travel Date", description: "Finalise your preferred travel date and trip duration for a comfortable Tirupati trip from Chennai." },
          { title: "Share Trip & Pickup Details", description: "Share your pickup location, hotel preferences and passenger details for smooth trip planning." },
          { title: "Travel & Hotel Coordination", description: "Our team assists with private car travel, hotel stay and itinerary planning based on your schedule." },
          { title: "Enjoy Your Tirupati Trip", description: "Travel comfortably from Chennai with pickup, local guidance and return trip support." },
        ],
      }}
      planningEligibility={{
        planning: {
          heading: "Planning a Tirupati Visit from Chennai",
          paragraphs: [
            "Many devotees travelling from Chennai search for information about Tirupati darshan options, official temple procedures and comfortable travel arrangements. Our team provides trip guidance, and ticket details, eligibility standards and schedules are managed only through official temple authorities.",
            "Our private service helps devotees with Chennai pickup, hotel stay options, private car transport and trip guidance for a smooth pilgrimage experience.",
          ],
        },
        eligibility: {
          heading: "Who Can Use This Travel Service?",
          items: [
            "Indian residents and families",
            "NRI and international travellers",
            "Chennai home, hotel or airport pickup",
            "Private car travel and hotel assistance",
          ],
        },
      }}
      inclusionsExclusions={{
        heading: "Travel Package Inclusions and Exclusions",
        inclusions: [
          "Hotel stay options with breakfast (as per package selected)",
          "Private AC car travel",
          "Permit, fuel and driver charges",
          "Toll charges and parking charges",
          "Driver assistance and travel guidance",
          "Local temple visit support at Tirupati",
        ],
        exclusions: [
          "Personal expenses",
          "Temple tickets, donations or official entry charges (if applicable)",
          "Extra food costs",
          "Optional attraction or monument entry fees",
          "Extra charges and late night arrival (if applicable)",
          "Flight tickets",
        ],
        note: "Final inclusions and exclusions may vary based on the selected package, travel dates and vehicle availability.",
      }}
      promoBanner={{
        heading: "Family Tirupati Travel Package from Chennai",
        description:
          "Families visiting Tirupati from Chennai can choose private car travel with flexible pickup, hotel stay options and comfortable trip arrangements. Our team provides local coordination, hotel options and driver support for a smooth family Tirupati trip.",
      }}
      itinerary={{
        heading: "Chennai to Tirupati Private Trip – 2 Days Itinerary",
        days: [
          {
            label: "Day 1 – Arrival & Travel",
            items: [
              { title: "Pickup & Travel", description: "Pickup from Chennai Airport, hotel or residence and travel to Tirupati in a private AC vehicle (approximately 4 to 5 hours)." },
              { title: "Local Temple Visit", description: "Visit nearby temples in Tirupati based on available time and traveller preference." },
              { title: "Hotel Check-in", description: "Stay at a comfortable hotel in Tirupati based on the package selected." },
              { title: "Evening Leisure Time", description: "Relax at the hotel or continue local sightseeing depending on your schedule." },
              { title: "Overnight Stay", description: "Enjoy an overnight stay at the hotel." },
            ],
          },
          {
            label: "Day 2 – Breakfast & Checkout",
            items: [
              { title: "Breakfast & Checkout", description: "Enjoy breakfast at the hotel and proceed with checkout based on travel timing." },
              { title: "Temple Visit / Local Plan", description: "Continue temple visit or local sightseeing based on official schedule and available time." },
              { title: "Return Journey", description: "Begin return trip to Chennai, hotel or residence after completion of the package selected." },
              { title: "Trip Completion", description: "Complete your pilgrimage journey with comfortable return support." },
            ],
          },
        ],
      }}
      testimonials={{
        heading: "What Our Devotees Say",
        testimonials,
      }}
      faqs={[
        { question: "Is this a Chennai to Tirupati private car travel package?", answer: "Yes, this service includes private AC car travel from Chennai to Tirupati with return trip support based on your travel plan." },
        { question: "Is pickup available from Chennai home, hotel or airport?", answer: "Yes, pickup can be arranged from Chennai home, hotel or airport depending on your preferred pickup location." },
        { question: "Can NRI or international travellers use this service?", answer: "Yes, this travel service is suitable for Indian residents, NRI visitors and international travellers planning a Tirupati trip." },
        { question: "How long is the travel from Chennai to Tirupati?", answer: "Travel time is approximately 4 to 5 hours by private AC car depending on traffic and route conditions." },
        { question: "Are there any official temple charges?", answer: "Temple charges, darshan procedures, ticket and darshan availability are determined only by the official authorities and may change from time to time." },
        { question: "Do you provide temple tickets or guarantee darshan slots?", answer: "No, temple tickets, slot allocation and darshan availability are controlled only through official channels. As part of our complete travel package, when requested by the customer, we book only the required tickets. We do not guarantee slot confirmation or provide ticket-only services." },
        { question: "Is this service available for travellers from Malaysia, Singapore, USA and other countries?", answer: "Yes, our Chennai to Tirupati travel assistance service is suitable for NRI residents, international visitors and other travellers planning a Tirupati visit." },
      ]}
      finalCta={{
        heading: "Plan Your Tirupati Trip from Chennai",
        description:
          "If you are travelling from overseas or within India and planning a Tirupati trip, contact us for private travel options, pickup support and trip guidance.",
        whatsappMessage: "Hi, I'd like to know the price of the Srivani VIP Break Darshan package from Chennai.",
        showCallButton: true,
      }}
    />
  );
}
