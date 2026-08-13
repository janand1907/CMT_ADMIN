import { ShieldCheckIcon, HeadsetIcon, StarIcon, UsersIcon, RouteIcon } from "@/components/icons";

const defaultItems = [
  { icon: ShieldCheckIcon, label: "Trusted Travel Partner" },
  { icon: HeadsetIcon, label: "Dedicated Coordinator" },
  { icon: StarIcon, label: "4.6★ Rated Service" },
  { icon: UsersIcon, label: "Family-Friendly Support" },
  { icon: RouteIcon, label: "End-to-End Coordination" },
];

export default function TrustStrip({ heading = "Why Book With Us?", items = defaultItems }) {
  return (
    <section className="border-b border-neutral-100 bg-white py-6">
      <div className="container-page">
        {heading && (
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-secondary-600">{heading}</p>
        )}
        <ul className="mt-4 flex flex-wrap items-start justify-center gap-x-8 gap-y-4">
          {items.map(({ icon: Icon, label }) => (
            <li key={label} className="flex w-24 flex-col items-center gap-2 text-center sm:w-28">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-50">
                <Icon className="h-5 w-5 text-secondary-500" />
              </span>
              <span className="text-xs font-medium text-neutral-600">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
