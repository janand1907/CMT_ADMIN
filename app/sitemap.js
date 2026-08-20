import { siteConfig } from "@/config/site";
import { seoConfig } from "@/data/seo.config";
import { getPublishedPageSlugs, getPublishedBlogPosts } from "@/lib/cms/publicQueries";

// Phase 6: the static seoConfig routes are unaffected; CMS-driven routes
// (published pages by slug, /blog + published posts) are appended so they're
// discoverable even though they have no entry in data/seo.config.js.
export default async function sitemap() {
  const lastModified = new Date();

  const staticEntries = Object.keys(seoConfig).map((pathname) => ({
    url: `${siteConfig.domain}${pathname === "/" ? "" : pathname}`,
    lastModified,
  }));

  const [cmsPages, blogPosts] = await Promise.all([getPublishedPageSlugs(), getPublishedBlogPosts()]);

  const cmsPageEntries = cmsPages.map((page) => ({
    url: `${siteConfig.domain}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : lastModified,
  }));

  const blogEntries = [
    { url: `${siteConfig.domain}/blog`, lastModified },
    ...blogPosts.map((post) => ({
      url: `${siteConfig.domain}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : lastModified,
    })),
  ];

  return [...staticEntries, ...cmsPageEntries, ...blogEntries];
}
