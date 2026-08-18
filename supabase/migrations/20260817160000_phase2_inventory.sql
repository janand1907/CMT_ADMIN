-- Phase 2 — Inventory + Admin Design System
-- Destinations, package categories, packages, package pricing, package images,
-- media library, polymorphic SEO metadata, smart package matching RPC.
-- Depends on Phase 0 (has_permission, set_updated_at) and Phase 1 (leads, for matching).
-- Scope is exactly master plan §4, §9 Inventory, §11, §13.B, §15 Phase 2 — no
-- Hotels/Properties or Vehicles tables (those are listed in §2/§9 but not in the
-- §15 Phase 2 development-strategy scope, and are not part of this migration).

-- =========================================================================
-- MEDIA (shared library — §11)
-- =========================================================================

create table public.media (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('packages', 'destinations', 'banners', 'blog', 'gallery', 'pages')),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  alt_text text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.media is
  'Supabase Storage bucket "media" object metadata. storage_path is the object key '
  'inside the bucket. Organized by area per master plan §11; Phase 2 UI only writes '
  '''packages''/''destinations''/''gallery'' — the other areas are reserved for CMS (Phase 5).';

create index media_area_idx on public.media(area);

create trigger set_media_updated_at
  before update on public.media
  for each row execute function public.set_updated_at();

-- =========================================================================
-- DESTINATIONS
-- =========================================================================

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_media_id uuid references public.media(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_name_not_blank check (length(trim(name)) > 0),
  constraint destinations_slug_not_blank check (length(trim(slug)) > 0)
);

create index destinations_status_idx on public.destinations(status);

create trigger set_destinations_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

-- =========================================================================
-- PACKAGE_CATEGORIES
-- =========================================================================

create table public.package_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_categories_name_not_blank check (length(trim(name)) > 0)
);

create trigger set_package_categories_updated_at
  before update on public.package_categories
  for each row execute function public.set_updated_at();

-- =========================================================================
-- PACKAGES
-- Fields transcribed from master plan §4. itinerary is structured (day-by-day)
-- rather than a single text blob so the Content tab can render/edit it as a
-- list; inclusions/exclusions are simple text arrays (bullet lists per §4).
-- =========================================================================

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  destination_id uuid references public.destinations(id) on delete set null,
  category_id uuid references public.package_categories(id) on delete set null,
  package_type text,
  duration_days int,
  duration_nights int,
  short_description text,
  description text,
  itinerary jsonb not null default '[]'::jsonb,
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  room_category text,
  featured boolean not null default false,
  is_available boolean not null default true,
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packages_name_not_blank check (length(trim(name)) > 0),
  constraint packages_slug_not_blank check (length(trim(slug)) > 0),
  constraint packages_duration_not_negative check (
    (duration_days is null or duration_days >= 0) and
    (duration_nights is null or duration_nights >= 0)
  )
);

comment on table public.packages is
  'status defaults to inactive so a package can be created and edited across '
  'sections (Details/Content/Pricing/Images/SEO) before being switched to active/live. '
  'No "draft" status was added beyond master plan §4''s literal active/inactive. '
  'is_available is a separate field per §4 (listed apart from Active/Inactive, and '
  'again in §4 Benefits as its own admin-editable field) — e.g. a live/active package '
  'temporarily out of stock for a season, without changing its active/inactive status.';

create index packages_destination_id_idx on public.packages(destination_id);
create index packages_category_id_idx on public.packages(category_id);
create index packages_status_idx on public.packages(status);
create index packages_featured_idx on public.packages(featured);
create index packages_is_available_idx on public.packages(is_available);

create trigger set_packages_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- =========================================================================
-- PACKAGE_PRICING
-- Multiple rows per package: rack, B2B, custom, and any number of seasonal
-- rows (each with its own validity window) — matches master plan §4's
-- "Rack rate / B2B rate / Custom pricing / Seasonal pricing" as one typed table
-- rather than four fixed columns, since seasonal pricing is inherently multi-row.
-- =========================================================================

create table public.package_pricing (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  pricing_type text not null check (pricing_type in ('rack', 'b2b', 'custom', 'seasonal')),
  label text,
  price numeric not null check (price >= 0),
  currency text not null default 'INR',
  valid_from date,
  valid_to date,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_pricing_valid_range check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create index package_pricing_package_id_idx on public.package_pricing(package_id);

create trigger set_package_pricing_updated_at
  before update on public.package_pricing
  for each row execute function public.set_updated_at();

-- =========================================================================
-- PACKAGE_IMAGES (attach media library items to a package, with ordering)
-- =========================================================================

create table public.package_images (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_images_unique_media unique (package_id, media_id)
);

create index package_images_package_id_idx on public.package_images(package_id);

-- At most one cover image per package.
create unique index package_images_one_cover_idx on public.package_images(package_id) where is_cover;

create trigger set_package_images_updated_at
  before update on public.package_images
  for each row execute function public.set_updated_at();

-- =========================================================================
-- SEO_METADATA (polymorphic — packages/destinations today; pages/blog in Phase 5)
-- =========================================================================

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('package', 'destination')),
  entity_id uuid not null,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_media_id uuid references public.media(id) on delete set null,
  indexable boolean not null default true,
  schema_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seo_metadata_unique_entity unique (entity_type, entity_id)
);

comment on table public.seo_metadata is
  'One row per (entity_type, entity_id). entity_type is constrained to the entities '
  'that exist so far (package, destination) — extended in later phases (page, blog_post), '
  'never a free-text/unconstrained column, so a bad entity_type cannot be inserted silently.';

create index seo_metadata_entity_idx on public.seo_metadata(entity_type, entity_id);

create trigger set_seo_metadata_updated_at
  before update on public.seo_metadata
  for each row execute function public.set_updated_at();

-- =========================================================================
-- SMART PACKAGE MATCHING (§13.B)
-- Plain invoker security (like find_or_create_customer) so it runs under the
-- calling staff member's own session — leads RLS (view_leads_own/view_leads_all)
-- and packages RLS (view_inventory) both apply exactly as they would to a direct
-- query. A caller who cannot see the lead, or cannot see inventory, gets nothing.
--
-- Scoring uses only the enquiry attributes that have a corresponding column on
-- both sides. "Number of people" from §13.B is not scored: packages have no
-- capacity/pax field in master plan §4, so there is nothing to compare it
-- against — no capacity column was invented to fill that gap.
--   destination   35 pts  — leads.destination vs destinations.name (ILIKE, either direction)
--   category/type 30 pts  — leads.package_interested vs package_categories.name,
--                            packages.package_type, or packages.name
--   budget        20 pts  — any active package_pricing row <= leads.budget * 1.2
--   duration      15 pts  — |(( return_date - travel_date) - duration_days)| <= 1
-- =========================================================================

create function public.match_packages_for_lead(p_lead_id uuid)
returns table (
  package_id uuid,
  name text,
  slug text,
  cover_image_url text,
  score int,
  reasons text[],
  price numeric
)
language sql
stable
as $$
  with lead as (
    select destination, package_interested, budget, travel_date, return_date
    from public.leads
    where id = p_lead_id
  ),
  best_price as (
    select pp.package_id, min(pp.price) as price
    from public.package_pricing pp
    where pp.is_active
    group by pp.package_id
  ),
  scored as (
    select
      p.id as package_id,
      p.name,
      p.slug,
      (
        case when d.name is not null and lead.destination is not null
          and (d.name ilike '%' || lead.destination || '%' or lead.destination ilike '%' || d.name || '%')
        then 35 else 0 end
      ) +
      (
        case when lead.package_interested is not null and (
          (c.name is not null and c.name ilike '%' || lead.package_interested || '%')
          or (p.package_type is not null and p.package_type ilike '%' || lead.package_interested || '%')
          or (p.name ilike '%' || lead.package_interested || '%')
        ) then 30 else 0 end
      ) +
      (
        case when lead.budget is not null and bp.price is not null and bp.price <= lead.budget * 1.2
        then 20 else 0 end
      ) +
      (
        case when lead.travel_date is not null and lead.return_date is not null and p.duration_days is not null
          and abs(extract(day from (lead.return_date::timestamptz - lead.travel_date::timestamptz)) - p.duration_days) <= 1
        then 15 else 0 end
      ) as score,
      array_remove(array[
        case when d.name is not null and lead.destination is not null
          and (d.name ilike '%' || lead.destination || '%' or lead.destination ilike '%' || d.name || '%')
        then 'Destination match: ' || d.name end,
        case when lead.package_interested is not null and (
          (c.name is not null and c.name ilike '%' || lead.package_interested || '%')
          or (p.package_type is not null and p.package_type ilike '%' || lead.package_interested || '%')
          or (p.name ilike '%' || lead.package_interested || '%')
        ) then 'Category/type match: ' || lead.package_interested end,
        case when lead.budget is not null and bp.price is not null and bp.price <= lead.budget * 1.2
        then 'Within budget: ₹' || bp.price::text end,
        case when lead.travel_date is not null and lead.return_date is not null and p.duration_days is not null
          and abs(extract(day from (lead.return_date::timestamptz - lead.travel_date::timestamptz)) - p.duration_days) <= 1
        then 'Duration match: ' || p.duration_days::text || 'd' end
      ], null) as reasons,
      bp.price
    from public.packages p
    cross join lead
    left join public.destinations d on d.id = p.destination_id
    left join public.package_categories c on c.id = p.category_id
    left join best_price bp on bp.package_id = p.id
    where p.status = 'active' and p.is_available
  )
  select
    scored.package_id,
    scored.name,
    scored.slug,
    (
      select m.storage_path from public.package_images pi
      join public.media m on m.id = pi.media_id
      where pi.package_id = scored.package_id
      order by pi.is_cover desc, pi.sort_order asc
      limit 1
    ) as cover_image_url,
    scored.score,
    scored.reasons,
    scored.price
  from scored
  where scored.score > 0
  order by scored.score desc, scored.name asc
  limit 10;
$$;

comment on function public.match_packages_for_lead(uuid) is
  'Smart Package Matching (master plan §13.B). Returns up to 10 active packages '
  'scored against a lead''s destination/category/budget/duration, highest first. '
  'cover_image_url is a storage_path (not a public URL) — the caller resolves it '
  'against the "media" bucket public URL prefix.';

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.media enable row level security;
alter table public.destinations enable row level security;
alter table public.package_categories enable row level security;
alter table public.packages enable row level security;
alter table public.package_pricing enable row level security;
alter table public.package_images enable row level security;
alter table public.seo_metadata enable row level security;

-- --- media: any staff holding view_inventory (or manage_media/manage_packages,
-- --- who need to see it to attach it) can read; only manage_media can write rows.
-- --- Storage.objects policies (below) separately gate the actual file bytes.

create policy "media_select_scoped" on public.media
  for select to authenticated
  using (
    public.has_permission('view_inventory')
    or public.has_permission('manage_media')
    or public.has_permission('manage_packages')
  );

create policy "media_write_managed" on public.media
  for all to authenticated
  using (public.has_permission('manage_media'))
  with check (public.has_permission('manage_media'));

-- --- destinations / package_categories: read gated by view_inventory (or the
-- --- write permission, so an editor without view_inventory explicitly granted
-- --- still isn't locked out of their own write surface); write by manage_packages.

create policy "destinations_select_scoped" on public.destinations
  for select to authenticated
  using (public.has_permission('view_inventory') or public.has_permission('manage_packages'));

create policy "destinations_write_managed" on public.destinations
  for all to authenticated
  using (public.has_permission('manage_packages'))
  with check (public.has_permission('manage_packages'));

create policy "package_categories_select_scoped" on public.package_categories
  for select to authenticated
  using (public.has_permission('view_inventory') or public.has_permission('manage_packages'));

create policy "package_categories_write_managed" on public.package_categories
  for all to authenticated
  using (public.has_permission('manage_packages'))
  with check (public.has_permission('manage_packages'));

-- --- packages: same read scoping; write by manage_packages. Pricing is a
-- --- separate permission (manage_package_pricing) per master plan §10's
-- --- explicit granular example "Change package price".

create policy "packages_select_scoped" on public.packages
  for select to authenticated
  using (public.has_permission('view_inventory') or public.has_permission('manage_packages'));

create policy "packages_write_managed" on public.packages
  for all to authenticated
  using (public.has_permission('manage_packages'))
  with check (public.has_permission('manage_packages'));

create policy "package_pricing_select_scoped" on public.package_pricing
  for select to authenticated
  using (
    public.has_permission('view_inventory')
    or public.has_permission('manage_packages')
    or public.has_permission('manage_package_pricing')
  );

create policy "package_pricing_write_managed" on public.package_pricing
  for all to authenticated
  using (public.has_permission('manage_package_pricing'))
  with check (public.has_permission('manage_package_pricing'));

create policy "package_images_select_scoped" on public.package_images
  for select to authenticated
  using (public.has_permission('view_inventory') or public.has_permission('manage_packages'));

create policy "package_images_write_managed" on public.package_images
  for all to authenticated
  using (public.has_permission('manage_packages'))
  with check (public.has_permission('manage_packages'));

-- --- seo_metadata: read scoped like the entities it describes; write by
-- --- manage_seo per master plan §10's explicit granular example "Manage SEO".

create policy "seo_metadata_select_scoped" on public.seo_metadata
  for select to authenticated
  using (
    public.has_permission('view_inventory')
    or public.has_permission('manage_packages')
    or public.has_permission('manage_seo')
  );

create policy "seo_metadata_write_managed" on public.seo_metadata
  for all to authenticated
  using (public.has_permission('manage_seo'))
  with check (public.has_permission('manage_seo'));

-- =========================================================================
-- STORAGE (media bucket + object policies)
-- Public bucket: package/destination images are eventually rendered on the
-- public website (Phase 6), so reads are unauthenticated via the public URL.
-- Only manage_media holders can list/insert/update/delete objects via the API.
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_bucket_select_managed" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.has_permission('manage_media'));

create policy "media_bucket_insert_managed" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_permission('manage_media'));

create policy "media_bucket_update_managed" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_permission('manage_media'))
  with check (bucket_id = 'media' and public.has_permission('manage_media'));

create policy "media_bucket_delete_managed" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_permission('manage_media'));

-- =========================================================================
-- PERMISSIONS & SEED DATA
-- =========================================================================

insert into public.permissions (key, description) values
  ('view_inventory', 'View destinations, categories, packages, and media library.'),
  ('manage_packages', 'Create, edit, delete packages, categories, destinations, and package images.'),
  ('manage_package_pricing', 'Create, edit, delete package pricing (rack/B2B/custom/seasonal).'),
  ('manage_seo', 'Edit SEO metadata for packages and destinations.'),
  ('manage_media', 'Upload, rename, replace, delete media library files.')
on conflict (key) do nothing;

-- Admin / Manager: full inventory operational access.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'view_inventory', 'manage_packages', 'manage_package_pricing', 'manage_seo', 'manage_media'
)
where r.name = 'Admin / Manager'
on conflict (role_id, permission_id) do nothing;

-- Sales Staff: read-only, needed to see Smart Matching suggestions during
-- quotation creation/follow-up (§13.B) — no write access to inventory.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'view_inventory'
where r.name = 'Sales Staff'
on conflict (role_id, permission_id) do nothing;

-- Content Manager: owns SEO and media library per master plan §10, plus
-- read access to inventory it's describing.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('view_inventory', 'manage_seo', 'manage_media')
where r.name = 'Content Manager'
on conflict (role_id, permission_id) do nothing;

-- Small, realistic demo dataset (ConnectMyTours already runs live pages for
-- these — see app/tirupati, app/chennai, app/kerala, app/hyderabad,
-- app/bangalore, app/south-india) so Phase 2 has real data to browser-test
-- against without inventing placeholder content.

insert into public.destinations (name, slug, description, status) values
  ('Tirupati', 'tirupati', 'Sri Venkateswara Temple darshan tours from Chennai, Bangalore and Hyderabad.', 'active'),
  ('Chennai', 'chennai', 'Chennai-departure pilgrimage and darshan packages.', 'active'),
  ('Kerala', 'kerala', 'Backwaters, hill stations and nature trails across Kerala.', 'active'),
  ('Hyderabad', 'hyderabad', 'Hyderabad-departure pilgrimage and darshan packages.', 'active'),
  ('Bangalore', 'bangalore', 'Bangalore-departure pilgrimage and darshan packages.', 'active')
on conflict (slug) do nothing;

insert into public.package_categories (name, slug, description, status) values
  ('Darshan', 'darshan', 'Temple darshan and pilgrimage packages.', 'active'),
  ('Nature & Hill Stations', 'nature-hill-stations', 'Backwaters, wildlife and hill-station tours.', 'active'),
  ('VIP / Special Entry', 'vip-special-entry', 'VIP break-darshan and special-entry packages.', 'active')
on conflict (slug) do nothing;

insert into public.packages (
  name, slug, destination_id, category_id, package_type, duration_days, duration_nights,
  short_description, description, itinerary, inclusions, exclusions, status, featured
)
select
  'NRI Darshan Package', 'nri-darshan-package',
  d.id, c.id, 'darshan', 2, 1,
  'Priority darshan package for NRI and overseas pilgrims visiting Tirumala.',
  'A streamlined 2-day/1-night package covering NRI-quota darshan at Sri Venkateswara Temple, ' ||
  'hotel stay near Tirupati, and return transfer.',
  '[{"day":1,"title":"Arrival & Darshan","description":"Arrive Tirupati, check in, evening NRI-quota darshan."},
    {"day":2,"title":"Local Sightseeing & Departure","description":"Visit nearby temples, checkout, departure transfer."}]'::jsonb,
  array['Hotel accommodation', 'NRI-quota darshan ticket', 'Airport/station transfers'],
  array['Airfare/train fare', 'Personal expenses'],
  'active', true
from public.destinations d, public.package_categories c
where d.slug = 'tirupati' and c.slug = 'darshan'
on conflict (slug) do nothing;

insert into public.packages (
  name, slug, destination_id, category_id, package_type, duration_days, duration_nights,
  short_description, description, itinerary, inclusions, exclusions, status, featured
)
select
  'Srivani VIP Break Darshan', 'srivani-vip-break-darshan',
  d.id, c.id, 'vip', 1, 0,
  'Same-day VIP break-darshan package via the Srivani Trust queue.',
  'A same-day package for pilgrims seeking a shorter queue time via the Srivani Trust break-darshan line, ' ||
  'including local transfers.',
  '[{"day":1,"title":"VIP Break Darshan","description":"Arrive Tirumala, Srivani break-darshan queue, return same day."}]'::jsonb,
  array['Srivani break-darshan ticket', 'Local transfers'],
  array['Accommodation', 'Meals'],
  'active', false
from public.destinations d, public.package_categories c
where d.slug = 'tirupati' and c.slug = 'vip-special-entry'
on conflict (slug) do nothing;

insert into public.packages (
  name, slug, destination_id, category_id, package_type, duration_days, duration_nights,
  short_description, description, itinerary, inclusions, exclusions, status, featured
)
select
  'Gods Own Country', 'gods-own-country',
  d.id, c.id, 'tour', 5, 4,
  'Classic Kerala circuit: Munnar hills, Alleppey backwaters, Kochi heritage.',
  'A 5-day/4-night Kerala tour covering Munnar tea gardens, an Alleppey houseboat stay, ' ||
  'and Kochi''s Fort Kochi heritage area.',
  '[{"day":1,"title":"Arrival & Munnar","description":"Arrive Kochi, drive to Munnar."},
    {"day":2,"title":"Munnar Sightseeing","description":"Tea gardens, Eravikulam National Park."},
    {"day":3,"title":"Munnar to Alleppey","description":"Drive to Alleppey, board houseboat."},
    {"day":4,"title":"Backwaters to Kochi","description":"Houseboat checkout, drive to Kochi."},
    {"day":5,"title":"Kochi & Departure","description":"Fort Kochi heritage walk, departure."}]'::jsonb,
  array['Hotel accommodation', 'Houseboat stay with meals', 'Private vehicle for entire trip'],
  array['Airfare/train fare', 'Entry tickets', 'Personal expenses'],
  'active', true
from public.destinations d, public.package_categories c
where d.slug = 'kerala' and c.slug = 'nature-hill-stations'
on conflict (slug) do nothing;
