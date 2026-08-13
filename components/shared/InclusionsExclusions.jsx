import { CheckCircleIcon, XCircleIcon } from "@/components/icons";

export default function InclusionsExclusions({ heading, inclusions = [], exclusions = [], note }) {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">{heading}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-green-700">Package Inclusions</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {inclusions.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-red-700">Package Exclusions</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {exclusions.map((item) => (
                <li key={item} className="flex gap-2">
                  <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {note && <p className="mt-6 text-center text-xs text-neutral-500">{note}</p>}
      </div>
    </section>
  );
}
