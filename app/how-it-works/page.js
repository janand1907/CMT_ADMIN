import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactCTA from "@/components/home/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/how-it-works");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
];

const steps = [
  {
    title: "1. Choose Package",
    description:
      "Browse travel packages by departure city — Chennai, Bangalore, or Hyderabad — or by service, such as Srivani VIP Break Darshan or the NRI Darshan Package.",
  },
  {
    title: "2. Submit Enquiry",
    description:
      "Fill in the enquiry form on any package page or the Contact Us page, or message us directly on WhatsApp with your travel dates and city.",
  },
  {
    title: "3. Coordinator Calls",
    description:
      "A dedicated travel coordinator calls you back to confirm your requirements, answer questions, and explain what's included before anything is finalised.",
  },
  {
    title: "4. Confirm Booking",
    description:
      "Once you're happy with the coordinated plan, you confirm the arrangement with your coordinator to lock in transportation and accommodation coordination.",
  },
  {
    title: "5. Start Journey",
    description:
      "Begin your pilgrimage with transportation and accommodation coordinated in advance, and coordinator support available throughout your trip.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">
          How It Works
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          From choosing a package to starting your journey, here&apos;s what to expect when you plan
          your Tirupati pilgrimage with us.
        </p>
        <ol className="mt-10 space-y-6">
          {steps.map((step) => (
            <li key={step.title} className="card p-6">
              <h2 className="font-display text-lg font-semibold text-primary-800">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <ContactCTA />
    </>
  );
}
