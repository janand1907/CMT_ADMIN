import Link from "next/link";
import { CarIcon } from "@/components/icons";

export default function VehiclePricingList({ heading, vehicles = [], bookUrl }) {
  return (
    <section className="container-page py-10">
      <h2 className="section-heading text-center">{heading}</h2>
      <div className="mx-auto mt-8 max-w-3xl space-y-4">
        {vehicles.map(({ name, capacity, inclusions, note, price, icon: Icon = CarIcon }) => (
          <div key={name} className="card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-[9rem] flex-1">
              <p className="font-display text-base font-semibold text-primary-900">{name}</p>
              <span className="mt-1 inline-block rounded-full bg-secondary-500 px-2.5 py-0.5 text-xs font-medium text-white">
                {capacity}
              </span>
            </div>
            <p className="flex-[2] text-sm text-neutral-600">
              {inclusions}
              {note && <span className="mt-1 block text-xs text-neutral-400">{note}</span>}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold text-primary-800">{price}</span>
              <Link href={bookUrl} className="btn-secondary px-4 py-2 text-sm">
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
