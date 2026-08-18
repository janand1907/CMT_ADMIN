/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Admin pages are all dynamically rendered (cookies() for auth) and mutated via Server
    // Actions. The client Router Cache's default 30s staleTime for dynamic segments reuses a
    // cached RSC payload on Link-based back-navigation even after revalidatePath ran server-side,
    // showing pre-save data. Disable it so admin navigation always refetches.
    staleTimes: { dynamic: 0 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/kerala/itinerary-planner",
        destination: "/itinerary-planner",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
