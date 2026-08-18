export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className = "" }) {
  return <th className={`px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${className}`}>{children}</th>;
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function Tr({ children, className = "" }) {
  return <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-2.5 text-gray-700 ${className}`}>{children}</td>;
}

export function EmptyRow({ colSpan, children = "Nothing here yet." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-400">
        {children}
      </td>
    </tr>
  );
}
