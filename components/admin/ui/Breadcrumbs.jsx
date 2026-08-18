import Link from "next/link";

export function Breadcrumbs({ items }) {
  return (
    <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
