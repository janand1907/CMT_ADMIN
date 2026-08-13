import Breadcrumbs from "./Breadcrumbs";
import PackageCard from "./PackageCard";
import ContactCTA from "@/components/home/ContactCTA";
import PackageHeroBanner from "./PackageHeroBanner";
import TrustStrip from "./TrustStrip";
import ServiceIntroSection from "./ServiceIntroSection";
import PlanningEligibilitySection from "./PlanningEligibilitySection";
import InclusionsExclusions from "./InclusionsExclusions";
import PromoBanner from "./PromoBanner";
import ItineraryTimeline from "./ItineraryTimeline";
import CityTestimonialsSection from "@/components/city/CityTestimonialsSection";
import CityFAQSection from "@/components/city/CityFAQSection";
import HowItWorks from "@/components/home/HowItWorks";
import { CheckCircleIcon, PlaneIcon, StarIcon, WhatsAppIcon, ShieldCheckIcon } from "@/components/icons";

export default function ServiceDetailLayout({
  eyebrow,
  title,
  intro,
  highlights,
  pkg,
  breadcrumbItems,
  hero,
  serviceIntro,
  planningProcess,
  planningEligibility,
  inclusionsExclusions,
  promoBanner,
  itinerary,
  testimonials,
  faqs,
  finalCta,
  children,
}) {
  const cityName = hero?.pickupLabel?.replace(" Pickup", "");
  const trustItems = cityName && [
    { icon: CheckCircleIcon, label: "Travel Planning Guidance" },
    { icon: PlaneIcon, label: `${cityName} Airport Pickup Available` },
    { icon: StarIcon, label: "Trusted by Travellers" },
    { icon: WhatsAppIcon, label: "Dedicated WhatsApp Support" },
    { icon: ShieldCheckIcon, label: "Genuine Guidance" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      {hero && <PackageHeroBanner title={title} intro={intro} {...hero} />}
      {trustItems && <TrustStrip items={trustItems} />}
      <section id="package-details" className="container-page grid gap-10 py-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          {hero ? (
            <h2 className="section-heading">Package Highlights</h2>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>
              <p className="mt-4 text-neutral-600">{intro}</p>
            </>
          )}
          <ul className={`space-y-2 text-sm text-neutral-600 ${hero ? "mt-4" : "mt-6"}`}>
            {highlights.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-0.5 text-primary-500" aria-hidden="true">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <PackageCard {...pkg} />
      </section>
      {serviceIntro && <ServiceIntroSection {...serviceIntro} />}
      {planningProcess && <HowItWorks {...planningProcess} />}
      {planningEligibility && <PlanningEligibilitySection {...planningEligibility} />}
      {inclusionsExclusions && <InclusionsExclusions {...inclusionsExclusions} />}
      {promoBanner && <PromoBanner {...promoBanner} />}
      {itinerary && <ItineraryTimeline {...itinerary} />}
      {testimonials && <CityTestimonialsSection {...testimonials} />}
      {faqs && <CityFAQSection faqs={faqs} />}
      {children}
      <ContactCTA {...finalCta} />
    </>
  );
}
