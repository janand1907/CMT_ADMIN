// Shared across the media library, package images, and every SEO/OG-image
// picker — keeps bucket layout and validation rules in one place instead of
// duplicating them per admin route. Must stay in sync with the `area` check
// constraint on public.media in supabase/migrations/20260817160000_phase2_inventory.sql.

export const MEDIA_AREAS = ["packages", "destinations", "banners", "blog", "gallery", "pages"];

export const MEDIA_AREA_LABELS = {
  packages: "Packages",
  destinations: "Destinations",
  banners: "Banners",
  blog: "Blog",
  gallery: "Gallery",
  pages: "Pages",
};

export const ALLOWED_MEDIA_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export const MAX_MEDIA_SIZE_BYTES = 8 * 1024 * 1024;

export function getMediaUrl(storagePath) {
  if (!storagePath) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
