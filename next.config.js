/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
