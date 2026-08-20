import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactCTA from "@/components/home/ContactCTA";
import { getPublishedBlogPostBySlug } from "@/lib/cms/publicQueries";
import { getMediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

// See app/[slug]/page.js — same Data Cache freshness concern.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const result = await getPublishedBlogPostBySlug(params.slug);
  if (!result) return {};

  const { post, seo } = result;
  return pageMetadata(`/blog/${post.slug}`, {
    title: seo?.seo_title || post.title,
    description: seo?.meta_description || post.excerpt,
    canonical: seo?.canonical_url,
    ogTitle: seo?.og_title,
    ogDescription: seo?.og_description,
    image: seo?.og_image?.storage_path
      ? getMediaUrl(seo.og_image.storage_path)
      : post.featured_media?.storage_path
        ? getMediaUrl(post.featured_media.storage_path)
        : undefined,
    noindex: seo?.indexable === false,
  });
}

export default async function BlogPostPage({ params }) {
  const result = await getPublishedBlogPostBySlug(params.slug);
  if (!result) notFound();

  const { post } = result;
  const tags = (post.tags || []).map((t) => t.tag).filter(Boolean);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title, href: `/blog/${post.slug}` }]}
      />
      <article className="container-page max-w-3xl py-10">
        {post.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{post.category.name}</p>
        )}
        <h1 className="mt-1 font-display text-3xl font-bold text-primary-900 sm:text-4xl">{post.title}</h1>
        {post.published_at && (
          <p className="mt-2 text-sm text-neutral-400">{new Date(post.published_at).toLocaleDateString("en-IN")}</p>
        )}

        {post.featured_media?.storage_path && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl">
            <Image
              src={getMediaUrl(post.featured_media.storage_path)}
              alt={post.featured_media.alt_text || post.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
            />
          </div>
        )}

        <div className="mt-6 whitespace-pre-wrap text-neutral-700">{post.body}</div>

        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.slug} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </article>
      <ContactCTA />
    </>
  );
}
