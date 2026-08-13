import Link from "next/link";
import { PlaneIcon, CarIcon, HeadsetIcon, BackpackIcon } from "@/components/icons";

const nriFeatures = [
  {
    icon: PlaneIcon,
    title: "Built Around Your Flight Schedule",
    description: "Darshan and pickup timing coordinated around international arrival and departure times.",
  },
  {
    icon: CarIcon,
    title: "Airport Pickup & Drop",
    description: "Coordinated transfers between the airport and your accommodation near Tirumala.",
  },
  {
    icon: HeadsetIcon,
    title: "English-Speaking Coordinator",
    description: "A dedicated coordinator supports you by phone throughout the trip.",
  },
  {
    icon: BackpackIcon,
    title: "Passport / OCI Document Guidance",
    description: "Clear guidance on the ID and visa documents accepted for darshan and travel.",
  },
];

const nriPackages = [
  { label: "NRI Darshan Package — from Chennai", href: "/chennai/nri-darshan-package" },
  { label: "NRI Darshan Package — from Hyderabad", href: "/hyderabad/nri-darshan-package" },
];

export default function NRISection() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            For NRI &amp; Overseas Pilgrims
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary-900">
            Travelling for Tirupati Darshan From Abroad?
          </h2>
          <p className="mt-4 text-neutral-600">
            We help NRI and overseas travellers plan their Tirupati visit around international
            flight schedules, with airport transfer and darshan coordination handled in advance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {nriPackages.map((pkg) => (
              <Link key={pkg.href} href={pkg.href} className="btn-secondary">
                {pkg.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {nriFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-5">
                <Icon className="h-6 w-6 text-primary-500" />
                <h3 className="mt-3 font-display text-sm font-semibold text-primary-800">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
