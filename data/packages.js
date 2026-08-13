// Photos are Tirumala/Tirupati temple imagery from Wikimedia Commons (CC BY-SA /
// CC BY / public domain) — see attribution credits in components/layout/Footer.jsx.
// price is intentionally "On Request" across the board — no invented figures,
// since accurate pricing must come from the user before this ships.

export const homePackages = [
  {
    slug: "chennai-by-car",
    iconName: "CarIcon",
    title: "Chennai to Tirupati Package (By Car)",
    description:
      "Comfortable Chennai to Tirupati travel package with private AC car transport, pickup, hotel stay options and return drop support for a smooth pilgrimage trip.",
    includesText: "Includes private car, route planning and optional hotel stay",
    bestForText: "Best for families and devotees travelling from Chennai",
    buttonLabel: "View Chennai Package",
    bookUrl: "/chennai",
    secondaryLink: { label: "View NRI Chennai Package", href: "/chennai/nri-darshan-package" },
  },
  {
    slug: "hyderabad-package",
    iconName: "PlaneIcon",
    title: "Hyderabad to Tirupati Package",
    description:
      "Tirupati package from Hyderabad with convenient travel planning, pickup support, hotel stay options and smooth trip coordination.",
    includesText: "Includes travel planning, transfers and optional stay support",
    bestForText: "Ideal for devotees travelling from Hyderabad",
    buttonLabel: "View Hyderabad Package",
    bookUrl: "/hyderabad",
    secondaryLink: { label: "View NRI Hyderabad Package", href: "/hyderabad/nri-darshan-package" },
  },
  {
    slug: "nri-chennai",
    iconName: "CompassIcon",
    title: "NRI Tirupati Package from Chennai",
    description:
      "Specially designed Tirupati travel package for NRI and overseas devotees arriving in Chennai with airport pickup, private car travel and trip coordination.",
    includesText: "Includes airport pickup, private vehicle and travel support",
    buttonLabel: "View NRI Chennai Package",
    bookUrl: "/chennai/nri-darshan-package",
  },
  {
    slug: "nri-hyderabad",
    iconName: "HeadsetIcon",
    title: "NRI Tirupati Package from Hyderabad",
    description:
      "Tirupati package for NRI devotees travelling through Hyderabad with airport transfers, travel planning and comfortable trip support.",
    includesText: "Includes pickup, itinerary planning and travel coordination",
    buttonLabel: "View NRI Hyderabad Package",
    bookUrl: "/hyderabad/nri-darshan-package",
  },
];

export const chennaiPackages = [
  {
    slug: "chennai-srivani",
    title: "Srivani VIP Break Darshan",
    image: "/images/temple-entrance.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Departure coordination from Chennai",
      "Break darshan queue assistance, subject to availability",
      "Hotel stay coordination near Tirumala",
      "Dedicated coordinator support throughout",
    ],
    bookUrl: "/chennai/srivani-vip-break-darshan",
  },
  {
    slug: "chennai-nri",
    title: "NRI Darshan Package",
    image: "/images/maha-dwaram.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Designed for NRI and overseas travellers",
      "Airport-to-Tirumala transportation coordination",
      "Darshan queue assistance, subject to availability",
      "Flexible scheduling around international flights",
    ],
    bookUrl: "/chennai/nri-darshan-package",
  },
];

export const hyderabadPackages = [
  {
    slug: "hyderabad-srivani",
    title: "Srivani VIP Break Darshan",
    image: "/images/temple-entrance.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Departure coordination from Hyderabad",
      "Break darshan queue assistance, subject to availability",
      "Hotel stay coordination near Tirumala",
      "Dedicated coordinator support throughout",
    ],
    bookUrl: "/hyderabad/srivani-vip-break-darshan",
  },
  {
    slug: "hyderabad-nri",
    title: "NRI Darshan Package",
    image: "/images/maha-dwaram.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Designed for NRI and overseas travellers",
      "Airport-to-Tirumala transportation coordination",
      "Darshan queue assistance, subject to availability",
      "Flexible scheduling around international flights",
    ],
    bookUrl: "/hyderabad/nri-darshan-package",
  },
];

export const bangalorePackages = [
  {
    slug: "bangalore-standard",
    title: "Tirumala Darshan Travel Assistance — from Bangalore",
    image: "/images/ghat-road.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Round-trip transportation coordination from Bangalore",
      "Darshan queue assistance, subject to availability",
      "Accommodation coordination near Tirumala",
      "Dedicated travel coordinator on call",
    ],
    bookUrl: "/contact-us",
  },
  {
    slug: "bangalore-group",
    title: "Group Pilgrimage Travel Assistance",
    image: "/images/alipiri-entrance.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Suited for families and group travellers",
      "Shared transportation coordination",
      "Group accommodation coordination",
      "Single point-of-contact coordinator",
    ],
    bookUrl: "/contact-us",
  },
];

export const tirupatiPackages = [
  {
    slug: "tirupati-day",
    title: "Same-Day Darshan Assistance",
    image: "/images/ghat-road.jpg",
    price: "On Request",
    duration: "1 Day",
    highlights: [
      "Local transportation between Tirupati and Tirumala",
      "Darshan queue assistance, subject to availability",
      "Support for elderly and first-time pilgrims",
      "On-ground coordinator support",
    ],
    bookUrl: "/contact-us",
  },
  {
    slug: "tirupati-stay",
    title: "Overnight Darshan Assistance",
    image: "/images/tirumala-gopurams.jpg",
    price: "On Request",
    duration: "2 Days / 1 Night",
    highlights: [
      "Accommodation coordination near Tirumala",
      "Darshan queue assistance, subject to availability",
      "Local transportation coordination",
      "Dedicated coordinator support throughout",
    ],
    bookUrl: "/contact-us",
  },
];
