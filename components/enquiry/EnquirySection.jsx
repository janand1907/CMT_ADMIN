import EnquiryFormFields from "@/components/contact/EnquiryFormFields";
import { siteConfig } from "@/config/site";
import { HeadsetIcon, ShieldCheckIcon, WhatsAppIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

const trustPoints = [
  {
    icon: HeadsetIcon,
    title: "Dedicated Coordinator",
    description: "A real travel coordinator calls you back to understand your trip before anything is confirmed.",
  },
  {
    icon: ShieldCheckIcon,
    title: "No-Obligation Enquiry",
    description: "Sharing your details doesn't commit you to anything — get the information you need first.",
  },
  {
    icon: MapPinIcon,
    title: "Multi-City Departures",
    description: "Coordination support for pilgrims travelling from Chennai, Bangalore, Hyderabad, and within Tirupati.",
  },
  {
    icon: WhatsAppIcon,
    title: "WhatsApp Support",
    description: "Prefer chatting? Send your enquiry straight to WhatsApp in one tap.",
  },
];

export default function EnquirySection({
  title = "Plan Your Tirupati Pilgrimage",
  subtitle = "Share a few details and a travel coordinator will call you back to help arrange transportation, accommodation, and darshan queue assistance for your trip.",
  defaultDepartureCity = "",
  packageOptions,
  sourceLabel = "enquiry_section",
  id = "enquiry",
}) {
  return (
    <section id={id} className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-500/10"
        aria-hidden="true"
      />

      <div className="container-page relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-200">Request a Callback</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-xl text-white/80">{subtitle}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {trustPoints.map(({ icon: Icon, title: pointTitle, description }) => (
              <div key={pointTitle} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-primary-200" />
                <p className="mt-2 text-sm font-semibold text-white">{pointTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 hover:text-white">
              <PhoneIcon className="h-4 w-4" />
              {siteConfig.phoneDisplay}
            </a>
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <span>{siteConfig.officeHours}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-modal sm:p-8">
          <h3 className="font-display text-xl font-semibold text-primary-900">Send an Enquiry</h3>
          <p className="mt-1 text-sm text-neutral-500">We usually respond within a few hours.</p>
          <EnquiryFormFields
            sourceLabel={sourceLabel}
            defaultDepartureCity={defaultDepartureCity}
            packageOptions={packageOptions}
          />
        </div>
      </div>
    </section>
  );
}
