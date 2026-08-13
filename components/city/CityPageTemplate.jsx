import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PackageCard from "@/components/shared/PackageCard";
import ContactCTA from "@/components/home/ContactCTA";
import HowItWorks from "@/components/home/HowItWorks";
import EnquirySection from "@/components/enquiry/EnquirySection";
import CityHero from "./CityHero";
import FeatureGrid from "./FeatureGrid";
import IncludedExcluded from "./IncludedExcluded";
import PackageComparisonTable from "./PackageComparisonTable";
import JourneyTimeline from "./JourneyTimeline";
import DarshanInfoSection from "./DarshanInfoSection";
import CityFAQSection from "./CityFAQSection";
import CityTestimonialsSection from "./CityTestimonialsSection";
import CityCrossLinks from "./CityCrossLinks";
import { localBusinessSchema, JsonLd } from "@/lib/seo";

export default function CityPageTemplate({ city, packages, breadcrumbItems, pathname }) {
  return (
    <>
      <JsonLd
        data={localBusinessSchema({
          pathname,
          areaServed: city.name,
          description: city.hero.description,
        })}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <CityHero {...city.hero} />

      <FeatureGrid {...city.whyChooseUs} />

      <section className="bg-neutral-50 py-14">
        <div className="container-page">
          <h2 className="section-heading text-center">Available Tirupati Packages</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Travel assistance packages our coordinators help arrange most often for pilgrims departing
            from {city.name}.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.slug} {...pkg} />
            ))}
          </div>
        </div>
      </section>

      <PackageComparisonTable rows={city.comparisonRows} />

      <IncludedExcluded included={city.included} excluded={city.excluded} />

      <FeatureGrid {...city.travelOptions} muted />

      <FeatureGrid {...city.pickupLocations} />

      <FeatureGrid {...city.vehicleOptions} muted />

      <FeatureGrid {...city.journeyDuration} />

      <JourneyTimeline {...city.journeyTimeline} />

      <DarshanInfoSection {...city.darshanInfo} />

      <FeatureGrid {...city.templeTimings} muted />

      <FeatureGrid {...city.accommodation} columns={3} />

      <FeatureGrid {...city.bestTimeToVisit} muted />

      <CityFAQSection faqs={city.faqs} />

      <CityTestimonialsSection testimonials={city.testimonials} />

      <FeatureGrid {...city.whyBookWithUs} muted />

      <FeatureGrid {...city.travelTips} />

      <FeatureGrid {...city.dressCode} muted />

      <FeatureGrid {...city.requiredDocuments} />

      <FeatureGrid {...city.thingsToCarry} muted columns={3} />

      <FeatureGrid {...city.nearbyAttractions} />

      <HowItWorks heading="Our Process" steps={city.ourProcess} />

      <EnquirySection
        title={`Plan Your Tirupati Trip from ${city.name}`}
        subtitle={city.enquiry.subtitle}
        defaultDepartureCity={city.name}
        packageOptions={packages.map((pkg) => pkg.title)}
        sourceLabel={`${city.slug}_page`}
      />

      <CityCrossLinks links={city.crossLinks} />

      <ContactCTA />
    </>
  );
}
