import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { getPublishedBlogPosts } from "@/lib/cms/publicQueries";
import { getMediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/blog", {
  title: "Travel Blog | Connect My Tours",
  description: "Tips, guides, and stories for planning your Tirupati pilgrimage and South India travel.",
});

// See app/page.js — same build-time-caching concern for CMS-driven content.
export const revalidate = 60;

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
];

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">Blog</h1>

        {posts.length === 0 ? (
          <p className="mt-8 text-neutral-500">No articles published yet — check back soon.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {post.featured_media?.storage_path && (
                  <div className="relative aspect-video">
                    <Image
                      src={getMediaUrl(post.featured_media.storage_path)}
                      alt={post.featured_media.alt_text || post.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.category?.name && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{post.category.name}</p>
                  )}
                  <h2 className="mt-1 font-display text-lg font-semibold text-primary-900">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 text-sm text-neutral-600">{post.excerpt}</p>}
                  {post.published_at && (
                    <p className="mt-3 text-xs text-neutral-400">{new Date(post.published_at).toLocaleDateString("en-IN")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
