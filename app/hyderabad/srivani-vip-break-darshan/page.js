import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import { hyderabadPackages } from "@/data/packages";
import { testimonials } from "@/data/testimonials";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/hyderabad/srivani-vip-break-darshan");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Hyderabad", href: "/hyderabad" },
  { label: "Srivani VIP Break Darshan", href: "/hyderabad/srivani-vip-break-darshan" },
];

export default function HyderabadSrivaniPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Hyderabad Departure"
      title="Srivani VIP Break Darshan Travel Assistance from Hyderabad"
      intro="Travelling from Hyderabad for Srivani VIP Break Darshan? We coordinate your transportation and accommodation around your break darshan schedule, subject to availability set by the temple authority."
      highlights={[
        "Transportation coordination from Hyderabad to Tirumala",
        "Accommodation coordination close to the darshan queue complex",
        "Guidance on documents and requirements to carry",
        "Coordinator support before and during your visit",
      ]}
      pkg={hyderabadPackages[0]}
      breadcrumbItems={breadcrumbItems}
      hero={{
        pickupLabel: "Hyderabad Pickup",
        whatsappMessage:
          "Hi, I'd like to know the price of the Srivani VIP Break Darshan package from Hyderabad.",
        sourceLabel: "hyderabad_srivani_vip_darshan",
      }}
      serviceIntro={{
        heading: "Tirupati Travel Assistance from Hyderabad",
        paragraphs: [
          "We provide private Hyderabad to Tirupati travel assistance for devotees and international travellers visiting South India. Our service includes pickup support, hotel coordination, private transportation and trip guidance for a smooth Tirupati pilgrimage experience.",
          "Our team helps travellers from Malaysia, Singapore, USA, Canada, Sri Lanka and other countries with comfortable Tirupati travel planning, local coordination and return trip support.",
        ],
        secondary: {
          heading: "Tirupati Travel Package",
          paragraph:
            "Our Tirupati travel package includes travel coordination, hotel stay options and trip planning. Final package cost may vary based on travel date, mode of travel, accommodation choice and group size.",
        },
        highlight: {
          eyebrow: "Travel Package Highlights",
          title: "Hyderabad to Tirumala Pickup & Travel Coordination",
          subtitle: "Flight or Road Travel · Hotel Options · Trip Guidance",
        },
      }}
      planningProcess={{
        heading: "How Devotees Can Plan Their Tirupati Visit",
        description:
          "Devotees planning a Tirupati trip can arrange travel, hotel accommodation and official booking steps in advance. Our team provides private Tirupati travel assistance from Hyderabad with pickup support and trip planning support.",
        steps: [
          { title: "Choose Your Travel Date", description: "Finalise your preferred travel date and trip duration for a comfortable Tirupati trip from Hyderabad." },
          { title: "Share Trip & Pickup Details", description: "Share your pickup location, hotel preferences and passenger details for smooth trip planning." },
          { title: "Travel & Hotel Coordination", description: "Our team assists with travel coordination, hotel stay and itinerary planning based on your schedule." },
          { title: "Enjoy Your Tirupati Trip", description: "Travel comfortably from Hyderabad with pickup, local guidance and return trip support." },
        ],
      }}
      planningEligibility={{
        planning: {
          heading: "Planning a Tirupati Visit from Hyderabad",
          paragraphs: [
            "Many devotees travelling from Hyderabad search for information about Tirupati darshan options, official temple procedures and comfortable travel arrangements. Our team provides trip guidance, and ticket details, eligibility standards and schedules are managed only through official temple authorities.",
            "Our private service helps devotees with Hyderabad pickup, hotel stay options, travel coordination and trip guidance for a smooth pilgrimage experience.",
          ],
        },
        eligibility: {
          heading: "Who Can Use This Travel Service?",
          items: [
            "Indian residents and families",
            "NRI and international travellers",
            "Hyderabad home, hotel or airport pickup",
            "Private travel and hotel assistance",
          ],
        },
      }}
      inclusionsExclusions={{
        heading: "Travel Package Inclusions and Exclusions",
        inclusions: [
          "Hotel stay options with breakfast (as per package selected)",
          "Private travel coordination",
          "Permit, fuel and driver charges (for road travel)",
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
        note: "Final inclusions and exclusions may vary based on the selected package, travel dates and mode of travel.",
      }}
      promoBanner={{
        heading: "Family Tirupati Travel Package from Hyderabad",
        description:
          "Families visiting Tirupati from Hyderabad can choose private travel with flexible pickup, hotel stay options and comfortable trip arrangements. Our team provides local coordination, hotel options and driver support for a smooth family Tirupati trip.",
      }}
      itinerary={{
        heading: "Hyderabad to Tirupati Private Trip – 2 Days Itinerary",
        days: [
          {
            label: "Day 1 – Arrival & Travel",
            items: [
              { title: "Pickup & Travel", description: "Pickup from Hyderabad Airport, hotel or residence and travel to Tirupati (approximately 9 to 10 hours by road, or around 1 hour 20 minutes by flight with airport transfer coordination)." },
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
              { title: "Return Journey", description: "Begin return trip to Hyderabad, hotel or residence after completion of the package selected." },
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
        { question: "Is this a Hyderabad to Tirupati private travel package?", answer: "Yes, this service includes private travel coordination from Hyderabad to Tirupati with return trip support based on your travel plan." },
        { question: "Is pickup available from Hyderabad home, hotel or airport?", answer: "Yes, pickup can be arranged from Hyderabad home, hotel or airport depending on your preferred pickup location." },
        { question: "Can NRI or international travellers use this service?", answer: "Yes, this travel service is suitable for Indian residents, NRI visitors and international travellers planning a Tirupati trip." },
        { question: "How long is the travel from Hyderabad to Tirupati?", answer: "Travel time is approximately 9 to 10 hours by road, or around 1 hour 20 minutes by flight, depending on your preferred mode of travel." },
        { question: "Are there any official temple charges?", answer: "Temple charges, darshan procedures, ticket and darshan availability are determined only by the official authorities and may change from time to time." },
        { question: "Do you provide temple tickets or guarantee darshan slots?", answer: "No, temple tickets, slot allocation and darshan availability are controlled only through official channels. As part of our complete travel package, when requested by the customer, we book only the required tickets. We do not guarantee slot confirmation or provide ticket-only services." },
        { question: "Is this service available for travellers from Malaysia, Singapore, USA and other countries?", answer: "Yes, our Hyderabad to Tirupati travel assistance service is suitable for NRI residents, international visitors and other travellers planning a Tirupati visit." },
      ]}
      finalCta={{
        heading: "Plan Your Tirupati Trip from Hyderabad",
        description:
          "If you are travelling from overseas or within India and planning a Tirupati trip, contact us for private travel options, pickup support and trip guidance.",
        whatsappMessage: "Hi, I'd like to know the price of the Srivani VIP Break Darshan package from Hyderabad.",
        showCallButton: true,
      }}
    />
  );
}
