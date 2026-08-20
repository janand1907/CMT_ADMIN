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
  // Phase 8: conservative, well-understood headers only — no CSP. This app has
  // no existing CSP baseline, and getting one right (next/image, Tailwind's
  // injected styles, any future embeds like the Google Maps placeholder on
  // /contact-us) needs page-by-page verification a first pass can't safely
  // claim. Wrong headers here are enforced by every browser on every request,
  // so the conservative set is the correct scope for this pass, not the full one.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
