import Link from "next/link";

export function Pagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={buildHref(prev)}
          aria-disabled={page === 1}
          className={`rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium ${
            page === 1 ? "pointer-events-none text-gray-300" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Previous
        </Link>
        <Link
          href={buildHref(next)}
          aria-disabled={page === totalPages}
          className={`rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium ${
            page === totalPages ? "pointer-events-none text-gray-300" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
