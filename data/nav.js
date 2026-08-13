export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Plan Your Itinerary", href: "/itinerary-planner" },
  {
    label: "Chennai",
    href: "/chennai",
    children: [
      { label: "Srivani VIP Break Darshan", href: "/chennai/srivani-vip-break-darshan" },
      { label: "NRI Darshan Package", href: "/chennai/nri-darshan-package" },
    ],
  },
  // Temporarily hidden from the main menu — re-enable when ready.
  // { label: "Bangalore", href: "/bangalore" },
  {
    label: "Hyderabad",
    href: "/hyderabad",
    children: [
      { label: "Srivani VIP Break Darshan", href: "/hyderabad/srivani-vip-break-darshan" },
      { label: "NRI Darshan Package", href: "/hyderabad/nri-darshan-package" },
    ],
  },
  // Temporarily hidden from the main menu — re-enable when ready.
  // { label: "Tirupati", href: "/tirupati" },
  { label: "Kerala", href: "/kerala" },
  { label: "South India", href: "/south-india" },
];

export const footerQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Chennai", href: "/chennai" },
  { label: "Bangalore", href: "/bangalore" },
  { label: "Hyderabad", href: "/hyderabad" },
  { label: "Tirupati", href: "/tirupati" },
  { label: "Kerala", href: "/kerala" },
  { label: "South India", href: "/south-india" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];
