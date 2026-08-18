export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
      {icon}
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-12 text-center">
      <p className="text-sm font-medium text-red-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-red-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
