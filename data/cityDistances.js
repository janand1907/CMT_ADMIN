// Car-only distance/time estimation for the itinerary planner. This site only
// arranges private car travel, so every route here is a road (driving) route —
// never a flight/train/bus line-of-sight distance.
//
// Approximate lat/lng for every city in `indiaDestinations` (plus the
// Navagraha temple-circuit stops used by the itinerary presets). Coordinates
// are only precise enough to drive the Haversine fallback below, not for
// pinpoint mapping.
export const cityCoordinates = {
  "Chennai, Tamil Nadu": { lat: 13.0827, lng: 80.2707 },
  "Bangalore, Karnataka": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad, Telangana": { lat: 17.385, lng: 78.4867 },
  "Tirupati, Andhra Pradesh": { lat: 13.6288, lng: 79.4192 },
  "Kochi, Kerala": { lat: 9.9312, lng: 76.2673 },
  "Munnar, Kerala": { lat: 10.0889, lng: 77.0595 },
  "Thekkady, Kerala": { lat: 9.6031, lng: 77.1673 },
  "Alleppey, Kerala": { lat: 9.4981, lng: 76.3388 },
  "Guruvayur, Kerala": { lat: 10.5945, lng: 76.0416 },
  "Kovalam, Kerala": { lat: 8.4004, lng: 76.9787 },
  "Wayanad, Kerala": { lat: 11.6854, lng: 76.132 },
  "Trivandrum, Kerala": { lat: 8.5241, lng: 76.9366 },
  "Ooty, Tamil Nadu": { lat: 11.4064, lng: 76.6932 },
  "Kodaikanal, Tamil Nadu": { lat: 10.2381, lng: 77.4892 },
  "Coorg, Karnataka": { lat: 12.3375, lng: 75.8069 },
  "Mysore, Karnataka": { lat: 12.2958, lng: 76.6394 },
  "Hampi, Karnataka": { lat: 15.335, lng: 76.46 },
  Pondicherry: { lat: 11.9139, lng: 79.8145 },
  "Madurai, Tamil Nadu": { lat: 9.9252, lng: 78.1198 },
  "Rameswaram, Tamil Nadu": { lat: 9.2876, lng: 79.3129 },
  "Kanyakumari, Tamil Nadu": { lat: 8.0883, lng: 77.5385 },
  Goa: { lat: 15.2993, lng: 74.124 },
  "Mumbai, Maharashtra": { lat: 19.076, lng: 72.8777 },
  "Pune, Maharashtra": { lat: 18.5204, lng: 73.8567 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  "Agra, Uttar Pradesh": { lat: 27.1767, lng: 78.0081 },
  "Jaipur, Rajasthan": { lat: 26.9124, lng: 75.7873 },
  "Udaipur, Rajasthan": { lat: 24.5854, lng: 73.7125 },
  "Jodhpur, Rajasthan": { lat: 26.2389, lng: 73.0243 },
  "Varanasi, Uttar Pradesh": { lat: 25.3176, lng: 82.9739 },
  "Rishikesh, Uttarakhand": { lat: 30.0869, lng: 78.2676 },
  "Manali, Himachal Pradesh": { lat: 32.2432, lng: 77.1892 },
  "Shimla, Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Amritsar, Punjab": { lat: 31.634, lng: 74.8723 },
  "Kolkata, West Bengal": { lat: 22.5726, lng: 88.3639 },
  "Darjeeling, West Bengal": { lat: 27.041, lng: 88.2663 },
  "Andaman Islands": { lat: 11.7401, lng: 92.6586 },
  "Shirdi, Maharashtra": { lat: 19.7645, lng: 74.4769 },
  "Mayiladuthurai, Tamil Nadu": { lat: 11.1085, lng: 79.6533 },
  "Suryanar Kovil, Tamil Nadu": { lat: 11.087, lng: 79.7194 },
  "Thingalur, Tamil Nadu": { lat: 11.05, lng: 79.6167 },
  "Vaitheeswaran Koil, Tamil Nadu": { lat: 11.1667, lng: 79.65 },
  "Thiruvenkadu, Tamil Nadu": { lat: 11.1706, lng: 79.6472 },
  "Kanjanur, Tamil Nadu": { lat: 11.0333, lng: 79.65 },
  "Thirunallar, Tamil Nadu": { lat: 10.9333, lng: 79.65 },
  "Keezhaperumpallam, Tamil Nadu": { lat: 11.2167, lng: 79.85 },
  "Thirunageswaram, Tamil Nadu": { lat: 10.9833, lng: 79.4167 },
  "Alangudi, Tamil Nadu": { lat: 10.4833, lng: 79.2 },
  "Shani Shingnapur, Maharashtra": { lat: 19.6, lng: 74.5833 },

  // South India — added alongside the pan-India expansion of indiaDestinations
  "Varkala, Kerala": { lat: 8.7379, lng: 76.7163 },
  "Vagamon, Kerala": { lat: 9.6871, lng: 76.9856 },
  "Bekal, Kerala": { lat: 12.3958, lng: 75.0339 },
  "Sabarimala, Kerala": { lat: 9.4326, lng: 77.0813 },
  "Kanchipuram, Tamil Nadu": { lat: 12.8342, lng: 79.7036 },
  "Chidambaram, Tamil Nadu": { lat: 11.3994, lng: 79.6942 },
  "Thanjavur, Tamil Nadu": { lat: 10.787, lng: 79.1378 },
  "Kumbakonam, Tamil Nadu": { lat: 10.9601, lng: 79.3788 },
  "Palani, Tamil Nadu": { lat: 10.4494, lng: 77.5178 },
  "Srirangam, Tamil Nadu": { lat: 10.8624, lng: 78.6928 },
  "Velankanni, Tamil Nadu": { lat: 10.6811, lng: 79.8449 },
  "Yercaud, Tamil Nadu": { lat: 11.7753, lng: 78.2094 },
  "Coonoor, Tamil Nadu": { lat: 11.353, lng: 76.7959 },
  "Sringeri, Karnataka": { lat: 13.4167, lng: 75.25 },
  "Udupi, Karnataka": { lat: 13.3409, lng: 74.7421 },
  "Dharmasthala, Karnataka": { lat: 12.9575, lng: 75.3833 },
  "Chikmagalur, Karnataka": { lat: 13.3161, lng: 75.772 },
  "Gokarna, Karnataka": { lat: 14.5479, lng: 74.3188 },
  "Belur, Karnataka": { lat: 13.1629, lng: 75.8648 },
  "Srikalahasti, Andhra Pradesh": { lat: 13.75, lng: 79.7 },
  "Vijayawada, Andhra Pradesh": { lat: 16.5062, lng: 80.648 },
  "Srisailam, Andhra Pradesh": { lat: 16.0739, lng: 78.8687 },
  "Amaravati, Andhra Pradesh": { lat: 16.513, lng: 80.5165 },
  "Visakhapatnam, Andhra Pradesh": { lat: 17.6868, lng: 83.2185 },
  "Araku Valley, Andhra Pradesh": { lat: 18.3269, lng: 82.877 },
  "Yadagirigutta, Telangana": { lat: 17.5833, lng: 78.95 },

  // West India
  "Nashik, Maharashtra": { lat: 20.0059, lng: 73.791 },
  "Pandharpur, Maharashtra": { lat: 17.6792, lng: 75.3324 },
  "Lonavala, Maharashtra": { lat: 18.7546, lng: 73.4062 },
  "Mahabaleshwar, Maharashtra": { lat: 17.9307, lng: 73.6477 },
  "Aurangabad, Maharashtra": { lat: 19.8762, lng: 75.3433 },
  "Ahmedabad, Gujarat": { lat: 23.0225, lng: 72.5714 },
  "Dwarka, Gujarat": { lat: 22.2442, lng: 68.9685 },
  "Somnath, Gujarat": { lat: 20.888, lng: 70.4013 },
  "Rann of Kutch, Gujarat": { lat: 23.7337, lng: 69.8597 },
  Diu: { lat: 20.7144, lng: 70.9874 },

  // North India
  "Pushkar, Rajasthan": { lat: 26.4899, lng: 74.5511 },
  "Ajmer, Rajasthan": { lat: 26.4499, lng: 74.6399 },
  "Nathdwara, Rajasthan": { lat: 24.9333, lng: 73.8167 },
  "Ranthambore, Rajasthan": { lat: 26.0173, lng: 76.5026 },
  "Mount Abu, Rajasthan": { lat: 24.5926, lng: 72.7156 },
  "Jaisalmer, Rajasthan": { lat: 26.9157, lng: 70.9083 },
  "Bikaner, Rajasthan": { lat: 28.0229, lng: 73.3119 },
  "Chittorgarh, Rajasthan": { lat: 24.8887, lng: 74.6269 },
  "Mathura, Uttar Pradesh": { lat: 27.4924, lng: 77.6737 },
  "Vrindavan, Uttar Pradesh": { lat: 27.5806, lng: 77.7006 },
  "Ayodhya, Uttar Pradesh": { lat: 26.7922, lng: 82.1998 },
  "Prayagraj, Uttar Pradesh": { lat: 25.4358, lng: 81.8463 },
  "Lucknow, Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  "Khajuraho, Madhya Pradesh": { lat: 24.8318, lng: 79.9199 },
  "Bhopal, Madhya Pradesh": { lat: 23.2599, lng: 77.4126 },
  "Gwalior, Madhya Pradesh": { lat: 26.2183, lng: 78.1828 },
  "Ujjain, Madhya Pradesh": { lat: 23.1765, lng: 75.7885 },
  "Omkareshwar, Madhya Pradesh": { lat: 22.2412, lng: 76.1517 },
  "Pachmarhi, Madhya Pradesh": { lat: 22.4675, lng: 78.4336 },
  "Amarkantak, Madhya Pradesh": { lat: 22.6725, lng: 81.7539 },
  "Haridwar, Uttarakhand": { lat: 29.9457, lng: 78.1642 },
  "Dehradun, Uttarakhand": { lat: 30.3165, lng: 78.0322 },
  "Nainital, Uttarakhand": { lat: 29.3803, lng: 79.4636 },
  "Mussoorie, Uttarakhand": { lat: 30.4598, lng: 78.0664 },
  "Jim Corbett National Park, Uttarakhand": { lat: 29.53, lng: 78.7747 },
  "Badrinath, Uttarakhand": { lat: 30.7433, lng: 79.4938 },
  "Kedarnath, Uttarakhand": { lat: 30.7346, lng: 79.0669 },
  "Gangotri, Uttarakhand": { lat: 30.9946, lng: 78.9398 },
  "Yamunotri, Uttarakhand": { lat: 31.01, lng: 78.45 },
  "Vaishno Devi, Jammu and Kashmir": { lat: 33.0303, lng: 74.9495 },
  "Amarnath, Jammu and Kashmir": { lat: 34.2163, lng: 75.5 },
  "Srinagar, Jammu and Kashmir": { lat: 34.0837, lng: 74.7973 },
  "Gulmarg, Jammu and Kashmir": { lat: 34.0484, lng: 74.3805 },
  "Pahalgam, Jammu and Kashmir": { lat: 34.0161, lng: 75.3237 },
  "Leh, Ladakh": { lat: 34.1526, lng: 77.5771 },

  // East & Northeast India
  "Bodh Gaya, Bihar": { lat: 24.6959, lng: 84.9911 },
  "Patna, Bihar": { lat: 25.5941, lng: 85.1376 },
  "Gaya, Bihar": { lat: 24.7955, lng: 84.9994 },
  "Puri, Odisha": { lat: 19.8135, lng: 85.8312 },
  "Bhubaneswar, Odisha": { lat: 20.2961, lng: 85.8245 },
  "Konark, Odisha": { lat: 19.8876, lng: 86.0945 },
  "Gangtok, Sikkim": { lat: 27.3389, lng: 88.6065 },
  "Shillong, Meghalaya": { lat: 25.5788, lng: 91.8933 },
  "Guwahati, Assam": { lat: 26.1445, lng: 91.7362 },
  "Kaziranga, Assam": { lat: 26.5775, lng: 93.1714 },

  // Islands
  "Havelock Island, Andaman": { lat: 12.0186, lng: 92.9721 },
  Lakshadweep: { lat: 10.5667, lng: 72.6417 },
};

// Hand-verified private car distances/times for the routes travellers ask
// about most. Anything not listed here falls back to the Haversine estimate.
// Order doesn't matter — `getRoute` checks both directions.
const KNOWN_ROUTES = [
  { from: "Chennai, Tamil Nadu", to: "Tirupati, Andhra Pradesh", km: 140, hours: 3.5 },
  { from: "Chennai, Tamil Nadu", to: "Kanyakumari, Tamil Nadu", km: 705, hours: 13 },
  { from: "Kanyakumari, Tamil Nadu", to: "Trivandrum, Kerala", km: 90, hours: 1.5 },
  { from: "Tirupati, Andhra Pradesh", to: "Kanyakumari, Tamil Nadu", km: 750, hours: 13.5 },
  { from: "Madurai, Tamil Nadu", to: "Rameswaram, Tamil Nadu", km: 170, hours: 3 },
  { from: "Chennai, Tamil Nadu", to: "Madurai, Tamil Nadu", km: 460, hours: 8 },
  { from: "Chennai, Tamil Nadu", to: "Bangalore, Karnataka", km: 345, hours: 6 },
  { from: "Chennai, Tamil Nadu", to: "Pondicherry", km: 170, hours: 3 },
  { from: "Tirupati, Andhra Pradesh", to: "Bangalore, Karnataka", km: 250, hours: 5 },
  { from: "Madurai, Tamil Nadu", to: "Kanyakumari, Tamil Nadu", km: 240, hours: 5 },
  { from: "Madurai, Tamil Nadu", to: "Kodaikanal, Tamil Nadu", km: 120, hours: 3.5 },
  { from: "Trivandrum, Kerala", to: "Kochi, Kerala", km: 200, hours: 4 },
  { from: "Kochi, Kerala", to: "Munnar, Kerala", km: 130, hours: 4 },
  { from: "Munnar, Kerala", to: "Thekkady, Kerala", km: 85, hours: 2.5 },
  { from: "Thekkady, Kerala", to: "Alleppey, Kerala", km: 140, hours: 4 },
  { from: "Alleppey, Kerala", to: "Kochi, Kerala", km: 55, hours: 1.5 },
  { from: "Bangalore, Karnataka", to: "Mysore, Karnataka", km: 145, hours: 3 },
  { from: "Bangalore, Karnataka", to: "Ooty, Tamil Nadu", km: 265, hours: 6 },
];

function normalize(city) {
  return String(city || "").trim().toLowerCase();
}

const knownRouteLookup = new Map();
KNOWN_ROUTES.forEach((route) => {
  const key = [normalize(route.from), normalize(route.to)].sort().join("|");
  knownRouteLookup.set(key, route);
});

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return R * 2 * Math.asin(Math.sqrt(h));
}

const ROAD_WINDING_FACTOR = 1.3;
const AVERAGE_SPEED_KMH = 55;

/**
 * Returns { km, hours, estimated } for a car route between two cities, or
 * null if neither a known route nor coordinates for both cities exist.
 */
export function getRoute(cityA, cityB) {
  const a = String(cityA || "").trim();
  const b = String(cityB || "").trim();
  if (!a || !b || normalize(a) === normalize(b)) return null;

  const key = [normalize(a), normalize(b)].sort().join("|");
  const known = knownRouteLookup.get(key);
  if (known) {
    return { km: known.km, hours: known.hours, estimated: false };
  }

  const coordsA = cityCoordinates[a];
  const coordsB = cityCoordinates[b];
  if (!coordsA || !coordsB) return null;

  const km = Math.round(haversineKm(coordsA, coordsB) * ROAD_WINDING_FACTOR);
  const hours = km / AVERAGE_SPEED_KMH;
  return { km, hours, estimated: true };
}

export function formatDuration(hours) {
  if (hours == null) return "";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatRoute(route) {
  if (!route) return "Distance available on request";
  return `${route.km} km · ${formatDuration(route.hours)}`;
}
