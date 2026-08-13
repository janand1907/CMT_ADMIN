export default function ServiceIntroSection({ heading, paragraphs, secondary, highlight }) {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <h2 className="section-heading">{heading}</h2>
          <div className="mt-4 space-y-4 text-neutral-600">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {secondary && (
            <div className="mt-4">
              <h3 className="font-display text-lg font-semibold text-primary-900">{secondary.heading}</h3>
              <p className="mt-2 text-neutral-600">{secondary.paragraph}</p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border-t-4 border-secondary-500 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600">{highlight.eyebrow}</p>
          <p className="mt-2 font-display text-xl font-bold text-primary-900">{highlight.title}</p>
          <p className="mt-2 text-sm text-neutral-600">{highlight.subtitle}</p>
        </div>
      </div>
    </section>
  );
}
