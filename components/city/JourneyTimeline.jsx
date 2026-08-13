export default function JourneyTimeline({ heading = "Journey Timeline", steps = [] }) {
  return (
    <section className="py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">{heading}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          An approximate view of how your trip typically flows — actual timings vary with traffic,
          transport mode, and temple authority processes on the day.
        </p>

        <ol className="relative mx-auto mt-10 max-w-2xl border-l-2 border-primary-100 pl-8">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[2.35rem] flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white ring-4 ring-white">
                {index + 1}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{step.time}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-primary-900">{step.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
