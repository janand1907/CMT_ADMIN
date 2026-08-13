import { CheckCircleIcon, XCircleIcon } from "@/components/icons";

export default function IncludedExcluded({ included = [], excluded = [] }) {
  return (
    <section className="py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">What&rsquo;s Included &amp; What&rsquo;s Not</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          A clear picture of what our coordination covers, so there are no surprises before you travel.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-800">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              What&rsquo;s Included
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              {included.map((point) => (
                <li key={point} className="flex gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 sm:p-8">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-primary-800">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              What&rsquo;s Not Included
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              {excluded.map((point) => (
                <li key={point} className="flex gap-2">
                  <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
