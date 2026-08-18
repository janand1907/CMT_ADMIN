export function Timeline({ children }) {
  return <ol className="relative space-y-5 border-l border-gray-200 pl-5">{children}</ol>;
}

export function TimelineItem({ icon, title, meta, children }) {
  return (
    <li className="relative">
      <span className="absolute -left-[1.65rem] flex h-3 w-3 items-center justify-center rounded-full bg-primary-500 ring-4 ring-white">
        {icon}
      </span>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {meta && <span className="text-xs text-gray-400">{meta}</span>}
      </div>
      {children && <div className="mt-1 text-sm text-gray-500">{children}</div>}
    </li>
  );
}
