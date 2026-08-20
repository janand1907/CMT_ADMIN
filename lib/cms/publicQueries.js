// Server-side only. Every function here reads through the anon-key client
// (lib/supabase/anon.js) — the same pattern app/quote/[token]/page.js already
// uses for public routes — never the service-role client, so table RLS (see
// supabase/migrations/20260821090000_phase6_public_read_rls.sql) is the real
// security boundary, not application code. Every query is scoped to
// published/active rows only; there is no "show everything" path here.

import { createAnonClient } from "@/lib/supabase/anon";

// Collects every media id referenced anywhere in a set of page_sections' JSON
// `content`, across both direct fields (e.g. hero.image_media_id) and nested
// items_json arrays (e.g. three_column_cards[].image_media_id) — batched into
// one media query per page render instead of one query per image, per §19's
// "avoid duplicate/repeated queries" instruction.
function collectMediaIds(sections) {
  const ids = new Set();
  for (const section of sections) {
    const content = section.content || {};
    if (content.image_media_id) ids.add(content.image_media_id);
    for (const value of Object.values(content)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === "object" && item.media_id) ids.add(item.media_id);
          if (item && typeof item === "object" && item.image_media_id) ids.add(item.image_media_id);
        }
      }
    }
  }
  return [...ids];
}

async function fetchMediaMap(supabase, ids) {
  if (ids.length === 0) return {};
  const { data } = await supabase.from("media").select("id, storage_path, alt_text").in("id", ids);
  return Object.fromEntries((data || []).map((m) => [m.id, m]));
}

// Returns { page, sections, mediaMap } for the published homepage, or null if
// no homepage is published yet — callers fall back to the existing hardcoded
// homepage in that case, per the master plan's "remain visually stable"
// constraint.
export async function getPublishedHomepage() {
  const supabase = createAnonClient();
  const { data: page } = await supabase
    .from("pages")
    .select("id, title, slug")
    .eq("is_homepage", true)
    .eq("status", "published")
    .maybeSingle();
  if (!page) return null;

  const { data: sections } = await supabase
    .from("page_sections")
    .select("id, block_type, content, enabled, sort_order")
    .eq("page_id", page.id)
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  if (!sections || sections.length === 0) return null;

  const mediaMap = await fetchMediaMap(supabase, collectMediaIds(sections));
  return { page, sections, mediaMap };
}

// Returns { page, sections, mediaMap, seo } for a published, non-homepage page
// by slug, or null (caller renders notFound()). is_homepage rows are excluded
// deliberately — the homepage has its own dedicated path (app/page.js), so
// requesting slug "home" through the generic route must 404, not double-render.
export async function getPublishedPageBySlug(slug) {
  const supabase = createAnonClient();
  const { data: page } = await supabase
    .from("pages")
    .select("id, title, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_homepage", false)
    .maybeSingle();
  if (!page) return null;

  const [{ data: sections }, { data: seo }] = await Promise.all([
    supabase
      .from("page_sections")
      .select("id, block_type, content, enabled, sort_order")
      .eq("page_id", page.id)
      .eq("enabled", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("seo_metadata")
      .select("seo_title, meta_description, canonical_url, og_title, og_description, indexable, og_image:media(storage_path)")
      .eq("entity_type", "page")
      .eq("entity_id", page.id)
      .maybeSingle(),
  ]);

  const mediaMap = await fetchMediaMap(supabase, collectMediaIds(sections || []));
  return { page, sections: sections || [], mediaMap, seo };
}

// Slug + updated_at for every published, non-homepage page — for app/sitemap.js.
// Not exposed via a route itself, so no seo/content fetching here.
export async function getPublishedPageSlugs() {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("status", "published")
    .eq("is_homepage", false);
  return data || [];
}

// Every published post, newest first — for the blog listing page.
export async function getPublishedBlogPosts() {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, published_at, category:blog_categories(name, slug), featured_media:media(storage_path, alt_text)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data || [];
}

// A single published post by slug, with category/tags/SEO — or null (404).
export async function getPublishedBlogPostBySlug(slug) {
  const supabase = createAnonClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, body, published_at, category:blog_categories(name, slug), featured_media:media(storage_path, alt_text), tags:blog_post_tags(tag:blog_tags(name, slug))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!post) return null;

  const { data: seo } = await supabase
    .from("seo_metadata")
    .select("seo_title, meta_description, canonical_url, og_title, og_description, indexable, og_image:media(storage_path)")
    .eq("entity_type", "blog_post")
    .eq("entity_id", post.id)
    .maybeSingle();

  return { post, seo };
}

export async function getFaqs() {
  const supabase = createAnonClient();
  const { data } = await supabase.from("faqs").select("id, question, answer, category").order("sort_order", { ascending: true });
  return data || [];
}

export async function getActiveTestimonials() {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, customer_name, review, rating, image:media(storage_path, alt_text)")
    .eq("status", "active")
    .order("sort_order", { ascending: true });
  return data || [];
}

// Active AND within its start/end date window — the same "effective state"
// computation the admin banner list already displays (BannersList.jsx), kept
// here rather than in RLS so both stay in sync in one place.
export async function getActiveBanners() {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("banners")
    .select("id, heading, description, cta_text, cta_link, start_date, end_date, image:media(storage_path, alt_text)")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  const today = new Date().toISOString().slice(0, 10);
  return (data || []).filter((b) => (!b.start_date || b.start_date <= today) && (!b.end_date || b.end_date >= today));
}

// A menu by location ("header" | "footer" | "custom"), nested one level
// (parent/children) and reshaped to exactly the { href, label, children }
// shape data/nav.js's navLinks/footerQuickLinks already use — so Navbar/Footer
// need no rendering-logic changes, only a data-source swap. Returns null if
// that location has no menu defined (or it has no items) yet, so callers fall
// back to the existing static links, per "remain visually stable during
// migration." open_in_new_tab is captured but not yet wired into
// Navbar/NavDropdown/MobileMenu's <Link> rendering — a documented, minor gap,
// not a silent drop (see CONNECTMYTOURS_STATUS.md).
export async function getMenuByLocation(location) {
  const supabase = createAnonClient();
  const { data: menu } = await supabase.from("menus").select("id, name, location").eq("location", location).maybeSingle();
  if (!menu) return null;

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, parent_id, label, url, open_in_new_tab, sort_order")
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });
  if (!items || items.length === 0) return null;

  const topLevel = items.filter((i) => !i.parent_id);
  const childrenByParent = items.reduce((acc, i) => {
    if (i.parent_id) (acc[i.parent_id] ||= []).push(i);
    return acc;
  }, {});

  return topLevel.map((item) => ({
    href: item.url,
    label: item.label,
    openInNewTab: item.open_in_new_tab,
    children: (childrenByParent[item.id] || []).map((child) => ({
      href: child.url,
      label: child.label,
      openInNewTab: child.open_in_new_tab,
    })),
  }));
}
