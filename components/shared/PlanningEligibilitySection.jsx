export default function PlanningEligibilitySection({ planning, eligibility }) {
  return (
    <section className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="section-heading">{planning.heading}</h2>
          <div className="mt-4 space-y-4 text-neutral-600">
            {planning.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-secondary-50 p-6">
          <h2 className="section-heading">{eligibility.heading}</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            {eligibility.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-primary-500" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
