import ServiceDetailLayout from "@/components/shared/ServiceDetailLayout";
import TrustStrip from "@/components/shared/TrustStrip";
import VehiclePricingList from "@/components/shared/VehiclePricingList";
import InfoSection from "@/components/shared/InfoSection";
import NumberedSteps from "@/components/shared/NumberedSteps";
import CityFAQSection from "@/components/city/CityFAQSection";
import CityTestimonialsSection from "@/components/city/CityTestimonialsSection";
import { hyderabadPackages } from "@/data/packages";
import { testimonials } from "@/data/testimonials";
import { pageMetadata } from "@/lib/seo";
import { CompassIcon, PackageIcon, SparklesIcon, HeadsetIcon, CarIcon, BusIcon } from "@/components/icons";

export const metadata = pageMetadata("/hyderabad/nri-darshan-package");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Hyderabad", href: "/hyderabad" },
  { label: "NRI Darshan Package", href: "/hyderabad/nri-darshan-package" },
];

const featureItems = [
  { icon: CompassIcon, label: "Plan your Trip" },
  { icon: PackageIcon, label: "Choose a Package" },
  { icon: SparklesIcon, label: "Divine Darshan" },
  { icon: HeadsetIcon, label: "24/7 Customer Support" },
];

const singleDayVehicles = [
  { name: "Etios", capacity: "1 to 4 Persons", inclusions: "Vehicle Rentals, Permit, Parking, Diesel, Driver fare", note: "After 10:00 PM, driver fare will add extra charges.", price: "On Request", icon: CarIcon },
  { name: "Innova", capacity: "1 to 6 Persons", inclusions: "Vehicle Rentals, Permit, Parking, Diesel, Driver fare", note: "After 10:00 PM, driver fare will add extra charges.", price: "On Request", icon: CarIcon },
  { name: "Innova Crysta", capacity: "1 to 6 Persons", inclusions: "Vehicle Rentals, Permit, Parking, Diesel, Driver fare", note: "After 10:00 PM, driver fare will add extra charges.", price: "On Request", icon: CarIcon },
  { name: "Tempo AC", capacity: "1 to 12 Persons", inclusions: "Vehicle Rentals, Permit, Parking, Diesel, Driver fare", note: "After 10:00 PM, driver fare will add extra charges.", price: "On Request", icon: BusIcon },
  { name: "Urbania", capacity: "1 to 12 Persons", inclusions: "Vehicle Rentals, Permit, Parking, Diesel, Driver fare", note: "After 10:00 PM, driver fare will add extra charges.", price: "On Request", icon: BusIcon },
];

const twoDayVehicles = singleDayVehicles;

const faqs = [
  { question: "Who is eligible for NRI darshan at Tirumala?", answer: "Only Non-Resident Indians (NRIs) and OCI cardholders are eligible for NRI darshan. Valid documents like a passport, visa, and OCI card must be presented." },
  { question: "Is prior booking required for NRI Darshan?", answer: "No, advance booking is not required. NRIs can arrive at the designated Supadam counter with valid documents and complete the process on the spot." },
  { question: "What is the cost of the NRI darshan ticket?", answer: "The Special Entry Darshan ticket for NRIs is priced at INR 300 per person." },
  { question: "Can friends or family accompany NRIs for the darshan?", answer: "No, this facility is strictly for NRIs and OCI cardholders. Friends or relatives who are residents of India are not permitted through this entry." },
  { question: "What are the NRI darshan timings?", answer: "The Supadam Entry for NRIs is available daily from 12:00 PM to 6:00 PM." },
  { question: "Are children allowed for NRI darshan?", answer: "Yes, children are allowed. Children below 12 years of age are exempt from ticket requirements." },
  { question: "What documents are required for the darshan?", answer: "A valid passport and visa are required, and OCI cardholders must also present their OCI card." },
];

export default function HyderabadNriPage() {
  return (
    <ServiceDetailLayout
      eyebrow="Hyderabad Departure"
      title="NRI Darshan Travel Package from Hyderabad"
      intro="Flying into Hyderabad from abroad for a Tirupati visit? Our NRI Darshan travel package is built around international flight schedules, with airport transfer coordination and support throughout your trip."
      highlights={[
        "Airport pickup and drop coordination in Hyderabad",
        "Darshan queue assistance, subject to availability",
        "Flexible scheduling around connecting flights",
        "English-speaking travel coordinator support",
      ]}
      pkg={hyderabadPackages[1]}
      breadcrumbItems={breadcrumbItems}
    >
      <TrustStrip heading={null} items={featureItems} />
      <VehiclePricingList heading="Single Day NRI Darshan" vehicles={singleDayVehicles} bookUrl="/contact-us" />
      <VehiclePricingList heading="2 Day NRI Darshan" vehicles={twoDayVehicles} bookUrl="/contact-us" />
      <InfoSection
        heading="Tirumala NRI Darshan Packages"
        paragraphs={[
          'Discover the spiritual magnificence of Tirumala with our exclusive "NRI Special Darshan" packages, thoughtfully designed to provide a seamless and soul-enriching temple visit for Non-Resident Indians (NRIs). Reconnect with your spiritual roots and experience the divine grace of Lord Venkateswara through our tailored services.',
          "Our Special Entry Darshan for NRIs allows privileged access to the sanctum sanctorum with a special entry ticket priced at INR 300 per person. There's no need for advance booking; simply arrive at the designated counter with valid documents (passport, visa, and OCI card) for verification. Once cleared, NRIs can proceed for darshan via the Supadam entry gate, reserved for foreign devotees and NRIs.",
          "This guided, on-the-spot process ensures a smooth experience, enabling you to fully immerse yourself in the spiritual bliss of Tirumala.",
        ]}
      />
      <InfoSection
        heading="Important Guidelines for NRI Darshan"
        muted
        bullets={[
          "Carry valid passport and visa documents for verification.",
          "The visa entry date must be within 30 days prior to your Tirumala visit.",
          "NRI pilgrims are required to fill a form and pay INR 300 per person at the Supadam counter.",
          "The facility is strictly for NRIs; friends or relatives who are residents of India are not permitted.",
          "OCI cardholders must present both the OCI card and passport for verification.",
          "Additional ID proofs are recommended for a smooth verification process.",
          "Children below 12 years of age are exempt from ticket requirements.",
          "Our team offers complete assistance for NRI pilgrims, including transportation, guidance and customised Tirupati packages.",
        ]}
      />
      <InfoSection
        heading="Tirumala NRI Darshan Timings"
        paragraphs={[
          "The Supadam Entry for NRIs is available daily from 12:00 PM to 6:00 PM. While there is no exclusive quota, NRIs can benefit from quicker access through the Supadam queue alongside other privileged categories such as:",
        ]}
        bullets={["Infants and their parents", "Physically challenged devotees", "Other authorised categories"]}
        closing="This arrangement minimises waiting time and ensures a smoother, more convenient darshan experience for NRIs visiting the Tirumala Balaji Temple."
      />
      <NumberedSteps
        heading="Step-by-Step NRI Darshan Process"
        steps={[
          { title: "Report to the Special Darshan Complex at Tirumala for NRI registration." },
          { title: "Complete the NRI darshan form with your personal, passport, and visa details." },
          { title: "Submit the filled form along with:", subItems: ["Original passport", "A photocopy of your passport"] },
          { title: "TTD officials will verify your documents and approve your darshan request." },
          { title: "Once approved, proceed to the designated counter to purchase the darshan ticket." },
          { title: "Complete the process and proceed to the darshan queue through Supadam Entry." },
        ]}
      />
      <InfoSection
        heading="Why Choose Us?"
        paragraphs={["We aim to provide a smooth and spiritually uplifting experience for NRIs visiting Tirumala. Our services include:"]}
        bullets={[
          "Expert guidance throughout your darshan journey",
          "Reliable transportation services from nearby locations",
          "Tailored packages to meet your travel and spiritual needs",
        ]}
        closing="Experience the divine blessings of Lord Venkateswara with peace of mind and ease. Let us make your pilgrimage to Tirumala truly memorable!"
      />
      <CityFAQSection faqs={faqs} />
      <CityTestimonialsSection heading="Top Reviews" testimonials={testimonials} />
    </ServiceDetailLayout>
  );
}
