// Minimal hand-rolled stroke icon set (24x24, currentColor) — avoids pulling in
// an icon library dependency for a small, fixed set of glyphs used site-wide.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function PhoneIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 4h3l1.5 4.5L7.5 10a11 11 0 006.5 6.5l1.5-2 4.5 1.5V19a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" />
    </svg>
  );
}

export function MapPinIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s-7-6.1-7-11a7 7 0 0114 0c0 4.9-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function UsersIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0" />
      <path d="M15 6.5a3 3 0 013 3M14 13.5a6 6 0 016 6.5" />
    </svg>
  );
}

export function CalendarIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function PackageIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 8l8.5-4.5L20.5 8v8L12 20.5 3.5 16z" />
      <path d="M3.5 8L12 12l8.5-4M12 12v8.5" />
    </svg>
  );
}

export function MessageIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  );
}

export function CheckCircleIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.4" />
    </svg>
  );
}

export function XCircleIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

export function CarIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 16V11l2-4.5h12L20 11v5" />
      <path d="M3.5 16h17v2.5a1 1 0 01-1 1H16a1 1 0 01-1-1V17H9v1.5a1 1 0 01-1 1H4.5a1 1 0 01-1-1z" />
      <circle cx="7.5" cy="16" r="1.4" />
      <circle cx="16.5" cy="16" r="1.4" />
    </svg>
  );
}

export function BusIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="16" height="13" rx="2" />
      <path d="M4 10.5h16M7 17v2M17 17v2" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
    </svg>
  );
}

export function TrainIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="5.5" y="3.5" width="13" height="13" rx="3" />
      <path d="M5.5 12h13M9 16.5L7 20M15 16.5l2 3.5" />
      <circle cx="9" cy="8" r="1" />
      <circle cx="15" cy="8" r="1" />
    </svg>
  );
}

export function PlaneIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M11 3.5l1 6.5 7 3.5v1.5l-7-2v3l2 1.5v1.3l-3-1-3 1v-1.3l2-1.5v-3l-7 2v-1.5l7-3.5z" />
    </svg>
  );
}

export function ClockIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ShieldCheckIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function HotelIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V6.5M4 11h16v9M4 11a3 3 0 013-3h2a3 3 0 013 3M13 20v-3.5h4V20" />
    </svg>
  );
}

export function CompassIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5z" />
    </svg>
  );
}

export function BackpackIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M8 8V6a4 4 0 018 0v2" />
      <path d="M6 8h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2z" />
      <path d="M9 12h6M9 20v-5h6v5" />
    </svg>
  );
}

export function LightBulbIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z" />
    </svg>
  );
}

export function HeadsetIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 13a8 8 0 0116 0v4a2 2 0 01-2 2h-1v-6h3M4 17v-4h3v6H6a2 2 0 01-2-2z" />
      <path d="M9 19a2 2 0 002 2h1" />
    </svg>
  );
}

export function SparklesIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3z" />
      <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  );
}

export function RouteIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="5.5" cy="6" r="2" />
      <circle cx="18.5" cy="18" r="2" />
      <path d="M5.5 8v3a3 3 0 003 3h7a3 3 0 013 3v1" />
    </svg>
  );
}

export function MailIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v14H4z" />
      <path d="M4 6l8 7 8-7" />
    </svg>
  );
}

export function XMarkIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function UserIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0114 0" />
    </svg>
  );
}

export function ChevronDownIcon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function StarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.2-4.7 6.9-.7z" />
    </svg>
  );
}
