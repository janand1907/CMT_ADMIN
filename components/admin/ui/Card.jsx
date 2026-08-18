export function Card({ children, className = "", padded = true }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm ${padded ? "p-6" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, trend }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {(hint || trend) && (
        <p className="mt-1 text-xs text-gray-400">
          {trend && <span className={trend.direction === "down" ? "text-red-600" : "text-green-600"}>{trend.label} </span>}
          {hint}
        </p>
      )}
    </div>
  );
}
