import { notFound } from "next/navigation";
import { getPublishedPageBySlug } from "@/lib/cms/publicQueries";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import { getMediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

// Phase 6: generic renderer for CMS-managed pages (master plan §8 Pages —
// About, Contact, Privacy Policy, destination/service/landing pages, etc.).
// A literal static route (e.g. app/about-us/page.js) always wins over this
// dynamic segment for the same path in Next.js's router, so existing
// hardcoded pages are completely unaffected by this route existing — it only
// ever serves slugs with no matching static folder. Unpublished pages and the
// homepage singleton (slug "home", which has its own dedicated app/page.js)
// both 404 here by design, never render as a blank/placeholder page.
// See app/page.js — same build-time-caching concern; also relevant here since
// Next's fetch Data Cache can otherwise cache a given slug's Supabase reads
// indefinitely even though the route itself renders per-request.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const result = await getPublishedPageBySlug(params.slug);
  if (!result) return {};

  const { page, seo } = result;
  return pageMetadata(`/${page.slug}`, {
    title: seo?.seo_title || page.title,
    description: seo?.meta_description,
    canonical: seo?.canonical_url,
    ogTitle: seo?.og_title,
    ogDescription: seo?.og_description,
    image: seo?.og_image?.storage_path ? getMediaUrl(seo.og_image.storage_path) : undefined,
    noindex: seo?.indexable === false,
  });
}

export default async function CmsPage({ params }) {
  const result = await getPublishedPageBySlug(params.slug);
  if (!result) notFound();

  const { page, sections, mediaMap } = result;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title, href: `/${page.slug}` }]} />
      <BlockRenderer sections={sections} mediaMap={mediaMap} />
    </>
  );
}
