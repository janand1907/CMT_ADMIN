import Breadcrumbs from "./Breadcrumbs";
import PackageCard from "./PackageCard";
import ContactCTA from "@/components/home/ContactCTA";

export default function CityLandingLayout({ eyebrow, title, intro, packages, breadcrumbItems }) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-neutral-600">{intro}</p>
      </section>
      <section className="container-page pb-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.slug} {...pkg} />
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
