const ACTIVITY_STYLES = {
  drive: { dot: "bg-blue-500", icon: "🚗", label: "Drive" },
  arrive: { dot: "bg-green-500", icon: "📍", label: "Arrive" },
  explore: { dot: "bg-purple-500", icon: "🧭", label: "Explore" },
  checkout: { dot: "bg-red-500", icon: "🧳", label: "Check-out" },
};

export default function ItineraryTimeline({ heading, days = [] }) {
  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">{heading}</h2>
      <div className="mx-auto mt-10 max-w-2xl space-y-10">
        {days.map((day) => (
          <div key={day.label}>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary-600">{day.label}</p>
            <ol className="mt-4 space-y-6 border-l-2 border-neutral-200 pl-6">
              {day.items.map((item, index) => {
                const style = ACTIVITY_STYLES[item.type] || ACTIVITY_STYLES.explore;
                return (
                  <li key={`${day.label}-${index}`} className="relative">
                    <span
                      className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${style.dot}`}
                      aria-hidden="true"
                    >
                      {style.icon}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                      {style.label}
                    </span>
                    <h3 className="font-display text-base font-semibold text-primary-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
