import Link from "next/link";

export default function CityCrossLinks({ links = [] }) {
  return (
    <section className="border-t border-neutral-100 py-12">
      <div className="container-page">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-primary-600">
          Explore More
        </h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-primary-800 shadow-soft transition hover:border-primary-200 hover:bg-primary-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
