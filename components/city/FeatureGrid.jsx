export default function FeatureGrid({ heading, subheading, items, columns = 4, muted = false, headingLevel = "h2" }) {
  const Heading = headingLevel;
  const colClass = columns === 3 ? "lg:grid-cols-3" : columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4";

  return (
    <section className={muted ? "bg-neutral-50 py-14" : "py-14"}>
      <div className="container-page">
        <Heading className="section-heading text-center">{heading}</Heading>
        {subheading && <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">{subheading}</p>}
        <div className={`mt-10 grid gap-6 sm:grid-cols-2 ${colClass}`}>
          {items.map(({ icon: Icon, title, description, bullets }) => (
            <div key={title} className="card p-6">
              {Icon && (
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-6 w-6" />
                </span>
              )}
              <h3 className="mt-4 font-display text-base font-semibold text-primary-800">{title}</h3>
              {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
              {bullets && bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
                  {bullets.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-0.5 text-primary-500" aria-hidden="true">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
