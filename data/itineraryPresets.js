// Starter templates for the itinerary planner. Each preset pre-fills the
// planner's starting city and stops (with nights) — travellers can tweak
// everything after loading one. "nights: 0" means a same-day stop with no
// overnight stay there.
export const itineraryPresets = [
  {
    id: "chennai-tirupati-daytrip",
    category: "Chennai → Tirupati",
    label: "Tirupati Day Trip",
    description: "Same-day darshan from Chennai and back, no overnight stay.",
    image: "/images/ghat-road.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [{ city: "Tirupati, Andhra Pradesh", nights: 0 }],
  },
  {
    id: "chennai-tirupati-2d1n",
    category: "Chennai → Tirupati",
    label: "Tirupati 2D/1N",
    description: "Overnight stay in Tirupati for a more relaxed darshan pace.",
    image: "/images/tirumala-gopurams.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [{ city: "Tirupati, Andhra Pradesh", nights: 1 }],
  },
  {
    id: "chennai-tirupati-srivani",
    category: "Chennai → Tirupati",
    label: "Srivani VIP Break Darshan",
    description: "Overnight trip built around Srivani VIP break darshan coordination.",
    image: "/images/temple-entrance.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [{ city: "Tirupati, Andhra Pradesh", nights: 1 }],
  },
  {
    id: "chennai-kerala-express",
    category: "Chennai → Kerala",
    label: "Kerala Express (5D/4N)",
    description: "Munnar hills, Thekkady wildlife and an Alleppey houseboat cruise.",
    image: "/images/kerala/munnar-tea-plantations.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [
      { city: "Munnar, Kerala", nights: 2 },
      { city: "Thekkady, Kerala", nights: 1 },
      { city: "Alleppey, Kerala", nights: 1 },
    ],
  },
  {
    id: "chennai-kerala-temple-nature",
    category: "Chennai → Kerala",
    label: "Temple & Nature Trail (7D/6N)",
    description: "Guruvayur darshan plus Munnar, Thekkady and Alleppey.",
    image: "/images/kerala/guruvayur-sri-krishna-temple.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [
      { city: "Guruvayur, Kerala", nights: 1 },
      { city: "Munnar, Kerala", nights: 2 },
      { city: "Thekkady, Kerala", nights: 1 },
      { city: "Alleppey, Kerala", nights: 1 },
    ],
  },
  {
    id: "chennai-kerala-backwaters-weekend",
    category: "Chennai → Kerala",
    label: "Backwaters Weekend (3D/2N)",
    description: "A quick Alleppey houseboat getaway via Kochi.",
    image: "/images/kerala/alleppey-houseboat-backwaters.jpg",
    startCity: "Chennai, Tamil Nadu",
    stops: [{ city: "Alleppey, Kerala", nights: 2 }],
  },
  {
    id: "navagraha-temples",
    category: "Temple Circuits",
    label: "Navagraha Temples around Mayiladuthurai",
    description:
      "Suggested day-wise grouping of the nine planetary temples — your coordinator will fine-tune the order based on temple timings.",
    startCity: "Mayiladuthurai, Tamil Nadu",
    stops: [
      { city: "Suryanar Kovil, Tamil Nadu", nights: 0 },
      { city: "Thingalur, Tamil Nadu", nights: 0 },
      { city: "Vaitheeswaran Koil, Tamil Nadu", nights: 0 },
      { city: "Thiruvenkadu, Tamil Nadu", nights: 1 },
      { city: "Kanjanur, Tamil Nadu", nights: 0 },
      { city: "Thirunallar, Tamil Nadu", nights: 0 },
      { city: "Keezhaperumpallam, Tamil Nadu", nights: 0 },
      { city: "Thirunageswaram, Tamil Nadu", nights: 0 },
      { city: "Alangudi, Tamil Nadu", nights: 0 },
    ],
  },
  {
    id: "shirdi-yatra-chennai",
    category: "Pilgrimage",
    label: "Shirdi Yatra from Chennai",
    description: "Sai Baba darshan at Shirdi, with an optional Shani Shingnapur stop.",
    startCity: "Chennai, Tamil Nadu",
    stops: [
      { city: "Shirdi, Maharashtra", nights: 1 },
      { city: "Shani Shingnapur, Maharashtra", nights: 0 },
    ],
  },
];
