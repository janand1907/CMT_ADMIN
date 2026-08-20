// Derived at build time so this isn't hardcoded to one Supabase project — matches
// the getMediaUrl() helper's own URL shape (lib/media.js) exactly.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

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
    // Phase 6: public pages render CMS/Storage-hosted images (getMediaUrl()) via
    // next/image, which requires every remote host to be allow-listed explicitly.
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
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
