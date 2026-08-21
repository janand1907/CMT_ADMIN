"use client";

import { usePathname } from "next/navigation";

// Thin wrapper around a plain <a> — same href/className/children/behavior as
// before, plus a fire-and-forget tracking beacon. Deliberately not awaited and
// never calls preventDefault(), so the browser's native tel:/wa.me navigation
// is never delayed or gated by the tracking request succeeding, timing out, or
// failing outright (app/api/contact-click/route.js also never errors back).
export default function TrackedContactLink({ actionType, children, onClick, ...anchorProps }) {
  const pathname = usePathname();

  function handleClick(event) {
    fetch("/api/contact-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType, pagePath: pathname || "/" }),
      keepalive: true,
    }).catch(() => {});
    onClick?.(event);
  }

  return (
    <a {...anchorProps} onClick={handleClick}>
      {children}
    </a>
  );
}
