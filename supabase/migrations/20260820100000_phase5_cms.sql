-- Phase 5 — CMS
-- Pages + Page Builder (block-based sections, revisions/rollback), Blog (posts,
-- categories, tags), FAQs, Testimonials, Banners, Navigation Menus. Reuses Phase 2's
-- `media` (area constraint extended) and `seo_metadata` (entity_type constraint
-- extended) rather than duplicating media/SEO infrastructure, per master plan §9's own
-- comment on seo_metadata anticipating exactly this extension.
-- Depends on Phase 0 (has_permission, set_updated_at, roles incl. 'Content Manager'
-- already seeded); Phase 2 (media, seo_metadata).
-- Scope is exactly master plan §8 CMS, §9 CMS/Media&SEO tables, §10 Content Manager
-- role, §11 SEO/Media, §15 Phase 5 — no Phase 6 (public website integration).

-- =============================================================================
-- EXTEND SHARED PHASE 2 INFRASTRUCTURE
-- =============================================================================

alter table public.media drop constraint media_area_check;
alter table public.media add constraint media_area_check
  check (area in ('packages', 'destinations', 'banners', 'blog', 'gallery', 'pages', 'testimonials'));

alter table public.seo_metadata drop constraint seo_metadata_entity_type_check;
alter table public.seo_metadata add constraint seo_metadata_entity_type_check
  check (entity_type in ('package', 'destination', 'page', 'blog_post'));

-- =============================================================================
-- PAGES + PAGE BUILDER
-- =============================================================================

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_homepage boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The seeded homepage singleton is the site's front door — it can be unpublished
  -- while work is in progress, but never archived out from under the live site.
  constraint pages_homepage_not_archived check (not is_homepage or status != 'archived')
);

comment on table public.pages is
  'CMS-managed pages (master plan §8: About, Contact, Privacy Policy, Terms, '
  'Cancellation Policy, destination/service/landing pages) plus the homepage '
  '(is_homepage=true, exactly one row, seeded below) — "Homepage Sections" in the '
  'admin nav is this same Page Builder pointed at that one row, not a separate '
  'system. Content lives in page_sections, not here — this row is identity/status/SEO '
  'only, mirroring how packages/destinations separate identity from their sub-tables.';

-- Exactly one homepage row.
create unique index pages_one_homepage_idx on public.pages(is_homepage) where is_homepage;
create index pages_status_idx on public.pages(status);

create trigger set_pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  block_type text not null check (block_type in (
    'hero', 'rich_text', 'image', 'image_text', 'two_column', 'three_column_cards',
    'package_listing', 'destination_listing', 'cta', 'banner', 'gallery', 'testimonials',
    'faq', 'statistics', 'features', 'video', 'contact_form', 'whatsapp_cta', 'custom_html'
  )),
  content jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.page_sections is
  'One row per content block on a page (master plan §8 Page Builder block library). '
  '`content` shape is block_type-specific and validated at the application layer, not '
  'the database — the same "jsonb, app-validated" shape packages.itinerary already '
  'uses. enabled lets a section be hidden without deleting it (Page Builder capability '
  '"enable/disable sections"); sort_order backs manual reorder (up/down, not a drag '
  'library — see Page Builder UI).';

create index page_sections_page_id_idx on public.page_sections(page_id, sort_order);

create trigger set_page_sections_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

create table public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  version_number int not null check (version_number > 0),
  title text not null,
  status text not null,
  sections jsonb not null default '[]'::jsonb,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint page_versions_unique_number unique (page_id, version_number)
);

comment on table public.page_versions is
  'Immutable snapshot history (master plan §8 "save revisions, rollback to previous '
  'version") — append-only, matching lead_activities/audit_logs. `sections` is a full '
  'array snapshot of page_sections at save time; rollback (application code, not a DB '
  'function — see savePageVersion/rollbackPageVersion actions) replaces the live '
  'page_sections rows with a version''s snapshot rather than mutating history.';

create index page_versions_page_id_idx on public.page_versions(page_id, version_number desc);

-- =============================================================================
-- BLOG
-- =============================================================================

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_blog_categories_updated_at
  before update on public.blog_categories
  for each row execute function public.set_updated_at();

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  category_id uuid references public.blog_categories(id) on delete set null,
  excerpt text,
  body text not null default '',
  featured_media_id uuid references public.media(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.blog_posts is
  'master plan §8 Blog: create/edit/draft/publish/categories/tags/featured '
  'image/SEO fields (SEO via shared seo_metadata, entity_type=''blog_post''). '
  'No page-builder blocks here — body is a single rich-text field, matching the '
  'literal §8 field list (only Pages get block-based content).';

create index blog_posts_status_idx on public.blog_posts(status);
create index blog_posts_category_id_idx on public.blog_posts(category_id);

create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table public.blog_post_tags (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (blog_post_id, tag_id)
);

-- =============================================================================
-- FAQS
-- Literal master plan §8 scope: create/edit/delete/ordering/category — no
-- draft/publish tier, and "delete" is real (unlike every soft-deactivate-only
-- entity elsewhere), so this is the one CMS entity with an actual DELETE policy.
-- =============================================================================

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (length(trim(question)) > 0),
  answer text not null check (length(trim(answer)) > 0),
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_category_idx on public.faqs(category);

create trigger set_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TESTIMONIALS
-- =============================================================================

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) > 0),
  review text not null check (length(trim(review)) > 0),
  rating int check (rating between 1 and 5),
  image_media_id uuid references public.media(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_status_idx on public.testimonials(status);

create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- =============================================================================
-- BANNERS
-- =============================================================================

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_media_id uuid references public.media(id) on delete set null,
  heading text,
  description text,
  cta_text text,
  cta_link text,
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  start_date date,
  end_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_date_range check (end_date is null or start_date is null or end_date >= start_date)
);

comment on table public.banners is
  'status defaults to inactive, same "build it, then flip live" pattern as '
  'packages. start_date/end_date are an admin-visible scheduling window (master '
  'plan §8 "Start/end dates") — Phase 5 has no public consumer to enforce the '
  'window against yet (that''s Phase 6), so the admin list computes and displays '
  'an effective Live/Scheduled/Expired state from status + these dates.';

create index banners_status_idx on public.banners(status);

create trigger set_banners_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

-- =============================================================================
-- MENUS
-- =============================================================================

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  location text not null default 'custom' check (location in ('header', 'footer', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.menus is
  'master plan §9 lists only a bare "menus" table with no field detail — location '
  'is a minimal, reasonable read (not a literal spec requirement) so header/footer '
  'placement is at least classifiable; not unique per location, since the plan does '
  'not say only one menu may occupy a given location.';

create trigger set_menus_updated_at
  before update on public.menus
  for each row execute function public.set_updated_at();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  parent_id uuid references public.menu_items(id) on delete cascade,
  label text not null check (length(trim(label)) > 0),
  url text not null check (length(trim(url)) > 0),
  open_in_new_tab boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_menu_id_idx on public.menu_items(menu_id, sort_order);
create index menu_items_parent_id_idx on public.menu_items(parent_id);

create trigger set_menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- =============================================================================
-- PUBLISH-PERMISSION TRIGGERS
-- master plan §10's granular-permission example list names "Publish page"
-- specifically (distinct from general page management) — enforced here, not just
-- hidden in the UI, per explicit instruction not to rely on navigation/UI alone.
-- =============================================================================

create function public.enforce_publish_permission()
returns trigger
language plpgsql
as $$
declare
  v_permission_key text;
begin
  if new.status = 'published' and (old is null or old.status is distinct from 'published') then
    v_permission_key := case tg_table_name
      when 'pages' then 'publish_pages'
      when 'blog_posts' then 'publish_blog'
    end;
    if not public.has_permission(v_permission_key) then
      raise exception 'Missing permission % to publish this %', v_permission_key, tg_table_name;
    end if;
  end if;
  return new;
end;
$$;

comment on function public.enforce_publish_permission() is
  'Blocks the specific transition into status=''published'' for whoever holds only '
  'manage_pages/manage_blog but not publish_pages/publish_blog — draft/archive/edit '
  'remain available to them, matching Content Manager''s split in master plan §10.';

create trigger enforce_publish_permission_pages_trg
  before insert or update on public.pages
  for each row execute function public.enforce_publish_permission();

create trigger enforce_publish_permission_blog_posts_trg
  before insert or update on public.blog_posts
  for each row execute function public.enforce_publish_permission();

-- =============================================================================
-- ROW LEVEL SECURITY
-- CMS is a self-contained domain per master plan §10 (Content Manager only —
-- Admin/Manager's own §10 scope is Leads/Customers/Packages/Quotations/Reports/
-- Follow-ups, CMS is not in it, mirrored from Phase 4's identical reasoning for
-- keeping Content Manager out of WhatsApp). Super Admin gets every permission
-- automatically via Phase 0's grant_new_permission_to_super_admin trigger.
-- =============================================================================

alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_versions enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.banners enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;

create policy "pages_select_scoped" on public.pages
  for select to authenticated
  using (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "pages_write_managed" on public.pages
  for all to authenticated
  using (public.has_permission('manage_pages') or public.has_permission('publish_pages'))
  with check (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "page_sections_select_scoped" on public.page_sections
  for select to authenticated
  using (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "page_sections_write_managed" on public.page_sections
  for all to authenticated
  using (public.has_permission('manage_pages') or public.has_permission('publish_pages'))
  with check (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "page_versions_select_scoped" on public.page_versions
  for select to authenticated
  using (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "page_versions_insert_managed" on public.page_versions
  for insert to authenticated
  with check (public.has_permission('manage_pages') or public.has_permission('publish_pages'));

create policy "blog_categories_select_scoped" on public.blog_categories
  for select to authenticated
  using (public.has_permission('manage_blog') or public.has_permission('publish_blog'));

create policy "blog_categories_write_managed" on public.blog_categories
  for all to authenticated
  using (public.has_permission('manage_blog'))
  with check (public.has_permission('manage_blog'));

create policy "blog_tags_select_scoped" on public.blog_tags
  for select to authenticated
  using (public.has_permission('manage_blog') or public.has_permission('publish_blog'));

create policy "blog_tags_write_managed" on public.blog_tags
  for all to authenticated
  using (public.has_permission('manage_blog'))
  with check (public.has_permission('manage_blog'));

create policy "blog_posts_select_scoped" on public.blog_posts
  for select to authenticated
  using (public.has_permission('manage_blog') or public.has_permission('publish_blog'));

create policy "blog_posts_write_managed" on public.blog_posts
  for all to authenticated
  using (public.has_permission('manage_blog') or public.has_permission('publish_blog'))
  with check (public.has_permission('manage_blog') or public.has_permission('publish_blog'));

create policy "blog_post_tags_select_scoped" on public.blog_post_tags
  for select to authenticated
  using (public.has_permission('manage_blog') or public.has_permission('publish_blog'));

create policy "blog_post_tags_write_managed" on public.blog_post_tags
  for all to authenticated
  using (public.has_permission('manage_blog'))
  with check (public.has_permission('manage_blog'));

create policy "faqs_select_scoped" on public.faqs
  for select to authenticated
  using (public.has_permission('manage_faqs'));

create policy "faqs_write_managed" on public.faqs
  for all to authenticated
  using (public.has_permission('manage_faqs'))
  with check (public.has_permission('manage_faqs'));

create policy "testimonials_select_scoped" on public.testimonials
  for select to authenticated
  using (public.has_permission('manage_testimonials'));

create policy "testimonials_write_managed" on public.testimonials
  for all to authenticated
  using (public.has_permission('manage_testimonials'))
  with check (public.has_permission('manage_testimonials'));

create policy "banners_select_scoped" on public.banners
  for select to authenticated
  using (public.has_permission('manage_banners'));

create policy "banners_write_managed" on public.banners
  for all to authenticated
  using (public.has_permission('manage_banners'))
  with check (public.has_permission('manage_banners'));

create policy "menus_select_scoped" on public.menus
  for select to authenticated
  using (public.has_permission('manage_menus'));

create policy "menus_write_managed" on public.menus
  for all to authenticated
  using (public.has_permission('manage_menus'))
  with check (public.has_permission('manage_menus'));

create policy "menu_items_select_scoped" on public.menu_items
  for select to authenticated
  using (public.has_permission('manage_menus'));

create policy "menu_items_write_managed" on public.menu_items
  for all to authenticated
  using (public.has_permission('manage_menus'))
  with check (public.has_permission('manage_menus'));

-- =============================================================================
-- PERMISSIONS & SEED DATA
-- =============================================================================

insert into public.permissions (key, description) values
  ('manage_pages', 'Create and edit pages and their Page Builder sections, including drafts and revisions.'),
  ('publish_pages', 'Publish or unpublish a page (move it into/out of the published status).'),
  ('manage_blog', 'Create, edit, and manage blog posts, categories, and tags, including drafts.'),
  ('publish_blog', 'Publish or unpublish a blog post.'),
  ('manage_faqs', 'Create, edit, delete, and reorder FAQs.'),
  ('manage_testimonials', 'Create, edit, and manage testimonials.'),
  ('manage_banners', 'Create, edit, and manage promotional banners.'),
  ('manage_menus', 'Create, edit, and manage navigation menus and menu items.')
on conflict (key) do nothing;

-- Content Manager: full CMS access per master plan §10, plus the pre-existing
-- Phase 2 manage_seo/manage_media grants it needs to actually use SeoForm/MediaPicker
-- on CMS entities (re-asserted here defensively; already granted in Phase 2 if present).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'manage_pages', 'publish_pages', 'manage_blog', 'publish_blog',
  'manage_faqs', 'manage_testimonials', 'manage_banners', 'manage_menus',
  'manage_seo', 'manage_media'
)
where r.name = 'Content Manager'
on conflict (role_id, permission_id) do nothing;

-- Admin/Manager and Sales Staff are deliberately NOT granted any Phase 5 permission
-- — CMS is outside their master plan §10 scope, same reasoning Phase 4 applied in
-- reverse (Content Manager got no WhatsApp access).

-- Seed the homepage singleton so "Homepage Sections" has something to open
-- immediately. Seeded as draft, not published — enforce_publish_permission_trg
-- correctly rejects an unauthenticated migration-context insert of status=
-- 'published' (has_permission() has no auth.uid() to check here), the same as it
-- would reject any real user lacking publish_pages. A Content Manager/Super Admin
-- publishes it for real through the app after this migration runs.
insert into public.pages (title, slug, status, is_homepage) values
  ('Home', 'home', 'draft', true)
on conflict (slug) do nothing;
