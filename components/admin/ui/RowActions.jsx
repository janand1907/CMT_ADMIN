"use client";

import Link from "next/link";
import { useTransition } from "react";

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.75 1a.75.75 0 00-.75.75V3H4a.75.75 0 000 1.5h.54l.853 10.66A2.75 2.75 0 008.135 17.5h3.73a2.75 2.75 0 002.742-2.34L15.46 4.5H16a.75.75 0 000-1.5h-4v-1.25a.75.75 0 00-.75-.75h-2.5zM9.5 3V2.5h1V3h-1zM6.045 4.5h7.91l-.833 10.42a1.25 1.25 0 01-1.246 1.08h-3.73a1.25 1.25 0 01-1.246-1.08L6.045 4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function RowActions({ editHref, onDelete, itemLabel, confirmMessage }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(confirmMessage || `Delete ${itemLabel}? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await onDelete();
      if (res?.error) window.alert(res.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={editHref}
        aria-label={`Edit ${itemLabel}`}
        title="Edit"
        className="rounded p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-primary-600"
      >
        <PencilIcon />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Delete ${itemLabel}`}
        title="Delete"
        className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
