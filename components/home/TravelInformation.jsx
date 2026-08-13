import { siteConfig } from "@/config/site";
import { MapPinIcon, LightBulbIcon, CheckCircleIcon } from "@/components/icons";

export default function TravelInformation() {
  return (
    <section className="bg-white py-14">
      <div className="container-page mx-auto max-w-3xl text-center">
        <h2 className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-primary-900 sm:text-3xl">
          <MapPinIcon className="h-6 w-6 shrink-0 text-secondary-500" />
          Trusted Tirupati Tour Packages from Chennai &amp; Hyderabad
        </h2>

        <p className="mt-5 text-neutral-600">
          Planning a Tirupati trip from Chennai or Hyderabad? {siteConfig.name} provides complete
          pilgrimage travel packages with private car transport, hotel stay options, airport
          pickup, itinerary planning and return drop support. We offer Chennai to Tirupati car
          packages and Hyderabad to Tirupati travel plans for families, senior citizens, group
          travellers and NRI devotees.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border-l-4 border-secondary-500 bg-neutral-50 p-4 text-left">
          <LightBulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-500" />
          <p className="font-semibold text-neutral-800">
            Get complete details on package pricing, travel plans, vehicle options and hotel stay
            before confirmation.
          </p>
        </div>

        <p className="mt-6 text-neutral-600">
          Our services are designed for devotees looking for transparent pricing, comfortable
          travel and smooth coordination. We also assist travellers from Malaysia, Singapore, Sri
          Lanka, the UK and other countries visiting Tirupati through Chennai or Hyderabad.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-secondary-400 bg-secondary-50 p-4 text-left">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-500" />
          <p className="font-semibold text-secondary-800">
            Enquire easily on WhatsApp and receive suitable Tirupati package options from our
            team.
          </p>
        </div>
      </div>
    </section>
  );
}
