import {
  ShieldCheckIcon,
  HeadsetIcon,
  MapPinIcon,
  RouteIcon,
  CarIcon,
  BusIcon,
  TrainIcon,
  PlaneIcon,
  HotelIcon,
  ClockIcon,
  CompassIcon,
  BackpackIcon,
  LightBulbIcon,
  CheckCircleIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/icons";

export const bangaloreCity = {
  slug: "bangalore",
  name: "Bangalore",
  hero: {
    eyebrow: "Departing from Bangalore",
    title: "Tirupati Tour Package from Bangalore",
    description:
      "Independent travel assistance for pilgrims heading to Tirumala from Bangalore — coordinated transportation, accommodation, and darshan queue assistance, subject to availability and TTD's own processes.",
    image: "/images/ghat-road.jpg",
    imageAlt: "Ghat road leading up to Tirumala hills",
    badges: ["Approx. 255 km from Bangalore", "Dedicated coordinator", "WhatsApp support"],
  },
  whyChooseUs: {
    heading: "Why Choose Connect My Tours",
    subheading:
      "Straightforward, honest coordination for pilgrims travelling from Bangalore — no inflated promises, just real support.",
    items: [
      {
        icon: ShieldCheckIcon,
        title: "Transparent & Independent",
        description:
          "We're a privately operated travel agency, not affiliated with TTD or any government body — we're upfront about what we do and don't control.",
      },
      {
        icon: HeadsetIcon,
        title: "Dedicated Coordinators",
        description:
          "Every enquiry from Bangalore is followed up by a real coordinator who calls back to understand your plans before anything is confirmed.",
      },
      {
        icon: MapPinIcon,
        title: "Bangalore Route Experience",
        description:
          "Familiar with the Bangalore–Tirumala route via Chittoor and the travel options pilgrims from Bangalore usually prefer.",
      },
      {
        icon: RouteIcon,
        title: "Coordination, Not Guesswork",
        description:
          "We coordinate transportation, accommodation, and third-party providers so there's less logistics for you to manage yourself.",
      },
    ],
  },
  comparisonRows: [
    {
      name: "Tirumala Darshan Travel Assistance",
      duration: "2 Days / 1 Night",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Solo travellers and couples",
      price: "On Request",
    },
    {
      name: "Group Pilgrimage Travel Assistance",
      duration: "2 Days / 1 Night",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Families and group travellers",
      price: "On Request",
    },
    {
      name: "Custom Multi-Day Itinerary",
      duration: "Flexible",
      darshanAssistance: "Standard queue assistance*",
      bestFor: "Travellers wanting a relaxed, extended trip",
      price: "On Request",
    },
  ],
  included: [
    "Round-trip transportation coordination from Bangalore",
    "Accommodation coordination near Tirumala",
    "Darshan queue assistance, subject to availability",
    "Dedicated travel coordinator on call throughout your trip",
    "Guidance on documents and ID proofs to carry",
    "On-ground support for elderly and first-time pilgrims",
  ],
  excluded: [
    "Darshan tickets themselves — issued solely by TTD as per their process",
    "Personal shopping, donations, or temple offerings",
    "Meals not explicitly listed in your confirmed itinerary",
    "Travel insurance (can be arranged separately on request)",
    "Any charges arising from personal delays or itinerary changes",
  ],
  travelOptions: {
    heading: "Travel Options from Bangalore to Tirupati",
    subheading: "Approximate distance is about 255 km via Chittoor — here's how pilgrims from Bangalore usually travel.",
    items: [
      {
        icon: CarIcon,
        title: "By Car",
        description: "A flexible option, roughly 5 hours via NH716/Chittoor, depending on traffic.",
        bullets: ["Door-to-door convenience", "Good for families and small groups", "Coordinated pickup from your Bangalore location"],
      },
      {
        icon: BusIcon,
        title: "By Bus",
        description: "KSRTC and APSRTC buses connect Bangalore to Tirupati, roughly 5–6 hours.",
        bullets: ["Budget-friendly", "Day and overnight sleeper options", "Frequent daily departures"],
      },
      {
        icon: TrainIcon,
        title: "By Train",
        description: "Several trains run from Bangalore to Tirupati, roughly 5–6 hours depending on the service.",
        bullets: ["Comfortable for solo and group travel", "Multiple weekly departures", "Advance booking recommended"],
      },
      {
        icon: PlaneIcon,
        title: "By Flight",
        description: "Short flights connect Bangalore to Tirupati airport in around 1 hour, subject to airline schedules.",
        bullets: ["Fastest option", "Good for time-constrained travellers", "Limited daily frequency"],
      },
    ],
  },
  pickupLocations: {
    heading: "Pickup Locations in Bangalore",
    subheading: "Coordinated pickup points our travel partners commonly use for pilgrims departing from Bangalore.",
    items: [
      { icon: MapPinIcon, title: "Majestic (Bangalore City Railway Station)", description: "A central pickup point for pilgrims travelling by train." },
      { icon: MapPinIcon, title: "Kempegowda International Airport", description: "Coordinated pickup for pilgrims flying into Bangalore before onward travel." },
      { icon: MapPinIcon, title: "Electronic City & Silk Board", description: "A common pickup corridor for pilgrims in south Bangalore." },
      { icon: MapPinIcon, title: "Whitefield & Marathahalli", description: "Pickup coordination for pilgrims travelling from Bangalore's eastern IT corridor." },
    ],
  },
  vehicleOptions: {
    heading: "Vehicle Options for Your Journey",
    subheading: "We coordinate a range of vehicles to suit group size and comfort for the Bangalore–Tirumala route via Chittoor.",
    items: [
      { icon: CarIcon, title: "Sedan (Up to 4)", description: "A comfortable choice for solo travellers, couples, or small families." },
      { icon: CarIcon, title: "SUV (Up to 7)", description: "Extra legroom for the longer Bangalore–Chittoor–Tirumala drive." },
      { icon: BusIcon, title: "Tempo Traveller (12–17)", description: "Suited for larger families or group pilgrimages from Bangalore." },
      { icon: BusIcon, title: "Sleeper Coach", description: "Coordinated for overnight group travel on the longer Bangalore route." },
    ],
  },
  journeyDuration: {
    heading: "Journey Duration Options from Bangalore",
    subheading: "With around 255 km to cover via Chittoor, most pilgrims from Bangalore prefer to pace their trip over more than one day.",
    items: [
      { icon: ClockIcon, title: "Same-Day Trip", description: "Possible but tiring given the distance — better suited to fit and time-pressed travellers." },
      { icon: ClockIcon, title: "Overnight (2 Days / 1 Night)", description: "The most common choice from Bangalore, allowing rest before darshan." },
      { icon: ClockIcon, title: "Extended (3 Days / 2 Nights)", description: "A relaxed pace, popular with families combining the trip with nearby sightseeing." },
    ],
  },
  journeyTimeline: {
    heading: "Journey Timeline from Bangalore",
    steps: [
      { time: "Day 1 · Early Morning", title: "Depart from Bangalore", description: "Start your journey toward Tirumala by your chosen mode of transport." },
      { time: "Day 1 · Afternoon", title: "Reach Tirumala / Tirupati", description: "Check in to your coordinated accommodation and rest before darshan." },
      { time: "Day 1 · Evening", title: "Darshan Queue Process", description: "Proceed for darshan as per your slot and TTD's queue process, subject to availability." },
      { time: "Day 2 · Morning", title: "Local Sightseeing (Optional)", description: "Optionally visit nearby temples and attractions with local transportation coordination." },
      { time: "Day 2 · Afternoon", title: "Return to Bangalore", description: "Begin your return journey with transportation coordinated in advance." },
    ],
  },
  darshanInfo: {
    standard: {
      title: "Standard Darshan Information",
      description:
        "General darshan access follows TTD's own queue system and token/slot process, which can vary by season and demand.",
      points: [
        "Queue timing varies by day and season",
        "TTD's own counters and online systems govern token allocation",
        "We assist with coordination and guidance, not ticket issuance",
      ],
    },
    vip: {
      title: "Srivani VIP Break Darshan Information",
      description:
        "The Srivani Trust scheme is a TTD-run initiative that can offer a shorter queue wait, subject to eligibility and availability set by TTD.",
      points: [
        "Eligibility and slots are entirely controlled by TTD",
        "We help coordinate travel and accommodation around your scheduled slot",
        "Not a guarantee of darshan — always subject to TTD's process",
      ],
    },
  },
  templeTimings: {
    heading: "Temple Timings & Darshan Windows",
    subheading:
      "General guidance on Tirumala's darshan windows to help pilgrims travelling from Bangalore plan arrival timing — always confirm current timings with TTD directly.",
    items: [
      { icon: ClockIcon, title: "Suprabhata Seva", description: "The temple's day begins with this pre-dawn ritual, timed according to TTD's calendar." },
      { icon: ClockIcon, title: "Sarva Darshan (General)", description: "The general queue operates for most of the day; actual wait time depends on season and footfall." },
      { icon: ClockIcon, title: "Special Entry Darshan", description: "A separate ticketed queue managed entirely by TTD, subject to availability." },
    ],
  },
  accommodation: {
    heading: "Accommodation Assistance",
    subheading: "We help coordinate a comfortable stay near Tirumala so you're not left arranging it last-minute.",
    items: [
      { icon: HotelIcon, title: "Hotel Coordination", description: "Coordination with hotels near Tirumala and Tirupati across a range of budgets." },
      { icon: ClockIcon, title: "Timed to Your Darshan Slot", description: "Stay arrangements timed around your travel and darshan schedule where possible." },
      { icon: UsersIcon, title: "Family & Group Friendly", description: "Options coordinated for solo pilgrims, families, and larger groups travelling together." },
    ],
  },
  bestTimeToVisit: {
    heading: "Best Time to Visit Tirupati from Bangalore",
    subheading: "Since the Bangalore–Tirumala route runs through the Chittoor hills, weather can affect the drive as well as your darshan experience.",
    items: [
      { icon: LightBulbIcon, title: "Winter (Nov–Feb)", description: "Cool weather on the ghat road makes this the most comfortable season to travel from Bangalore." },
      { icon: SparklesIcon, title: "Summer (Mar–Jun)", description: "Warm across the route — an early start from Bangalore helps you arrive before the afternoon heat." },
      { icon: CompassIcon, title: "Monsoon (Jul–Sep)", description: "The Chittoor hills turn green, though rain can occasionally slow the ghat road." },
      { icon: ClockIcon, title: "Festival Season (Brahmotsavam)", description: "Expect heavier traffic on the route and crowded darshan queues — plan well ahead." },
    ],
  },
  faqs: [
    {
      question: "How far is Tirupati from Bangalore?",
      answer:
        "Tirupati is approximately 255 km from Bangalore by road via Chittoor, typically around 5 hours by car depending on traffic. Bus and train journeys usually take 5–6 hours.",
    },
    {
      question: "Can I do a one-day trip from Bangalore to Tirupati?",
      answer:
        "It's possible but tiring given the distance. Most pilgrims from Bangalore prefer an overnight stay for a more comfortable darshan experience. We can help coordinate either option.",
    },
    {
      question: "Does Connect My Tours book darshan tickets from Bangalore?",
      answer:
        "No. Darshan tickets and slots are issued solely by TTD through their own systems. We assist with travel coordination and general guidance around your visit, subject to TTD's availability and process.",
    },
    {
      question: "What is the best way to travel from Bangalore to Tirupati?",
      answer:
        "Car and bus are popular for flexibility and budget, trains suit advance-booked travellers, and flights are fastest for time-constrained pilgrims. We can help you weigh the options based on your schedule.",
    },
    {
      question: "Is Connect My Tours affiliated with TTD?",
      answer:
        "No. We are an independently owned and privately operated travel agency, not affiliated with, endorsed by, or officially connected with TTD or any government body.",
    },
    {
      question: "Can you arrange group travel from Bangalore?",
      answer:
        "Yes, we coordinate travel for families and larger groups departing from Bangalore, including shared transportation and group accommodation coordination.",
    },
  ],
  testimonials: [
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
    {
      name: "Verified Traveler",
      location: "Bangalore",
      quote: "Placeholder quote — replace with a real, verifiable customer review from a Bangalore traveller before launch.",
    },
  ],
  whyBookWithUs: {
    heading: "Why Book With Us",
    subheading: "A no-pressure, coordinator-led process built around your schedule from Bangalore.",
    items: [
      { icon: CheckCircleIcon, title: "No-Obligation Enquiry", description: "Submitting an enquiry doesn't commit you to booking anything." },
      { icon: HeadsetIcon, title: "Real Coordinator Callback", description: "A dedicated coordinator calls you back to discuss your specific needs." },
      { icon: SparklesIcon, title: "Honest Communication", description: "We're upfront about what's included, what's not, and what's subject to TTD's process." },
      { icon: RouteIcon, title: "End-to-End Coordination", description: "From transportation to stay, we coordinate the moving pieces so you don't have to." },
    ],
  },
  travelTips: {
    heading: "Important Travel Tips",
    subheading: "A few pointers to help your journey from Bangalore go smoothly.",
    items: [
      { icon: ClockIcon, title: "Start Early", description: "Leaving Bangalore before sunrise helps you avoid peak traffic near Chittoor." },
      { icon: BackpackIcon, title: "Carry ID Proof", description: "Keep a valid photo ID handy — it's required at various checkpoints and for darshan queues." },
      { icon: LightBulbIcon, title: "Check Weather", description: "Tirumala's hill weather can differ from Bangalore's — pack accordingly." },
      { icon: UsersIcon, title: "Elderly & Children", description: "Let your coordinator know in advance if you're travelling with elderly members or young children." },
    ],
  },
  dressCode: {
    heading: "Dress Code for Darshan",
    subheading: "TTD prescribes a dress code for darshan — here's what pilgrims travelling from Bangalore should know before packing.",
    items: [
      { icon: ShieldCheckIcon, title: "Men", description: "Dhoti/pyjama with an upper cloth, or formal trousers with a shirt, is the customary expectation." },
      { icon: ShieldCheckIcon, title: "Women", description: "Sarees, half-sarees, or salwar kameez are generally preferred for darshan." },
      { icon: CheckCircleIcon, title: "Children", description: "No strict dress code applies to children, though modest clothing is recommended." },
      { icon: CheckCircleIcon, title: "Special Entry Darshan", description: "Stricter attire rules may apply for special entry darshan — check with your coordinator closer to your travel date." },
    ],
  },
  requiredDocuments: {
    heading: "Documents to Carry",
    subheading: "Keep these documents ready for your trip from Bangalore — TTD and transport checkpoints may ask to verify identity.",
    items: [
      { icon: BackpackIcon, title: "Valid Photo ID", description: "Aadhaar, PAN, driving licence, or passport for every adult in your group." },
      { icon: BackpackIcon, title: "ID for Minors", description: "A birth certificate or school ID usually suffices for children travelling with family." },
      { icon: CheckCircleIcon, title: "Booking Confirmations", description: "Keep printed or downloaded copies of your travel and stay coordination details handy." },
      { icon: CheckCircleIcon, title: "Document Copies", description: "Carry a spare photocopy or photo of your ID separate from the original." },
    ],
  },
  thingsToCarry: {
    heading: "Things to Carry",
    subheading: "A general checklist for your Tirupati trip from Bangalore.",
    items: [
      { icon: BackpackIcon, title: "Valid Photo ID", description: "Aadhaar, passport, or other government-issued ID for verification." },
      { icon: BackpackIcon, title: "Comfortable Footwear", description: "For walking and standing during queues and temple visits." },
      { icon: BackpackIcon, title: "Light Woollens", description: "Tirumala can get cool, especially in the evenings and early mornings." },
      { icon: BackpackIcon, title: "Traditional Attire", description: "Follow TTD's prescribed dress code for darshan." },
      { icon: BackpackIcon, title: "Water & Snacks", description: "Useful for the road journey and waiting periods." },
      { icon: BackpackIcon, title: "Printed Confirmations", description: "Any booking confirmations or coordinator communication, printed or saved offline." },
    ],
  },
  nearbyAttractions: {
    heading: "Nearby Attractions",
    subheading: "If time permits, these nearby places are worth considering as part of your trip.",
    items: [
      { icon: CompassIcon, title: "Srikalahasti Temple", description: "A significant Shiva temple roughly 35–40 km from Tirupati, known for its Vayu Linga." },
      { icon: CompassIcon, title: "Kanipakam Vinayaka Temple", description: "A well-known Ganesha temple around 70 km from Tirupati, en route from Bangalore." },
      { icon: CompassIcon, title: "Chandragiri Fort", description: "A historic fort with palaces, located close to Tirupati town." },
      { icon: CompassIcon, title: "Horsley Hills", description: "A hill station in Chittoor district, a possible detour for nature lovers." },
    ],
  },
  ourProcess: [
    { title: "Choose Package", description: "Browse packages for departures from Bangalore and pick what fits your plans." },
    { title: "Submit Enquiry", description: "Share your travel dates and details through our form or WhatsApp." },
    { title: "Coordinator Calls", description: "A coordinator calls you back to confirm details and answer questions." },
    { title: "Confirm Plan", description: "Review the coordinated travel plan and confirm it with your coordinator." },
    { title: "Travel from Bangalore", description: "Begin your pilgrimage with transportation and support arranged in advance." },
  ],
  enquiry: {
    subtitle:
      "Share your travel dates and we'll help coordinate transportation, accommodation, and darshan queue assistance for your trip from Bangalore.",
  },
  crossLinks: [
    { label: "Home", href: "/" },
    { label: "Tirupati Package Chennai", href: "/chennai" },
    { label: "Tirupati Package Hyderabad", href: "/hyderabad" },
    { label: "Local Travel Assistance in Tirupati", href: "/tirupati" },
    { label: "Frequently Asked Questions", href: "/faq" },
    { label: "Contact Our Coordinators", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
};
