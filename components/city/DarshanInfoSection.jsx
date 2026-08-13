import { SparklesIcon, MapPinIcon } from "@/components/icons";

function DarshanCard({ icon: Icon, iconWrapClass, cardClass, title, description, points }) {
  return (
    <div className={`card mx-auto max-w-2xl p-6 sm:p-8 ${cardClass}`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClass}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-600">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="mt-0.5 text-primary-500" aria-hidden="true">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DarshanInfoSection({ standard, vip }) {
  return (
    <>
      <section className="bg-neutral-50 py-14">
        <div className="container-page">
          <h2 className="section-heading text-center">Darshan Information</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            All darshan access is governed entirely by TTD&rsquo;s own booking systems and processes —
            here&rsquo;s how our coordination fits around it.
          </p>
          <div className="mt-10">
            <DarshanCard
              icon={MapPinIcon}
              iconWrapClass="bg-primary-50 text-primary-700"
              cardClass=""
              title={standard.title}
              description={standard.description}
              points={standard.points}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <h2 className="section-heading text-center">VIP Break Darshan Information</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            The Srivani Trust and other break-darshan schemes are run entirely by TTD — here&rsquo;s how
            we coordinate around your scheduled slot.
          </p>
          <div className="mt-10">
            <DarshanCard
              icon={SparklesIcon}
              iconWrapClass="bg-primary-800 text-white"
              cardClass="border-2 border-primary-100"
              title={vip.title}
              description={vip.description}
              points={vip.points}
            />
          </div>
        </div>
      </section>
    </>
  );
}
