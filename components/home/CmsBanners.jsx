import Link from "next/link";
import Image from "next/image";
import { getActiveBanners } from "@/lib/cms/publicQueries";
import { getMediaUrl } from "@/lib/media";

// Phase 6: renders CMS-managed banners (master plan §8 Banners) that are
// active and within their start/end date window. The master plan doesn't
// specify a placement, so this is a deliberate, minimal, reversible judgment
// call — a slim promotional strip at the top of the homepage, a standard
// pattern for this content type. Renders nothing when no banner qualifies
// (there are none in the seed data), so this is invisible today and only
// starts showing once an admin actually publishes one.
export default async function CmsBanners() {
  const banners = await getActiveBanners();
  if (banners.length === 0) return null;

  return (
    <div className="divide-y divide-white/10">
      {banners.map((banner) => {
        const content = (
          <div className="relative flex items-center justify-center gap-3 bg-primary-800 px-4 py-2.5 text-center text-sm text-white">
            {banner.image?.storage_path && (
              <span className="relative hidden h-6 w-10 shrink-0 overflow-hidden rounded sm:block">
                <Image src={getMediaUrl(banner.image.storage_path)} alt={banner.image.alt_text || ""} fill className="object-cover" />
              </span>
            )}
            <span className="font-medium">{banner.heading}</span>
            {banner.description && <span className="hidden text-white/80 sm:inline">— {banner.description}</span>}
            {banner.cta_text && <span className="font-semibold underline">{banner.cta_text}</span>}
          </div>
        );
        return banner.cta_link ? (
          <Link key={banner.id} href={banner.cta_link} className="block hover:bg-primary-700">
            {content}
          </Link>
        ) : (
          <div key={banner.id}>{content}</div>
        );
      })}
    </div>
  );
}
