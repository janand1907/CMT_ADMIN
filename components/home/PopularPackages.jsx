import { homePackages } from "@/data/packages";
import PackageCard from "@/components/shared/PackageCard";
import { CarIcon, PlaneIcon, CompassIcon, HeadsetIcon } from "@/components/icons";

const iconMap = { CarIcon, PlaneIcon, CompassIcon, HeadsetIcon };

export default function PopularPackages() {
  return (
    <section id="packages" className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">
          Tirupati Tour Packages from Chennai by Car &amp; Hyderabad Travel Plans
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          Choose from Chennai and Hyderabad Tirupati travel packages based on your travel date,
          budget, vehicle preference and stay requirement.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {homePackages.map(({ iconName, ...pkg }) => (
            <PackageCard key={pkg.slug} icon={iconMap[iconName]} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
