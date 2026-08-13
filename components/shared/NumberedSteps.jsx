export default function NumberedSteps({ heading, steps = [] }) {
  return (
    <section className="bg-neutral-50 py-10">
      <div className="container-page mx-auto max-w-2xl">
        <h2 className="section-heading text-center">{heading}</h2>
        <ol className="mt-8 space-y-5">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-500 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-primary-900">{step.title}</p>
                {step.subItems && (
                  <ul className="mt-1 space-y-1 text-sm text-neutral-600">
                    {step.subItems.map((sub) => (
                      <li key={sub} className="flex gap-2">
                        <span aria-hidden="true">–</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
