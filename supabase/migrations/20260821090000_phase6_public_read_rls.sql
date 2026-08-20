-- Phase 6 — Website Integration: public (anon) read access
-- The public site must read CMS/media content directly via the anon-key client
-- (see lib/supabase/anon.js — the same pattern app/quote/[token]/page.js already
-- uses), never via the service-role client. Every Phase 5 CMS table currently
-- only has `to authenticated` policies (staff-only), so anon SELECT is denied by
-- default — these are new, additive `to anon` policies scoped to exactly what's
-- safe to expose (published/active rows only), never touching or replacing the
-- existing authenticated policies. No table/column changes; RLS only.
-- Scope is exactly master plan §15 Phase 6, minus Packages/Destinations (see
-- CONNECTMYTOURS_STATUS.md — explicitly deferred pending a departure-city data
-- model decision that is out of scope for this migration).

-- =============================================================================
-- PAGES / PAGE BUILDER
-- =============================================================================

create policy "pages_select_public" on public.pages
  for select to anon
  using (status = 'published');

comment on policy "pages_select_public" on public.pages is
  'Public site read access — published pages only. Draft/archived pages are
  invisible to anon, matching admin preview-before-publish expectations.';

-- page_sections has no status of its own; gate on the parent page''s publish
-- state via EXISTS, same pattern as every other child-of-a-published-parent
-- policy in this codebase. enabled=false sections are still readable here (an
-- admin might reasonably want a published page with a temporarily-hidden
-- section) — the public renderer filters enabled=true, keeping "is this
-- visible to anon at all" (RLS) separate from "should this section currently
-- render" (application query), the same split already used for banners'
-- date-window filtering.
create policy "page_sections_select_public" on public.page_sections
  for select to anon
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_sections.page_id and p.status = 'published'
    )
  );

-- page_versions (revision history) is never exposed publicly — no policy added.

-- =============================================================================
-- BLOG
-- =============================================================================

create policy "blog_posts_select_public" on public.blog_posts
  for select to anon
  using (status = 'published');

-- Categories/tags are reference labels, not content — readable regardless of
-- which posts they're attached to (same reasoning whatsapp_templates uses for
-- staff-wide read access to shared reference data).
create policy "blog_categories_select_public" on public.blog_categories
  for select to anon
  using (true);

create policy "blog_tags_select_public" on public.blog_tags
  for select to anon
  using (true);

create policy "blog_post_tags_select_public" on public.blog_post_tags
  for select to anon
  using (
    exists (
      select 1 from public.blog_posts bp
      where bp.id = blog_post_tags.blog_post_id and bp.status = 'published'
    )
  );

-- =============================================================================
-- FAQS
-- No status/enabled column exists on this table at all (master plan §8 lists
-- only create/edit/delete/ordering/category for FAQs — no draft state, per
-- Phase 5's own documented design decision), so every row is public once RLS
-- permits it.
-- =============================================================================

create policy "faqs_select_public" on public.faqs
  for select to anon
  using (true);

-- =============================================================================
-- TESTIMONIALS
-- =============================================================================

create policy "testimonials_select_public" on public.testimonials
  for select to anon
  using (status = 'active');

-- =============================================================================
-- BANNERS
-- start_date/end_date scheduling window is enforced in the application query
-- (public.now()-based RLS predicates would work but would silently diverge
-- from the admin's own "effective state" display logic — computing it in one
-- place, the query layer, keeps both in sync), matching status is the security
-- boundary here.
-- =============================================================================

create policy "banners_select_public" on public.banners
  for select to anon
  using (status = 'active');

-- =============================================================================
-- MENUS / MENU_ITEMS
-- Navigation structure is not sensitive.
-- =============================================================================

create policy "menus_select_public" on public.menus
  for select to anon
  using (true);

create policy "menu_items_select_public" on public.menu_items
  for select to anon
  using (true);

-- =============================================================================
-- MEDIA
-- Public pages need to resolve storage_path for images referenced by published
-- CMS content (featured images, OG images, block images, banner images, etc.)
-- via a join — the actual image bytes are already served by a public Storage
-- bucket policy (proven by app/quote/[token]/page.js, an existing unauthenticated
-- route, already calling getMediaUrl() successfully), so this only opens the
-- metadata row, not any new data class.
-- =============================================================================

create policy "media_select_public" on public.media
  for select to anon
  using (true);

-- =============================================================================
-- SEO_METADATA
-- Needed so public pages can read title/description/OG/canonical/indexable for
-- whichever page/blog_post they're rendering. Deliberately NOT `using (true)` —
-- entity_type is polymorphic (package/destination/page/blog_post) and an
-- unconditional policy would leak a draft page's or unpublished post's SEO
-- title/description to anon before it's meant to be visible. Scoped per
-- entity_type to only the entities anon can already see above; package/
-- destination rows stay inaccessible to anon entirely (that integration is
-- deferred — see CONNECTMYTOURS_STATUS.md).
-- =============================================================================

create policy "seo_metadata_select_public" on public.seo_metadata
  for select to anon
  using (
    (entity_type = 'page' and exists (
      select 1 from public.pages p where p.id = seo_metadata.entity_id and p.status = 'published'
    ))
    or (entity_type = 'blog_post' and exists (
      select 1 from public.blog_posts bp where bp.id = seo_metadata.entity_id and bp.status = 'published'
    ))
  );
