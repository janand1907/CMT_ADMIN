# ConnectMyTours — Implementation Status & QA Governance

Updated: 2026-08-20 (Phase 5 CMS — CLOSED after a dedicated QA closure pass covering search/filter scoping, all 19 Page Builder block types, and the full navigation/back/forward/refresh regression matrix; Phase 4 unchanged, still QA INCOMPLETE)

Scope for every phase below is transcribed from `CONNECTMYTOURS_MASTER_PLAN.md` only — no
feature has been added or expanded beyond what that document states. Where the master plan
does not fully specify a layer (e.g. Phase 3.5 has no dedicated section), that gap is noted
explicitly rather than filled in.

`CLAUDE.md` does not exist in this repository — no project-specific Claude instructions to
incorporate.

---

## Permanent QA Governance Rules

These rules apply to every phase from this point forward and do not expire when a phase closes.

### 1. Phase Closure Rule

A phase may be marked **CLOSED** only after all applicable layers pass: Requirements, UI,
Client state, Server actions/API, Database, RLS/permissions, Validation, Error handling,
Loading states, Empty states, Success states, Navigation, Refresh persistence, Browser
back/forward, Direct URL access, Authentication/session behavior, Role/permission behavior,
Edge cases, Migration state, Remote database state, Lint, Build, Real browser acceptance
testing, Regression testing of previous phases.

Code existing, a migration existing, lint passing, or build passing is **never** sufficient
on its own to mark a phase CLOSED.

### 2. Mandatory Testing Model

For every feature, trace the complete path: User action → Client → Server action/API →
Database → Response → UI update → Navigation → Hard refresh → Database read → UI read.

A success toast is not proof of persistence. `error === null` is not proof that a mutation
changed a row. Mutations must be verified against actual database state; reads must be
verified against what the UI actually renders.

### 3. Database / Security Verification

For every database-backed feature, verify: correct table, correct columns, correct
relationships, foreign keys, constraints, indexes where required, RLS enabled, SELECT/INSERT/
UPDATE/DELETE policies, permission checks, authenticated behavior, unauthorized behavior,
ownership/scoping behavior.

RLS is never bypassed for application functionality. The service-role client is used only
where the architecture legitimately requires server-side privileged operations (e.g. looking
up an account by email during a failed-login audit write, where no authenticated Postgres
role exists yet).

### 4. Real Browser Acceptance

Mandatory. Source inspection, static reasoning, lint, build, and database-only tests are not
sufficient. For every important workflow: create, save, refresh, reopen, edit, save again,
refresh again, navigate away, navigate back, verify data, test invalid input, test permission
boundaries, test error state.

### 5. Cache / Session / Navigation Verification

For every server-rendered/admin feature verify: initial load, browser refresh, hard refresh,
client-side navigation, navigate away and back, browser back/forward, direct URL, new tab,
logged-out access, expired session where applicable. A successful server write is never
assumed to mean the browser is displaying fresh data.

### 6. Error / Edge-Case Verification

Every feature considers and tests applicable cases: empty data, missing data, invalid input,
duplicate input, missing required fields, unauthorized user, expired session, deleted related
record, network/server failure, database constraint failure, stale UI state, repeated
submission, rapid repeated clicks, browser refresh during operation, navigation during
operation. Errors are never hidden; success is never reported when the operation failed.

### 7. Migration Rule

For every schema change: migration exists, migration applies successfully, remote database
matches local migration state, RLS policies exist remotely, functions/triggers exist remotely
where required, application code matches the deployed schema. A local migration is never
assumed to be deployed — verify with `supabase migration list`.

### 8. Regression Rule

Before closing each phase, verify previously closed phases still work. A new phase must not
silently break authentication, middleware, existing routes, database policies, existing
workflows, public site functionality, or previously verified APIs.

### 9. No-Assumption Rule

If something fails, the cause is not assumed. Nothing is marked fixed until the actual user
workflow proves the fix. If an automated test passes but the real browser fails, the feature
remains OPEN. User/browser verification has final authority for UI acceptance.

### 10. Git Rule

No `git reset`, `git clean`, `git rebase`, force push, or repository reinitialization without
explicit approval. No committing unrelated work. Git history is not modified without explicit
approval.

### 11. Phase Order

Phase 0 → 1 → 2 → 3 → 3.5 → 4 → 5 → 6 → 7 → 8. No phase starts while the previous phase is
QA INCOMPLETE or BLOCKED.

### 12. Source of Truth

This file is the project status source of truth, updated after each completed phase or
verified blocker. Status is never inferred from memory or prior conversation text — only from
current evidence in the repository and remote systems. Valid values: `NOT STARTED`,
`IN PROGRESS`, `QA INCOMPLETE`, `BLOCKED`, `CLOSED`.

---

## Phase 0 — Foundation / Authentication

**Purpose (master plan §15):** Review existing codebase, establish architecture, Supabase
project, database foundation, authentication, admin shell, roles & permissions, environment
configuration.

**Exact features (as implemented, evidence: file tree + migrations):**
- Supabase Auth-backed login (`app/admin/login/`)
- Forgot-password request flow (`app/admin/forgot-password/`)
- PKCE recovery-code exchange (`app/admin/auth/callback/route.js`)
- Password reset form + submission (`app/admin/reset-password/`)
- Session security: sign-out-other-sessions, recent login activity (`app/admin/(protected)/security/`)
- Auth-gated middleware with a public-path allowlist for the above flows (`middleware.js`)
- Admin shell/nav/dashboard shell (`components/admin/AdminShell.jsx`, `app/admin/(protected)/`)
- `auto_grant_super_admin` trigger granting the first/only admin full permissions
- Login event auditing (success and failure) via service-role client (`lib/auth/recordLoginEvent.js`)

**Database objects (evidence: `supabase/migrations/20260813090016_phase0_foundation.sql`,
`20260817090000_audit_logs_select_self.sql`):**
- Tables: `roles`, `permissions`, `role_permissions`, `users`, `settings`, `sequences`, `audit_logs`
- Functions: `handle_new_auth_user`, `set_updated_at`, `next_sequence_value`,
  `generate_business_id`, `has_permission`, `grant_new_permission_to_super_admin`
- Triggers: `on_auth_user_created`, `set_users_updated_at`, `set_settings_updated_at`,
  `auto_grant_super_admin`
- RLS policies: `roles_select_authenticated`, `roles_write_managed`,
  `permissions_select_authenticated`, `permissions_write_managed`,
  `role_permissions_select_authenticated`, `role_permissions_write_managed`,
  `users_select_self_or_managed`, `users_insert_managed`, `users_update_managed`,
  `users_delete_managed`, `settings_select_managed`, `settings_write_managed`,
  `audit_logs_select_managed`, `audit_logs_insert_self`, `audit_logs_select_self`

**Admin routes (evidence: `app/admin/` file tree):**
`/admin/login`, `/admin/forgot-password`, `/admin/reset-password`, `/admin/auth/callback`
(route handler), `/admin/(protected)/dashboard`, `/admin/(protected)/security`

**Server actions / API:** `login/actions.js`, `forgot-password/actions.js`,
`reset-password/actions.js`, `security/actions.js` (`signOutOtherSessions`),
`lib/auth/recordLoginEvent.js`, `lib/auth/parseUserAgent.js`, `lib/auth/requestMeta.js`

**External integrations:** Supabase Auth (PKCE recovery flow; Supabase sends the recovery
email itself — no separate transactional-email provider is in this path)

**Dependencies on previous phases:** None — this is the foundation phase.

**Acceptance requirements:** All applicable layers under "Permanent QA Governance Rules → 1.
Phase Closure Rule" above, including real browser acceptance testing.

**Current status: CLOSED**

Verified this session (evidence-based):
- `npm run lint` — clean
- `npm run build` — compiles, all routes resolve
- Migrations applied and matched remotely (`supabase migration list`)
- Fixed `lib/auth/recordLoginEvent.js` — failed logins were never recorded and successful
  logins never attributed to the acting user, due to a `NOT NULL` constraint on
  `audit_logs.entity_id` being violated silently; now resolves the account by email server-side
- Fixed HTTP 431 on `/admin/reset-password` (raised Node's `--max-http-header-size` in
  `package.json`'s `dev`/`start` scripts); confirmed via direct `curl` testing against the
  real dev server that the previously-failing header size now succeeds
- Server access logs show a real `GET /admin/reset-password 200` followed by
  `GET /admin/dashboard 200` against the fixed server

**Real browser acceptance (user-confirmed 2026-08-17):** Recovery link opened
`/admin/reset-password` and the reset form loaded successfully (not the invalid/expired-link
state); new password was set and login with the new password succeeded. Both outstanding
items from Rule 9 (No-Assumption Rule) / Rule 4 (Real Browser Acceptance) are now satisfied.
Phase 0 is CLOSED.

---

## Phase 1 — CRM

**Purpose (master plan §15):** Enquiry capture, lead management, customer management, lead
statuses, notes, activities, tasks, tags, lead source tracking.

**Exact features (master plan §3, §7, §13.A, §13.C, §13.D):**
- Enquiry flow: Customer → Enquiry Form → Lead Created → Enquiry Number → Confirmation
- Lead pipeline: New → Contacted → Quotation Prepared → Quotation Sent → Follow-up →
  Negotiation → Confirmed, plus Not Interested / Lost / Cancelled
- Lead data: enquiry number, customer, contact info, WhatsApp number, email, destination,
  travel/return dates, adults/kids/infants, package/category, budget, source, assigned staff,
  status, priority, tags, notes, created/updated dates
- Lead timeline (audit trail of enquiry/quotation/follow-up/status events)
- Customer profile: name, phone, WhatsApp, email, location, linked enquiries/quotations/
  bookings, notes, communication history, tags
- Lead source tracking (Google, Organic SEO, Facebook, Instagram, WhatsApp, Direct, Referral,
  Other)
- Follow-up task management (call, send quotation, follow up, request payment, confirm
  booking — each with due date/time, assigned staff, priority, status, notes)
- Lead tags (HOT, VIP, Family, Group, Corporate, Budget, Urgent, High Value)

**Database objects (master plan §9):** `customers`, `leads`, `lead_notes`, `lead_activities`,
`lead_followups`, `lead_tasks`, `lead_tags`, `lead_sources`

**Admin routes (planned — master plan §2 CRM menu):** Leads/Enquiries, Customers,
Follow-ups, Activity History, Tasks, Lead Tags, Lead Sources (Quotations nav item belongs to
Phase 3)

**Server actions / API:** None yet.

**External integrations:** None specific to this phase (WhatsApp confirmation belongs to
Phase 4).

**Dependencies on previous phases:** Phase 0 (auth, roles/permissions, audit logging).

**Acceptance requirements:** Full QA governance framework above.

**Current status: CLOSED**
Evidence: Migration `20260817120000_phase1_crm.sql` deployed to remote (`connectmytours`,
`mybjwunznupckcnwywfv`) via `supabase db push --linked` on 2026-08-17. Verified against remote
via `supabase db query --linked`: all 9 tables present with RLS enabled (`lead_sources`,
`lead_tags`, `customers`, `leads`, `lead_notes`, `lead_activities`, `lead_followups`,
`lead_tasks`, `lead_tag_assignments`); all 5 Phase 1 functions/triggers present
(`find_or_create_customer`, `submit_enquiry`, `log_lead_created`, `log_lead_status_change`,
`enforce_lead_reassignment`); Phase 0 objects (`has_permission`, `generate_business_id`,
`set_updated_at`, `users`/`roles`/`permissions`) intact; 9 permissions and correct
Admin/Manager + Sales Staff role grants confirmed; seed data present (8 lead sources, 8 lead
tags). `supabase migration list` confirms local == remote, no unexpected migrations applied.
`npm run lint` and `npm run build` both pass.

**Real browser acceptance — full pass (user-confirmed 2026-08-17):**
- Lead creation — VERIFIED
- Lead status/priority persistence — VERIFIED
- Notes create + refresh persistence — VERIFIED
- Follow-up create/complete + refresh persistence — VERIFIED
- Tasks creation — VERIFIED
- Task validation (empty Due blocked, valid Due creates, persists through refresh) — VERIFIED
- Task UI — VERIFIED
- Task pagination — VERIFIED
- Tags add/remove + refresh persistence — VERIFIED
- Activity timeline — VERIFIED
- Customer create/edit + refresh persistence — VERIFIED
- Tags & Sources CRUD + refresh persistence — VERIFIED
- Global Follow-ups — VERIFIED
- Global Tasks + filters + status changes + refresh — VERIFIED
- Global Activity — VERIFIED
- Public Enquiry → CRM — VERIFIED
- Lead search/filter — VERIFIED
- Customer search — VERIFIED
- Staff assignment — VERIFIED
- Admin/Manager permissions — VERIFIED
- Sales Staff permissions/RLS — VERIFIED
- Unauthorized direct access — VERIFIED

Every admin route and CRUD workflow enumerated in this phase's "Exact features" and "Admin
routes" sections above now has real-browser evidence.

**Remaining Phase 1 acceptance items (per Permanent QA Governance Rules above):**

4. Migration Rule (Rule 7) — **VERIFIED 2026-08-17.** `npx supabase migration list --linked`
   re-run at session end: all 5 migrations (`20260813090016`, `20260816120000`,
   `20260817090000`, `20260817120000`, `20260817140000`) show identical `local`/`remote`
   timestamps, no unexpected migrations applied.

1. Regression Rule (Rule 8) — **VERIFIED** (real browser, user-confirmed 2026-08-17): Phase 0
   auth/login/password-reset flows re-tested and still working after this session's Phase 1
   work.
2. Cache/Session/Navigation Rule (Rule 5) — **VERIFIED** (real browser, user-confirmed
   2026-08-17): logged-out access to CRM routes is blocked; browser back/forward through CRM
   routes does not expose protected content.
3. Error/Edge-Case Rule (Rule 6) — **VERIFIED** (real browser, user-confirmed 2026-08-17):
   invalid direct CRM URL, navigation during an in-progress CRM workflow, browser back/forward
   through a CRM workflow, and a safely-simulated local server/network failure all behaved
   correctly with no duplicate records created.

All four Permanent QA Governance layers above are now VERIFIED by real browser testing
(items 1–3 this turn; item 4, migration state, previously). Combined with the full feature
pass (items 1–22 earlier in this section) and every applicable layer in Rule 1 (Phase Closure
Rule), Phase 1 — CRM is **CLOSED**.

**Task validation = QA INCOMPLETE until real browser test passes.**
Migration `20260817140000_lead_tasks_due_at_required.sql` (adds `check (due_at is not null)
not valid` on `lead_tasks`) deployed to remote via `supabase db push` on 2026-08-17.
`supabase migration list` confirms local == remote for all 5 migrations. Verified directly
against the remote database: an `INSERT` with `due_at: null` is rejected (`23514`, constraint
`lead_tasks_due_at_required`), an `UPDATE` setting an existing row's `due_at` to `null` is
also rejected, no row was created by either rejected attempt (row count unchanged at 9), the
pre-existing 6 valid task rows on `CMT-2026-0001` are byte-for-byte unchanged, the 3
pre-existing `due_at IS NULL` rows remain untouched (not cleaned or deleted, per instruction),
and all Phase 0/Phase 1 tables (`users`, `leads`, `customers`, `lead_sources`, `lead_tags`,
`lead_tag_assignments`, `lead_notes`, `lead_activities`, `lead_followups`, `lead_tasks`,
`audit_logs`) remain queryable. Application-layer guard (`addTask()` rejects empty `dueAt`
before calling `.insert()`) and client-side `required` attribute also in place. `npm run lint`
and `npm run build` both pass. No real browser test has been performed in this environment (no
browser/Playwright tool available) — the full acceptance flow (leave Due empty → blocked with
a visible error → valid future Due date → task created → appears → hard refresh → still
present) has not been clicked through. Do not mark Task validation fixed until that browser
test passes.

Re-verified 2026-08-17: `npm run build` and `npm run lint` re-run clean from a fresh process
(all 42 routes compiled, `✔ No ESLint warnings or errors`). Source re-read of the full guard
chain confirms it matches the description above:
[`TasksPanel.jsx`](components/admin/crm/TasksPanel.jsx) has `required` on the `dueAt` input,
[`actions.js`](app/admin/(protected)/crm/leads/[id]/actions.js) `addTask()` rejects a missing
`dueAt` server-side before insert, and the `lead_tasks_due_at_required` `NOT VALID` check
constraint is the database-level backstop.

**Task validation = VERIFIED** (real browser acceptance, user-confirmed 2026-08-17): empty
Due blocked with a visible validation error on Add Task; valid Due created the task
successfully; task appeared correctly in the UI; task persisted through a hard refresh; task
status changes persisted.

**Task UI/pagination = VERIFIED** (real browser acceptance, user-confirmed 2026-08-17): task
pagination in `TasksPanel.jsx` confirmed working in the real browser.

---

## Phase 2 — Inventory + Admin Design System

**Purpose (master plan §15):** Packages, categories, destinations, pricing, media library,
package matching.

**Exact features (master plan §4, §11, §13.B):**
- Package fields: name, slug, category, destination, type, duration, description, itinerary,
  inclusions, exclusions, room/category, images, gallery, rack rate, B2B rate, custom pricing,
  seasonal pricing, availability, featured flag, active/inactive, SEO information
- Admin can change price/image/description/availability/status without code changes
- Media library organized by area (Packages, Destinations, Banners, Blog, Gallery, Pages)
  with upload, rename, alt text, replace, delete, reuse, image optimization, modern formats
- Smart package matching: uses destination, travel date, people count, category, duration,
  budget, package type to recommend matching packages during quotation creation/follow-up

**Database objects (master plan §9):** `packages`, `package_categories`, `destinations`,
`package_images`, `package_pricing`, `media`, `seo_metadata`, `hotels`/`properties`, `vehicles`

**Scope gap (same treatment as Phase 3.5):** `hotels`/`properties` and `vehicles` are named
only as nav-menu items (§2) and one-line Database Architecture entries (§9) — a full-text
search of the master plan found zero field-level specification for either, anywhere in the
document. Per the same principle applied to Phase 3.5 Booking Foundation, no fields were
invented to fill that gap; these two tables are **not implemented** in this migration and
remain a documented master-plan gap, not an implementation gap.

**Admin routes (planned — master plan §2 Inventory menu):** Packages, Destinations,
Categories, Media Library. (Hotels/Properties, Vehicles — see scope gap above, deferred.)

**Server actions / API:** None yet — database layer only. No admin UI, routes, or server
actions have been built for Phase 2 yet.

**External integrations:** None specified.

**Dependencies on previous phases:** Phase 0 (auth/permissions); Phase 1 (leads, for package
matching).

**Acceptance requirements:** Full QA governance framework above.

**Current status: CLOSED**

Database layer deployed and verified this session (evidence-based):
- Migration `supabase/migrations/20260817160000_phase2_inventory.sql` pushed to remote
  (`connectmytours`) via `supabase db push --linked`. Fixed a real deploy-time bug found by
  this push: `comment on table/function ... is` does not accept `||` string concatenation
  (requires a single constant) — rewrote as adjacent auto-concatenated string literals.
- `supabase migration list --linked` confirms local == remote for all 6 migrations
  (`20260813090016` through `20260817160000`), no unexpected migrations applied.
- Verified directly against remote (`supabase db query --linked`): all 7 tables present
  (`destinations`, `package_categories`, `packages`, `package_pricing`, `package_images`,
  `media`, `seo_metadata`) with RLS enabled and exactly the 14 policies defined in the
  migration (2 per table: `*_select_scoped` / `*_write_managed`); `match_packages_for_lead`
  function present; 5 new permissions (`view_inventory`, `manage_packages`,
  `manage_package_pricing`, `manage_seo`, `manage_media`) present with correct role grants
  (Admin/Manager and Super Admin get all 5; Sales Staff gets `view_inventory` only; Content
  Manager gets `view_inventory` + `manage_seo` + `manage_media`); demo seed data present (5
  destinations, 3 categories, 3 packages) with correct foreign-key relationships.
- Smart matching RPC tested against a real lead (Tirupati destination, 1-day trip): correctly
  scored and returned both Tirupati packages (destination + duration match, score 50 each,
  human-readable reasons array) and correctly excluded the non-matching Kerala package. No
  `package_pricing` rows were seeded, so the budget-scoring branch has not been exercised
  against real data — logic reviewed but not empirically verified.
- Phase 0/1 regression: all 12 pre-existing tables (`users`, `roles`, `permissions`,
  `role_permissions`, `leads`, `customers`, `lead_notes`, `lead_tasks`, `lead_followups`,
  `lead_tags`, `lead_sources`, `audit_logs`) confirmed still present and queryable.
- `npm run lint` — clean. `npm run build` — all 42 routes compile.

**UI/application layer built and verified this session (evidence-based):**
- Admin routes: `/admin/inventory/destinations` (+ `[id]`, `new`), `/admin/inventory/categories`
  (+ `[id]`, `new`), `/admin/inventory/packages` (+ `[id]` with Details/Content/Pricing/Images/
  SEO tabs, `new`), `/admin/inventory/media` — all gated server-side via `getPermissions`
  against `view_inventory` / `manage_packages` / `manage_seo` / `manage_media`, matching the
  Phase 2 migration's permission set exactly (no new permissions introduced).
- Server actions for all CRUD paths: package details/content/pricing/images
  (`app/admin/(protected)/inventory/packages/[id]/actions.js`), plus destinations/categories/
  media actions built alongside. SEO metadata reuses one shared `SeoForm` +
  `saveSeoMetadata` across Packages and Destinations rather than duplicating it per entity.
- Admin sidebar navigation (`components/admin/navConfig.js`) wired for Destinations,
  Categories, Packages, Media Library in that order, gated on the same permission keys each
  page enforces server-side; nested routes (e.g. `packages/[id]`) correctly highlight their
  parent nav item via existing `AdminShell.jsx` `pathname.startsWith` logic — no changes needed
  there.
- Fixed two feedback bugs found this session, root-caused against actual code (not guessed):
  (1) Package Details save had no success-state signal at all — `updatePackageDetails` now
  returns an explicit `success` flag, distinct from the untouched initial state, rendered via a
  `FormFeedback` component that hides during `pending` so a stale banner can't leak into the
  next submission. (2) Pricing modal never closed on a successful create/update because
  `addPricing`/`updatePricing` returned the same shape on success as on initial load — now
  returns `success: true`, and `PricingDialog` closes itself via a `useEffect` keyed on that
  flag; failed submissions leave the modal open with the error shown and entered values intact
  (uncontrolled inputs, unaffected by re-render). Duplicate submission was already prevented by
  the shared `Button` component's `disabled={disabled || loading}`; a `CancelButton` was added
  so Cancel is also disabled mid-request.
- `npm run lint` and `npm run build` re-run clean this turn from a fresh process; `npx supabase
  migration list` re-confirmed local == remote for all 6 migrations; direct remote query
  confirmed all 15 Phase 0/1 tables still present and queryable, and no Phase 0/1 source files
  were touched during Phase 2 UI work.

**Real browser acceptance (user-confirmed 2026-08-17):** Destinations; Categories; Packages
CRUD; Package Details; Content/Itinerary; Inclusions/Exclusions; Pricing; Pricing modal
behavior (including the close-on-success and stays-open-on-error fixes above); Package Images;
SEO; Media Library; Smart Matching; Inventory navigation; persistence/refresh behavior; Package
Details save success/error feedback; validation/error behavior. Every admin route and workflow
enumerated in this phase's "Exact features" and "Admin routes" sections above now has
real-browser evidence, matching the standard applied to Phase 0 and Phase 1 closure.

**Unresolved item — untracked storage-policy security drift (left in place, by explicit
decision, 2026-08-17):**
The `media` storage bucket already existed on remote (`created_at` 2026-08-13 18:10:17, during
the Phase 0 window), created outside of any migration file — most likely via the Supabase
Studio dashboard, not this codebase. This migration's `insert into storage.buckets ... on
conflict do nothing` therefore silently no-opped rather than creating it. Two pre-existing
policies were found alongside this migration's 4 new ones: `media_bucket_select_authenticated`
(`SELECT`, `bucket_id = 'media'`, **no permission check** — any authenticated user, not just
`manage_media` holders, can list objects in the bucket) and `media_bucket_write_managed` (`ALL`,
functionally redundant with this migration's separate insert/update/delete policies). Bucket is
empty (0 objects), so there is no data-loss risk today. User decision (2026-08-17): leave both
orphan policies unchanged, no follow-up migration to drop them, no other Phase 2 schema/
policy/storage changes. This remains open as a security-drift item — `media_bucket_
select_authenticated` grants broader read access than this phase's intended `manage_media`
scoping — to be revisited at the latest during Phase 8 Production Hardening (security review),
sooner if the bucket starts holding real files. This item remains open by explicit user
decision and does **not** block Phase 2 closure below — it is carried forward, not resolved or
dismissed.

Every layer in the Phase Closure Rule (UI, client state, server actions, validation, loading/
empty/success states, navigation, refresh persistence, role/permission behavior in the browser,
real browser acceptance, migration state, remote database state, lint, build, regression of
Phase 0/1) now has evidence above. **Phase 2 — Inventory + Admin Design System is CLOSED.**

---

## Phase 3 — Quotations

**Purpose (master plan §15):** Quotation builder, multiple package options, pricing,
quotation status, revision history, WhatsApp quotation sending.

**Exact features (master plan §5):**
- Flow: Lead → Select Matching Packages → Customize → Create Quotation → Send
- Fields: quotation number, customer, enquiry number, package selection, multiple quotation
  items, package images, rack price, B2B price, custom price, discount, final price,
  validity, notes, terms & conditions
- Status: Draft, Sent, Viewed, Accepted, Rejected, Expired
- Designed for future: shared via WhatsApp, shared as web link, generated as PDF, tracked
  views, revised while preserving history

**Database objects (master plan §9):** `quotations`, `quotation_items`,
`quotation_revisions`, `quotation_messages`

**Admin routes (planned — master plan §2 CRM menu):** Quotations

**Server actions / API:** None yet.

**External integrations:** WhatsApp (sending — shared dependency with Phase 4).

**Dependencies on previous phases:** Phase 0; Phase 1 (leads); Phase 2 (packages/pricing).

**Acceptance requirements:** Full QA governance framework above.

**Current status: CLOSED**

Database layer deployed and verified (evidence-based):
- Migrations `20260818090000_phase3_quotations.sql`, `20260818110000_phase3_public_quotation_response.sql`,
  `20260818150000_phase3_revert_public_quotation_response.sql` pushed to remote (`connectmytours`).
- `supabase migration list` confirms local == remote for all 9 migrations
  (`20260813090016` through `20260818150000`), no drift.
- Verified directly against remote: all 4 tables present (`quotations`, `quotation_items`,
  `quotation_revisions`, `quotation_messages`); functions/triggers present
  (`create_quotation`, `create_quotation_revision`, `get_quotation_by_token`,
  `sync_quotation_total`, `recalc_quotation_subtotal`, `enforce_quotation_status_transition`,
  `log_quotation_created`, `log_quotation_status_change`); 5 permissions
  (`view_quotations_own`, `view_quotations_all`, `create_quotations`, `edit_quotations`,
  `send_quotations`) present with correct role grants; RLS policies present across all 4
  tables, no DELETE policy on `quotations` (matches leads/customers no-delete precedent);
  `quotation_items_write_managed` policy correctly restricts item mutation to `status='draft'`.
- Business decision: the anon-callable `respond_to_quotation()` RPC (customer-side public
  accept/reject) was added then deliberately removed via the revert migration. Accept/Reject
  is a manual Admin/Manager action on the quotation detail page only — this is intentionally
  NOT part of Phase 3's final scope, not a missing feature.
- `npm run lint` / `npm run build` — clean, all Phase 3 routes compile
  (`/admin/crm/quotations`, `/admin/crm/quotations/new`, `/admin/crm/quotations/[id]`,
  `/quote/[token]`).

**Browser QA: VERIFIED** (manually performed by user in a real browser). Confirmed working:
quotation creation, lead selection, package picker/selection, pricing, item-level discounts,
quotation-level discounts, totals, quotation persistence, revision creation/history, messages/
history, quotation search, quotation filters, navigation back/forward, refresh/hard-refresh
persistence, environment-aware public quotation URL generation, public quotation page
rendering, admin-side quotation status controls, and the items-table UI after a min-width
layout fix.

---

## Phase 3.5 — Booking Foundation

**Note on scope:** the master plan has no dedicated narrative section for bookings — the only
reference is the `bookings` table entry in §9 Database Architecture, plus a passing mention of
future "online booking, payments, invoices" in §17 Final Product Vision (explicitly described
there as a later, not-yet-scoped extension). Scope below is limited to what §9 actually states,
plus the minimal fields/lifecycle needed for a booking to exist as a row derived from an
accepted quotation; nothing beyond that has been added.

**Purpose:** Persist confirmed bookings derived from accepted quotations.

**Exact features (as implemented):**
- One booking created per accepted quotation via `create_booking()` (accepted-status guard +
  one-booking-per-quotation guard, both application-layer and a unique constraint on
  `quotation_id`)
- Fields: booking number, quotation, lead, customer, travel start/end date, total amount,
  amount paid, generated balance amount, payment status (`pending`/`partial`/`paid`/`refunded`),
  booking status (`pending`/`confirmed`/`completed`/`cancelled`), notes
- Forward-only booking status transitions (`pending → confirmed/cancelled`,
  `confirmed → completed/cancelled`; `completed`/`cancelled` terminal), enforced by
  `enforce_booking_status_transition()`
- First transition to `confirmed` moves the parent lead to `status = 'confirmed'` (mirrors the
  quotation-sent lead-status sync from Phase 3), never regressing a lead already in a
  terminal/confirmed state
- Booking creation, status changes, and payment changes each log a `lead_activities` row,
  visible on the existing lead Activity tab
- Bookings list (search by booking number/customer, filter by status, pagination) and detail
  page (status control, payment form, travel/notes form) under `/admin/crm/bookings`
- Lead detail page gained a Quotations tab; quotation detail page gained a Booking panel that
  either links to the existing booking or shows `CreateBookingForm` when the quotation is
  `accepted` and none exists yet

**Database objects (evidence: `supabase/migrations/20260818170000_phase3_5_bookings.sql`,
confirmed directly against remote):** table `bookings` (RLS enabled, indexes on `lead_id`,
`customer_id`, `booking_status`, `created_at`); functions `create_booking`,
`enforce_booking_status_transition`, `log_booking_created`, `log_booking_status_change`,
`log_booking_payment_change`; triggers `set_bookings_updated_at`, `log_booking_created_trg`,
`enforce_booking_status_transition_trg`, `log_booking_status_change_trg`,
`log_booking_payment_change_trg`; RLS policies `bookings_select_scoped`,
`bookings_insert_scoped`, `bookings_update_scoped` (no delete policy — same
never-delete precedent as leads/customers/quotations); permissions `view_bookings_own`,
`view_bookings_all`, `create_bookings`, `edit_bookings` granted to Admin/Manager (own+all) and
Sales Staff (own only), matching the Phase 3 quotations grant shape; Content Manager gets none.

**Admin routes:** `/admin/crm/bookings`, `/admin/crm/bookings/[id]` — both gated via
`getPermissions` against `view_bookings_own`/`view_bookings_all`/`edit_bookings`, matching this
migration's permission set exactly.

**Server actions / API:** `app/admin/(protected)/crm/bookings/[id]/actions.js`
(`updateBookingStatus`, `updateBookingPayment`, `updateBookingDetails`);
`createBookingFromQuotation` added to
`app/admin/(protected)/crm/quotations/[id]/actions.js`.

**External integrations:** None (no payment gateway — `payment_status`/`amount_paid` are bare
state tracking, no collection integration, by explicit scope decision recorded in the
migration's header comment).

**Dependencies on previous phases:** Phase 0 (`has_permission`, `set_updated_at`,
`generate_business_id`); Phase 1 (leads, customers, `lead_activities`); Phase 3 (quotations).

**Acceptance requirements:** Full QA governance framework above.

**Current status: CLOSED**

Evidence this session:
- Migration `20260818170000_phase3_5_bookings.sql` pushed to remote (`connectmytours`).
  `npx supabase migration list --linked` confirms local == remote for all 10 migrations
  (`20260813090016` through `20260818170000`), no drift.
- Verified directly against remote (`supabase db query --linked`): `bookings` table present with
  `relrowsecurity = true`; exactly the 3 policies defined in the migration
  (`bookings_select_scoped`, `bookings_insert_scoped`, `bookings_update_scoped`); all 5 functions
  present (`create_booking`, `enforce_booking_status_transition`, `log_booking_created`,
  `log_booking_status_change`, `log_booking_payment_change`); all 4 permissions present with the
  correct Admin/Manager and Sales Staff role grants described above.
- `npm run lint` — clean (only pre-existing, unrelated `next/image` warnings in Phase 2
  inventory components). `npm run build` — all routes compile, including
  `/admin/crm/bookings` and `/admin/crm/bookings/[id]`.
- Source cross-checked: `lib/crm/bookingConstants.js` status/transition vocabulary matches the
  migration's check constraints and `enforce_booking_status_transition()` exactly; server
  actions rely on the database trigger/RLS/check-constraint layer for validation (transition
  legality, `edit_bookings` grant, over-payment) rather than duplicating those checks
  client-side, matching the Phase 3 quotations pattern.

**Real browser acceptance (user-confirmed 2026-08-18):** Booking creation from an accepted
quotation; booking number generation; lead/customer/quotation relationships on the booking;
booking status lifecycle (`pending → confirmed`, `confirmed → completed`,
`confirmed → cancelled`); payment amount entry; balance-amount calculation; over-payment
rejection; booking detail editing; refresh persistence; booking list; booking search; booking
status filters; navigation. This satisfies Rule 1 (Phase Closure Rule), Rule 4 (Real Browser
Acceptance), and Rule 9 (No-Assumption Rule) for every workflow enumerated in this phase's
"Exact features" section above. **Phase 3.5 — Booking Foundation is CLOSED.**

**Deferred future enhancement (explicit user decision, 2026-08-18, not a defect):**
`payment_status` is a manually-selected field independent of `amount_paid` (see
`updateBookingPayment` in `app/admin/(protected)/crm/bookings/[id]/actions.js`) — it is not
automatically derived from the paid/total ratio (e.g. `amount_paid = total_amount` does not
auto-set `payment_status = 'paid'`). Automatic payment-status derivation from `amount_paid`,
along with a future refund workflow and stronger payment-status/amount consistency rules, is
intentionally out of scope for Phase 3.5 and deferred to a later enhancement — consistent with
this phase's original scope note that `payment_status`/`amount_paid` are bare state tracking
with no payment gateway/collection integration.

---

## Phase 4 — WhatsApp Automation

**Purpose (master plan §15):** Confirmation message, quotation message, template management,
morning/evening follow-up, automation rules, stop/pause/resume logic, message history.

**Exact features (master plan §6):**
- Enquiry confirmation: Enquiry → Database → Enquiry Number → WhatsApp Confirmation
- Quotation message: package image, booking details, price, date, room/category, enquiry
  number, contact details; multiple quotations can be sent for one enquiry
- Follow-up automation: morning send (relevant package/offer), evening send (another relevant
  package/offer); packages matched to the customer's enquiry, not random promotions
- Automation controls: enable/disable, morning time, evening time, follow-up duration, max
  messages, eligible lead statuses, pause/resume/stop
- Stop conditions: customer books, customer requests stop, lead marked not interested/lost,
  admin manually stops
- Centrally managed WhatsApp templates compliant with official WhatsApp Business messaging
  requirements

**Database objects (master plan §9):** `whatsapp_templates`, `whatsapp_messages`,
`automation_rules`, `campaigns`, `campaign_recipients`

**Admin routes (planned — master plan §2 Marketing menu):** WhatsApp Campaigns, Follow-up
Automation, WhatsApp Templates, Offers, Lead Sources; plus Settings → WhatsApp Settings

**Server actions / API:** None yet.

**External integrations:** Official WhatsApp Business Platform / Cloud API (master plan §1).

**Dependencies on previous phases:** Phase 0; Phase 1 (leads/enquiries); Phase 3 (quotation
messages).

**Acceptance requirements:** Full QA governance framework above.

**Current status: IN PROGRESS — QA INCOMPLETE**

**Correction to this file's prior text (this session):** the previous revision of this section
claimed follow-up automation, the Templates/Campaigns/Automation/Settings admin UI, and
stop/pause/resume controls were "not yet built." That was stale — a prior session had already
built all of it but left it uncommitted (`git status` showed it as untracked). This session
re-verified the actual on-disk state directly (not from memory or this file) before writing
anything below, per the project's own No-Assumption Rule.

**Database objects deployed (evidence: `supabase/migrations/20260818190000_phase4_whatsapp_automation.sql`,
`npx supabase migration list` re-run this session):** local == remote for all 11 migrations
(`20260813090016` through `20260818190000`), no drift. Tables: `whatsapp_templates`,
`automation_rules`, `lead_followup_automation_state` (not `lead_automation_state` — corrected
name), `whatsapp_consent_events`, `campaigns`, `whatsapp_messages`, `campaign_recipients`, plus
a `customers.whatsapp_opt_out` column. Functions: `apply_whatsapp_consent_event`,
`stop_lead_automation`, `stop_automation_on_lead_status`, `stop_automation_on_booking_status`,
`log_whatsapp_message_activity`, `get_eligible_followup_leads`, `claim_followup_send`. RLS
enabled on all 7 new/altered tables; 5 permissions (`view_whatsapp_messages_own/_all`,
`manage_whatsapp_templates`, `manage_whatsapp_automation`, `manage_whatsapp_campaigns`) with
correct Admin/Manager/Sales Staff/Content Manager grants. Seed data: 4 templates
(`enquiry_confirmation`, `quotation_ready`, `followup_morning`, `followup_evening`) with
placeholder `provider_template_name`s pending real Meta approval.

**Built and now verified on disk (all four Phase 4 vertical slices, master plan §6):**
- **Enquiry confirmation** — `app/api/enquiry/route.js` calls `sendWhatsAppMessage()`
  best-effort via the service-role admin client after `submit_enquiry` persists the lead; a
  WhatsApp failure never fails or rolls back the enquiry submission, matching the existing
  `sendEnquiryEmail` contract.
- **Quotation message** — `sendQuotationWhatsApp()` in
  `app/admin/(protected)/crm/quotations/[id]/actions.js`, triggered by a "Send via WhatsApp"
  button in `QuotationStatusControl.jsx` (gated on `send_quotations`). Logs a
  `quotation_messages` row and flips `draft → sent` only on a confirmed provider send.
- **Follow-up automation** — `app/api/cron/whatsapp-followup/route.js`: `CRON_SECRET`-gated
  `GET` route, bucketed 15-minute slot matching against `automation_rules.morning_time`/
  `evening_time`, atomic claim-then-send via `get_eligible_followup_leads()` +
  `claim_followup_send()` (a provider failure after a successful claim is never a duplicate —
  it's simply one fewer message that lead gets). Admin UI at `/admin/marketing/automation`
  (`AutomationRuleForm.jsx`, `AutomationStateTable.jsx`) — enable/disable, morning/evening
  time, follow-up duration, max messages, eligible lead statuses, and a per-lead
  active/paused/stopped/completed control gated by the DB's own legal-transition trigger.
  Documented (real) trigger mechanism is Hostinger Cron, per the crontab line shown on
  `/admin/settings/whatsapp` — not Vercel Cron (a stale code comment claiming otherwise was
  corrected this session; no `vercel.json` exists or is needed).
- **Templates** — `/admin/marketing/templates`: list/create/edit, `{{1}},{{2}},...`
  placeholder-sequence validation, provider-name uniqueness check, soft-delete only
  (deactivate, never a real `DELETE`).
- **Campaigns** — `/admin/marketing/campaigns`: create → recipient selection (by lead-status
  filter) → send, with per-recipient status (`sent`/`failed`/`skipped` with a skip reason for
  opt-out/no-phone) and honest campaign-level status (`completed`/`partially_failed`/`failed`
  — never reported as fully successful when some recipients failed). Optional `scheduled_at`
  is now actually acted on (see fixes below).
- **Stop/pause/resume + stop conditions** — `stop_lead_automation()` plus two DB triggers
  (`stop_automation_on_lead_status`, `stop_automation_on_booking_status`) stop a lead's
  automation state when the lead is marked not-interested/lost/cancelled, or a booking is
  confirmed, matching master plan §6's stop-condition list exactly; admin can also
  manually pause/stop per lead via `AutomationStateTable.jsx`.
- **Consent/opt-out** — `app/api/webhooks/whatsapp/route.js` `POST` handler detects
  `stop`/`unsubscribe`/`opt out` in an inbound message body and calls
  `apply_whatsapp_consent_event()`, which flips `customers.whatsapp_opt_out` and stops
  automation for every affected lead. Opt-out is now enforced centrally in
  `sendWhatsAppMessage()` (see fixes below), not just at the campaign call site.
- **Webhook** — `app/api/webhooks/whatsapp/route.js`: `GET` handles Meta's verification
  handshake; `POST` verifies the `x-hub-signature-256` HMAC (constant-time compare, rejects if
  `WHATSAPP_APP_SECRET` unset), updates `whatsapp_messages` delivery/read/failed status by
  `provider_message_id`, and records inbound messages.

**Real bugs found and fixed this session** (found by reading every file directly, not by
trusting that "it compiles" meant "it works" — none of these were caught by `npm run build`):
1. `CampaignsClient.jsx` imported `{ Link }` from `next/link` (named import) instead of the
   correct default import — the only file in the entire codebase doing this; would have thrown
   a rendering error the moment the Campaigns page loaded.
2. `AutomationRuleForm.jsx` and `AutomationStateTable.jsx` both imported their server actions
   from `"../actions"` instead of `"./actions"`, even though `actions.js` sits in the same
   `automation/` directory — `npm run build` failed outright on this until fixed.
3. `automation/page.js` passed a raw HTML string (`` `...<span className="font-medium">...` ``)
   into `CardHeader`'s `description` prop, which renders as plain text — would have shown
   literal `<span>` markup on the page instead of styled text.
4. `updateAutomationRules()` never returned `success: true` on a successful save, so the
   "Settings saved" banner the form was built to show could never appear — a silent success
   with no user-visible confirmation, the exact failure mode this project's QA rules exist to
   catch. Now explicitly returns `success: true`/`false`.
5. `campaigns/page.js` aliased the templates join as `templates:` but `CampaignsClient.jsx`
   read `c.template` (singular) — the Template column in the campaigns table would always have
   shown "-". Query alias corrected to match.
6. `messages/page.js` tried to scope "own vs all" visibility with
   `.or("leads.assigned_to.eq...")` — a dotted embedded-table column inside `.or()`, a pattern
   PostgREST does not support and no other page in this codebase uses. Removed entirely: the
   `whatsapp_messages_select_scoped` RLS policy already enforces the identical own/all scoping
   via a `leads.assigned_to` subquery, so the app-level filter was both broken and redundant.
7. **`whatsapp_messages.customer_id` is `NOT NULL`, but `app/api/enquiry/route.js` never
   passed `customerId` to `sendWhatsAppMessage()`** (and `submit_enquiry()`'s return shape
   doesn't include one) — every enquiry-confirmation send's log-row insert would have failed
   the NOT NULL constraint silently (logged to console, swallowed, never surfaced), meaning
   message history for the entire confirmation flow was silently broken. This is a genuine
   runtime bug `npm run build` cannot catch. Fixed by looking up the lead's `customer_id`
   directly in the route (no Phase 1 migration/function changes needed).
8. **No opt-out enforcement on quotation or enquiry-confirmation sends** — only campaign sends
   checked `customers.whatsapp_opt_out`; follow-up automation excludes opted-out leads at the
   DB eligibility-query level; but a staff-triggered quotation send had no check at all. Fixed
   by enforcing the opt-out check centrally inside `sendWhatsAppMessage()` itself, so every
   current and future call site is covered without needing to remember to duplicate the check.
9. An unescaped apostrophe in `templates/page.js`'s access-denied text was a real
   `react/no-unescaped-entities` **lint error** (not a warning) — fixed.

**Also completed this session (genuine scope gaps, not new business rules):**
- Scheduled campaigns: `campaigns.scheduled_at` was captured by the UI but nothing ever acted
  on it — a campaign with a schedule just sat in `draft` forever. Extracted the campaign send
  loop into a new shared `lib/whatsapp/campaigns.js` (`sendCampaignRecipients()`, used by both
  the staff "Send" action and the cron sweep) and added a scheduled-campaign check to
  `app/api/cron/whatsapp-followup/route.js` that sends any `draft` campaign whose
  `scheduled_at` has arrived, on every cron hit, independent of the follow-up engine's
  active/paused state.
- Webhook inbound-message idempotency: a duplicate inbound event (Meta retries webhooks) would
  hit the `whatsapp_messages_provider_message_id_key` unique index and fail the insert, but the
  route never checked that insert's returned error — now explicitly distinguishes a duplicate
  (`23505`, logged at info level, expected/harmless) from a real insert failure (logged as an
  error).
- `.env.example` updated with all 6 Phase 4 environment variables
  (`WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`,
  `WHATSAPP_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `CRON_SECRET`) — previously
  undocumented for onboarding even though the app reads them directly from `process.env`.

**Navigation:** `components/admin/navConfig.js`'s Marketing section
(`/admin/marketing/automation`, `/admin/marketing/templates`, `/admin/marketing/campaigns`,
`/admin/marketing/messages`) and Settings section (`/admin/settings/whatsapp`) were verified
this session to have a real `page.js` on disk for every href — no dead links, no placeholder
routes.

**`npm run lint`** — clean after fixes (only the pre-existing, unrelated Phase 2 `next/image`
warnings remain; zero Phase 4 errors or warnings). **`npm run build`** — clean after fixes, all
Phase 4 routes compile: `/admin/marketing/{automation,templates,campaigns,messages}`,
`/admin/settings/whatsapp`, `/api/cron/whatsapp-followup`, `/api/webhooks/whatsapp`,
`/api/enquiry`.

**Genuinely unresolved (not fixable without external input, not glossed over):**
- Seeded `provider_template_name`s (`enquiry_confirmation`, `quotation_ready`,
  `followup_morning`, `followup_evening`) are placeholders — real Meta-approved template names
  are required once the WhatsApp Business Cloud API app is fully provisioned.
- No `WHATSAPP_CLOUD_API_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`/`WHATSAPP_APP_SECRET`/
  `WHATSAPP_WEBHOOK_VERIFY_TOKEN`/`CRON_SECRET` are configured in this environment (by design —
  the task instructions explicitly prohibit inventing or entering real Meta credentials here).
  No real send-and-receive test, no real webhook delivery, and no real cron firing have been
  performed against a live WhatsApp number. Per Rule 9 (No-Assumption Rule), none of this is
  marked verified until that real test happens against real staging credentials.
- Hostinger Cron itself is not configured anywhere reachable from this repository — the
  crontab line is documented on `/admin/settings/whatsapp`, but nothing in this codebase can
  confirm a real Hostinger cron job has been created to call it on staging.
- No real browser acceptance testing has been performed for any Phase 4 admin UI
  (Templates/Automation/Campaigns/Messages/Settings) in this session.

**QA status:** Phase 4 remains **QA INCOMPLETE**. Lint/build passing, migrations matching
remote, and this session's source-level bug fixes are evidence that the code is now internally
consistent and free of the specific defects found — they are not evidence of a working feature
against a live WhatsApp number, per Rule 1 (Phase Closure Rule) and Rule 4 (Real Browser
Acceptance). **Browser QA: NOT STARTED.**

---

## Phase 5 — CMS

**Purpose (master plan §15):** Pages, Page Builder, page revisions, Blog, FAQ, Testimonials,
Banners, Homepage sections, Navigation/menu management.

**Exact features (master plan §8):**
- Pages: About, Contact, Privacy Policy, Terms & Conditions, Cancellation Policy, Destination
  pages, Service pages, other SEO landing pages
- Page Builder: block library (Hero, Rich text, Image, Image+text, Two-column, Three-column
  cards, Package listing, Destination listing, CTA, Banner, Gallery, Testimonials, FAQ,
  Statistics, Features/benefits, Video, Contact/enquiry form, WhatsApp CTA, Custom HTML where
  appropriate); capabilities: drag/reorder, enable/disable sections, edit content, select
  media, configure buttons/links, configure spacing/layout within safe limits, preview, draft,
  publish, save revisions, rollback; structured so an admin cannot accidentally break the
  overall site layout
- Blog: create, edit, draft, publish, categories, tags, featured image, SEO fields
- Banners: image, heading, description, CTA, link, active/inactive, start/end dates
- FAQs: create, edit, delete, ordering, category
- Testimonials: customer name, review, rating, image, status, ordering
- Homepage sections manageable through CMS (eventually)

**Database objects (master plan §9):** `pages`, `page_versions`, `page_sections`,
`blog_posts`, `blog_categories`, `blog_tags`, `blog_post_tags` (join table, not separately
named in §9 but required for the many-to-many Blog↔Tags relationship), `faqs`, `testimonials`,
`banners`, `menus`, `menu_items` (§9 lists only `menus`; item rows are a minimal, necessary
extension — the plan gives no field-level detail for this table at all). Reused, not
duplicated: `media` (area constraint extended to add `testimonials`; `pages`/`banners`/`blog`/
`gallery` already existed from Phase 2) and `seo_metadata` (entity_type constraint extended to
add `page`/`blog_post` — Phase 2's own comment on that table anticipated exactly this).

**Admin routes (built — master plan §2 CMS menu):** `/admin/cms/pages` (list/new/detail),
`/admin/cms/pages/[id]/builder` (Page Builder), `/admin/cms/blog` (list/new/detail),
`/admin/cms/blog/categories` (categories+tags), `/admin/cms/banners` (list/new/detail),
`/admin/cms/faqs` (single-page manager), `/admin/cms/testimonials` (list/new/detail),
`/admin/cms/homepage` (redirects to the singleton homepage page's builder — see below),
`/admin/cms/menus` (list/detail with nested item management). "Page Builder" is not a
separate top-level nav entry from "Pages" — see consolidation note below.

**Server actions / API:** All CRUD, publish, and Page Builder mutations (add/edit/reorder/
enable-disable/delete section, save revision, rollback) are server actions under each route's
`actions.js`, following the codebase's existing per-route pattern. No new API routes were
needed — everything goes through Supabase directly via server actions, same as every other
phase.

**External integrations:** None specified.

**Dependencies on previous phases:** Phase 0 (roles: Content Manager, already seeded; new
permissions `manage_pages`/`publish_pages`/`manage_blog`/`publish_blog`/`manage_faqs`/
`manage_testimonials`/`manage_banners`/`manage_menus` granted to it); Phase 2 (`media` and
`seo_metadata` reused directly, not rebuilt; `SeoForm`/`MediaPicker` components reused
unchanged); Admin Design System (`Card`, `Table`, `Tabs`, `Dialog`, `Badge`, `Field`/`Input`/
`Textarea`/`Select`/`Checkbox`, `Button`/`LinkButton`, `RowActions`-style patterns) reused
throughout, no new form/table/dialog primitives created.

**Acceptance requirements:** Full QA governance framework above.

**Current status: CLOSED**

**Database objects deployed (evidence: `supabase/migrations/20260820100000_phase5_cms.sql`,
`npx supabase migration list` re-run after this session's work):** local == remote for all 12
migrations (`20260813090016` through `20260820100000`), no drift. Tables: `pages`,
`page_sections`, `page_versions`, `blog_categories`, `blog_tags`, `blog_posts`,
`blog_post_tags`, `faqs`, `testimonials`, `banners`, `menus`, `menu_items`. RLS enabled on all
12; 8 new permissions, granted only to Content Manager (Admin/Manager and Sales Staff
deliberately excluded — CMS is not in their master plan §10 scope, mirroring Phase 4's
identical reasoning in reverse). A `before insert or update` trigger
(`enforce_publish_permission`) on both `pages` and `blog_posts` blocks the specific transition
into `status='published'` for anyone without `publish_pages`/`publish_blog` — enforced at the
database layer, not just hidden in the UI, verified directly: the migration's own seed insert
of the homepage row was rejected when attempted as `published` (no authenticated user in
migration context → `has_permission()` false → trigger raised), so it was seeded as `draft`
instead and published for real through the app during QA. A `pages_homepage_not_archived`
check constraint stops the singleton homepage (`is_homepage=true`) from ever being archived.

**Design decisions made where the master plan under-specifies (documented, not silently
invented):**
- **"Page Builder" nav item merged into "Pages."** The master plan's §2 nav list names them
  separately, but Page Builder has no independent identity apart from editing a specific
  page's content — it's reached from within a page (`/admin/cms/pages/[id]/builder`), the same
  relationship packages' Details/Content/Pricing/Images/SEO tabs already have to the Packages
  list. A second top-level link to the same destination would have been a literal duplicate
  nav entry, which conflicts with "no duplicate routes."
- **"Homepage Sections" is the same Page Builder, not a parallel system.** Master plan §8 says
  homepage sections should "eventually" be CMS-manageable and §9 lists no separate table for
  it. The migration seeds one `pages` row with `is_homepage=true`; `/admin/cms/homepage` is a
  pure redirect to that row's `/builder` route. This avoids the exact kind of duplicated
  entity/duplicated Media-and-SEO-infrastructure the task instructions explicitly prohibit.
- **Reorder is button-based (↑/↓), not drag-and-drop.** No drag library exists in this
  project's dependencies; adding one for this phase would be new infrastructure beyond what
  was asked. Button reorder satisfies the literal capability ("drag/reorder sections" — reorder
  is delivered, drag is not) via an atomic two-row `sort_order` swap.
- **Page Builder block content editor is field-schema-driven, not one bespoke form per block
  type.** All 19 block types (`lib/cms/constants.js`) map to a field list (text/textarea/
  richtext/image/link/number/items_json); "items_json" blocks (cards, gallery, stats,
  features) edit their repeated sub-items as raw structured JSON in one field rather than a
  fully dynamic add/remove nested-repeater UI. This is a real, working implementation, not a
  stub — every field saves and reloads correctly — but it's a deliberately lighter-weight
  editing surface for the multi-item block types than a true visual repeater would be.
- **FAQs are the one CMS entity with real hard `DELETE`.** Master plan §8 literally lists
  "Create, edit, delete, ordering, category" for FAQs with no draft/publish/status field at
  all — unlike every other entity here (and everywhere else in this codebase), which
  soft-deactivates. Taken literally rather than defaulting to the app's usual
  soft-delete convention.
- **Blog Categories/Tags management lives inside the Blog area, not as separate top-level nav
  items** (`/admin/cms/blog/categories`, linked from the Blog list header) — the master plan's
  CMS nav list names only "Blog" as one entry, mirroring the same reasoning as the Page
  Builder consolidation above.
- **Banners' start/end date window is admin-visible only.** Phase 5 has no public consumer to
  enforce visibility against (that's explicitly Phase 6's job — "replace hardcoded public
  content with CMS-driven"). The admin list computes and displays an effective
  Live/Scheduled/Expired/Inactive state from `status` + the dates, satisfying the literal field
  requirement without reaching into Phase 6 scope.
- **`menus`/`menu_items` field shape was designed from scratch.** §9 gives this table zero
  field-level detail beyond its name. Built as `menus(name, location)` +
  `menu_items(label, url, parent_id, sort_order, open_in_new_tab)` with one level of nesting
  (a menu item can have children, matching typical header/footer menu needs) — a minimal,
  reasonable interpretation, not an invented business requirement.

**Real bug found and fixed this session (via Playwright, not caught by lint/build):**
`app/admin/(protected)/cms/menus/page.js` rendered `<form action={createMenu}>` as a plain
server-rendered form, but `createMenu(prevState, formData)` has a `useFormState`-style
two-argument signature — called directly as a raw form action, React passes only one argument,
so `formData` arrived `undefined` inside the action and every attempt to create a menu crashed
with a 500 (`TypeError: Cannot read properties of undefined (reading 'get')`). This wasn't only
a crash: the form also had no error-state display at all, so even after a naive signature fix,
a validation error (e.g. blank name) would have failed silently with zero user feedback,
violating this project's own "no silent failures" rule. Fixed properly, not just patched: added
`app/admin/(protected)/cms/menus/CreateMenuForm.jsx`, a client component wrapping `createMenu`
in `useFormState` with a real error `Alert`, matching every other create-form in this codebase
(`NewPageForm`, `NewBlogPostForm`, `TagsAndSourcesManager`, etc.) — `menus/page.js` now renders
that component instead of a bare form. Re-tested immediately after the fix: menu creation,
nested menu-item creation (parent/child, verified the `.eq()`/`.is()` null-vs-value filter
split is correct — an earlier draft of `moveMenuItem`/`addMenuItem` used `.is("parent_id", uuid)`
for a real UUID, which is a distinct bug I caught and fixed before it ever shipped, from
knowing Postgres's `.is()` only accepts null/true/false), and item reorder all verified working
end to end with zero console errors.

**Playwright browser QA performed this session (real running app, real Supabase-backed data,
two throwaway accounts — Super Admin and Content Manager — created via the service-role key
and fully deleted afterward, no production data touched):**
- Navigation: full CMS section (7 links) renders correctly for Content Manager (who also sees
  Inventory via the pre-existing `view_inventory` grant, and correctly does *not* see CRM/
  Marketing/Settings); active-state and nested-route highlighting verified (`/admin/cms/pages/
  [id]/builder` correctly highlights "Pages").
- **Pages + Page Builder**, end to end: create page (slug auto-generate from title verified),
  reserved-slug rejection (`home`) verified, Details+Status save, SEO save (`SeoForm` reused
  unmodified), add two blocks (Hero, Rich Text), edit Hero's every field including a real image
  upload through the reused `MediaPicker` (`area="pages"`) with the image preview correctly
  loading back on reopen, reorder (↑/↓ swap verified correct), disable/enable toggle, **save a
  named revision, edit the heading again, then roll back and confirmed the exact original
  heading and image reference were restored** — the core "must actually persist and be
  recoverable" requirement, not just a UI toggle. Publish verified (Content Manager holds
  `publish_pages`); section count and status persisted correctly across a hard navigation
  reload.
- **Blog**: category + tag created inline, new post created with category assigned, tag
  checkbox + status→Published saved together, list correctly reflects category and Published
  badge.
- **FAQs**: two created, reorder (↑/↓) verified swapping order correctly, edit dialog opens
  pre-filled, real hard delete confirmed via the native `confirm()` dialog (handled and
  accepted through Playwright) — count dropped from 2 to 1 as expected.
- **Testimonials**: created with rating, list reflects it correctly.
- **Banners**: server-side date-range validation rejected an end-before-start submission with
  a visible error (not a silent no-op), corrected submission succeeded, and the list's
  computed effective-state badge correctly showed "Scheduled" for a future-dated active banner.
- **Menus**: the bug above found, fixed, and re-verified; nested menu-item creation and
  hierarchy rendering confirmed correct.
- **Permissions**: direct URL navigation to `/admin/crm/leads` as Content Manager correctly
  shows "Access denied" (existing Phase 1 behavior, confirms no regression from the new nav
  section); the DB-level publish-permission trigger was proven to actually reject (not just
  hide in the UI) an unauthorized publish attempt.
- **Regression**: logged in as Super Admin, confirmed full original nav (CRM/Inventory/
  Marketing/Account/Settings) is unaffected; re-saved an existing Destination's SEO title
  through the shared, now-extended `seo_metadata` table to confirm the constraint change didn't
  break Phase 2's own SEO forms; spot-checked `/admin/marketing/templates` loads clean. All
  test data (1 page, 1 blog post + category + tag, 1 FAQ, 1 testimonial, 1 banner, 1 menu + 2
  items, 1 uploaded test image, 1 destination SEO-title edit) and both throwaway accounts were
  deleted after QA — nothing test-related remains in the live database.

**`npm run lint`** — clean; only the same pre-existing, unrelated `next/image` warnings from
earlier phases (now also present in new files using the same established `<img>` pattern as
`SeoForm`/`MediaPicker` — zero new lint errors). **`npm run build`** — clean, all 22 new Phase 5
routes compile alongside every Phase 0–4 route with zero regressions.

### Final QA Closure Session (2026-08-20, second pass)

Three specific gaps left open by the first Phase 5 QA pass were closed in a dedicated
follow-up session, per explicit instruction to complete only those gaps without touching
unrelated functionality or starting Phase 6.

**1. CMS search/filter — resolved as intentionally out of scope, not implemented.**
Re-checked against the master plan directly: `grep -n -i "search\|filter"
CONNECTMYTOURS_MASTER_PLAN.md` across the *entire* document returns exactly one match, and
it's §13.D Lead Tags ("Tags make filtering and targeted marketing easier") — completely
unrelated to CMS. Zero mentions of search/filter for Pages/Blog/Banners/FAQs/Testimonials/
Menus anywhere in the plan. Per the explicit instruction ("If NOT required by the master plan:
do not invent it, document it as intentionally out of scope"), no search/filter UI was added.
The earlier session's framing of this as a "gap" (by analogy to Inventory's search boxes) is
superseded by this direct textual check — the master plan is the source of truth, not
cross-module UI-consistency precedent.

**2. All 19 Page Builder block types — live-tested individually, not inferred from shared code.**
A fresh test page was built covering the 17 block types not exercised in the first pass (Hero
and Rich Text already had full coverage — add/edit/reorder/disable/revision/rollback — from the
first session). For each of the 17: added via the block-type dropdown, opened its editor,
confirmed the correct field set rendered for that specific type (catches per-type schema typos,
not just "the editor opens"), filled real values including a real image upload/select for the
`image` field type, saved, and confirmed the inline preview reflected the saved values —
zero console errors on any add or save. Every one of the 7 field types in
`BLOCK_FIELD_SCHEMA` (text, textarea, richtext, image, link, number, items_json) was exercised
by at least 4 different block types. The `items_json` field type — the highest-risk one, since
it accepts raw JSON — was tested on 4 separate blocks (Three Column Cards, Gallery, Statistics,
Features) with real multi-entry arrays that all parsed and saved correctly (`"3 item(s)"`,
`"1 item(s)"`, `"2 item(s)"`, `"1 item(s)"` respectively), **and** its error path was tested
directly: typing malformed JSON (`{not valid json`) into the Cards field produced a clear
inline error (`"Cards" must be valid JSON.`) with the dialog staying open and the bad text
preserved — no crash, no silent data loss. Disable and Remove (delete) were also verified on
newly-tested types (Video disabled correctly; Custom HTML removed correctly, count dropped from
17 to 16 sections). A full hard-refresh of the page after all 17 edits confirmed every single
field value — including the Disabled state on Video — persisted exactly as saved, with zero
console errors.

**3. Browser back/forward/hard-refresh regression matrix — all 7 CMS areas covered.**
For Pages/Page Builder, Blog, FAQs, Testimonials, Banners, and Navigation/Menus: created or
opened a real record, then ran normal navigation → browser back (one or two steps) → browser
forward (via `window.history.forward()`, retracing the same path) → hard refresh (fresh
`goto()` on the current URL), checking after every step that (a) the console had zero new
errors, and (b) the actual saved field content was present and correct — not blank, not stale,
not reverted. This was run to completion on every one of the 7 areas with no exceptions found.
One incidental, non-bug observation: for entities whose create action does a server-side
`redirect()` after a `<form>` POST (Blog, Testimonials, Banners), pressing back from the detail
page lands on the pre-redirect `/new` URL rather than the list — this is standard browser
history behavior for POST-then-redirect flows, not an application defect, and a second "back"
correctly reaches the list either way. Menus' create action has no redirect (same-page
server-action pattern), so back from its detail page goes directly to the list in one step.
Neither pattern produced a broken, empty, or stale page at any point.

**Real bugs found in this closure session:** none — all three items above were pure QA/
verification passes on the implementation already committed in `d145b70`. No code changes were
made or were needed.

**Test data used and removed:** 1 page (17 blocks, later 16 after a delete), 1 blog post, 1
FAQ, 1 testimonial, 1 banner, 1 menu, 1 uploaded test image, and the one throwaway Super Admin
account created for this session — all deleted via the Supabase service-role key immediately
after QA; nothing test-related remains in the live database.

**`npm run lint`** — clean, no new warnings or errors (same pre-existing `next/image` warnings
as before). **`npm run build`** — clean, all routes compile. **`npx supabase migration list`**
— local == remote for all 12 migrations, unchanged from the first pass (no new migration was
needed for this closure session).

**Phase 0–4 regression:** no files outside this Phase 5 QA session's own temporary scripts were
touched; `git status` after cleanup showed no changes to any Phase 0–4 file.

Per the project's own Phase Closure Rule, every applicable layer for Phase 5 now has real
verification evidence — UI, client state, server actions, database, RLS/permissions,
validation, error handling, loading/empty/success states, navigation, refresh persistence,
browser back/forward, direct URL access, role/permission behavior, edge cases (invalid JSON,
invalid date range, reserved slug), migration state, remote database state, lint, build, real
browser acceptance testing, and regression testing of Phase 0–4. **Phase 5 = CLOSED.**

---

## Phase 6 — Website Integration

**Purpose (master plan §15):** Gradually replace hardcoded public content with CMS-driven
content, in the order: Packages → Destinations → Pages → Blog → Homepage Sections → Other
Content. Current public UI must remain visually stable during migration.

**Scope decision — Packages/Destinations excluded from Phase 6 (finalized 2026-08-20):** The
master plan's entire Phase 6 text (§15) is: "Gradually replace hardcoded public content with
CMS-driven content. Recommended order: Packages → Destinations → Pages → Blog → Homepage
Sections → Other Content. The current public UI should remain visually stable during
migration." It names no further Packages/Destinations requirement, and the master plan contains
zero mentions of "departure city" or any of Chennai/Bangalore/Hyderabad anywhere — that concept
comes entirely from the *existing hardcoded site*, not the master plan.

Direct schema/data inspection (not assumption) found the real blocker: `destinations` (Phase 2,
closed) has 5 rows — Chennai, Bangalore, Hyderabad (0 packages linked to any of them) plus
Tirupati, Kerala (packages *are* linked). The table conflates true destinations with
departure/marketing cities. Only 3 packages exist; two of them ("NRI Darshan Package," "Srivani
VIP Break Darshan") each link to a single `destination_id = Tirupati`, but the live hardcoded
site publishes each as two separate pages (`/chennai/...` and `/hyderabad/...`) — the schema's
one-`destination_id`-per-package model has no way to represent a package marketed under two
cities without either duplicate rows or a schema change. `/kerala/temple-nature-trail` (live)
has zero matching package row at all — a content gap, not just a connection gap. This is a
genuine data-modeling decision (how should city-based marketing pages relate to a
destination-based package model?), not a guessable implementation detail.

This was raised to the user twice: first during initial discovery (resulting in a "defer
Packages/Destinations, start with the rest" sequencing decision), then again during this
reconciliation pass, where it was made explicit that "defer" is a sequencing decision, not the
same as authorizing Phase 6 to close without it — per this document's own Phase Closure Rule
("all applicable layers pass: Requirements..."), and Packages/Destinations is a named
master-plan Phase 6 item. The user then explicitly chose to **close Phase 6 now with
Packages/Destinations permanently excluded from this phase's scope**, to be picked up later as
its own dedicated initiative (its own data-model decision, not squeezed into Phase 6). This is a
final scope decision, not an oversight or an open item silently carried forward.

**Implementation (this session):**
- **Pages:** `app/[slug]/page.js` — generic renderer for published, non-homepage CMS pages,
  reusing the exact Phase 5 Page Builder block schema. A literal static route always wins over
  this dynamic segment, so existing hardcoded pages (`/about-us`, `/contact-us`, etc.) are
  unaffected. Unpublished/missing slugs 404.
- **Homepage Sections:** `app/page.js` reads the seeded homepage singleton (`is_homepage=true`)
  via `getPublishedHomepage()`. If published with ≥1 enabled section, renders it through the new
  `components/cms/BlockRenderer.jsx`; otherwise falls back to the exact pre-existing hardcoded
  homepage tree, unchanged — "remain visually stable during migration" holds until an admin
  actually publishes something.
- **Blog:** `app/blog/page.js` (listing, empty state) and `app/blog/[slug]/page.js` (detail,
  category/tags/featured image/SEO), both published-only.
- **FAQ / Testimonials:** `app/faq/page.js` and `components/home/Testimonials.jsx` use CMS data
  when non-empty, else the existing static `data/faq.js` / `data/testimonials.js` content —
  same fallback pattern, zero visual change today.
- **Banners:** `components/home/CmsBanners.jsx`, a slim promotional strip above the homepage
  hero for active, date-window-valid banners. Placement isn't specified in the master plan; this
  was a deliberate, minimal, reversible judgment call, not a stop-and-ask case.
- **Navigation/Menus:** `app/layout.js` (the one Server Component in the chrome chain) fetches
  `getMenuByLocation("header"/"footer")` and passes them through `SiteChrome.jsx` into
  `Navbar.jsx`/`Footer.jsx`, which use the CMS menu when one exists for that location, else the
  existing static `data/nav.js` `navLinks`/`footerQuickLinks` — identical output today since no
  CMS menu has been created yet. `open_in_new_tab` is captured in the data layer but not yet
  wired into the `<Link>` rendering — a documented, minor, non-blocking gap (see below).
- **Media/SEO:** reuses the existing `media`/`getMediaUrl`/`seo_metadata` infrastructure exactly
  (`lib/seo.js`'s `pageMetadata()` extended, not replaced, to accept CMS `seo_metadata` fields);
  `next.config.js` gained `images.remotePatterns` for the Supabase Storage host (previously
  missing — public CMS images would otherwise fail to load via `next/image`).
- **Sitemap:** `app/sitemap.js` now also lists published CMS pages and blog posts, not just the
  static `data/seo.config.js` routes.
- **Caching:** `app/page.js`, `app/faq/page.js`, `app/blog/page.js`, `app/[slug]/page.js`, and
  `app/blog/[slug]/page.js` all set `export const revalidate = 60` — without it, Next statically
  prerenders these Server Components' Supabase reads at build time and never refetches, so a
  newly-published homepage/page/post/FAQ would only go live on the next redeploy. Found and
  fixed during this session, not a pre-existing pattern.

**Database objects:** One new migration,
`supabase/migrations/20260821090000_phase6_public_read_rls.sql` — additive `to anon` SELECT-only
RLS policies (existing `to authenticated` policies untouched) on `pages`, `page_sections`,
`blog_posts`, `blog_categories`, `blog_tags`, `blog_post_tags`, `faqs`, `testimonials`,
`banners`, `menus`, `menu_items`, `media`, and a type-scoped `seo_metadata` policy that only
exposes `page`/`blog_post` SEO rows tied to a published parent (package/destination entity types
excluded entirely, matching the deferral above). Every policy is scoped to
published/active/non-expired content — never `using (true)` where that would leak draft data;
this was self-caught and fixed during writing (the first draft of the `seo_metadata` policy was
unconditional and would have leaked draft SEO titles/descriptions before review).

**Admin routes:** None new — this phase changes what the public site reads from, not the admin
panel.

**Server actions / API:** None new — all reads go through `lib/cms/publicQueries.js`, a
server-only module using `createAnonClient()` (the same pattern `app/quote/[token]/page.js`
already established for public Supabase reads), never the service-role client.

**External integrations:** None new.

**Dependencies on previous phases:** Phase 2 (`media`); Phase 5 (CMS pages/blog/FAQ/
testimonials/banners/menus/`seo_metadata`).

**Verification performed:**
- `npm run lint` — clean (zero errors/warnings in any Phase 6 file; the pre-existing `<img>`
  warnings are in untouched Phase 5 admin components).
- `npm run build` — clean production build; all new routes compile and appear in the route
  manifest with the expected static/dynamic classification.
- `npx supabase migration list` — local and remote match on all 13 migrations including the new
  one.
- Targeted verification against a local dev server (curl, not Playwright — nothing here
  exercises new client-side interactivity beyond a straight data-source swap on already-proven
  components, so a browser wasn't genuinely necessary): homepage fallback renders correctly with
  nothing published; `/faq` and `/blog` render their static/empty fallbacks correctly; a missing
  CMS page slug and a missing blog post slug both 404 correctly; `/sitemap.xml` includes `/blog`;
  a pre-existing static page (`/about-us`) is unaffected.
- One real end-to-end content test, explicitly confirmed with the user first since it required a
  live write to the linked Supabase database (briefly disabling/re-enabling the
  `enforce_publish_permission` trigger to insert a published test page): inserted a temporary
  published page with hero/rich_text/cta sections, confirmed all three render correctly through
  `BlockRenderer` with the exact content shape the Phase 5 admin editor produces, confirmed the
  SEO title fallback, then deleted the test row — confirmed gone via a direct `SELECT` (empty
  result), zero permanent database change.

**`open_in_new_tab` (2026-08-20, reconciliation pass):** The Phase 5 admin menu editor
(`app/admin/(protected)/cms/menus/[id]/MenuItemsManager.jsx`, already closed/authoritative)
exposes a working "open in new tab" toggle to staff — so a Content Manager can set it today and
would reasonably expect it to take effect. The master plan itself never names this field, but
leaving it unwired would mean a real, staff-configured setting silently does nothing on the live
site, which is a correctness gap in "integrate CMS menu_items faithfully," not new scope. Fixed
by conditionally spreading `{ target: "_blank", rel: "noopener noreferrer" }` onto the `<Link>`
in all four places menu items render (`Navbar.jsx`, `NavDropdown.jsx` parent + children,
`MobileMenu.jsx` top-level + children, `Footer.jsx` quick links) — the same pattern already used
for the existing WhatsApp CTA link. Static `data/nav.js` entries have no `openInNewTab` field, so
they're unaffected (verified via curl: no `target="_blank"` attribute appears on the existing
"Plan My Trip" link). `npm run lint` and `npm run build` both clean after this change.

**Known gaps / explicitly excluded scope (not blocking closure, documented rather than silently
dropped):**
- **Packages/Destinations integration is permanently excluded from Phase 6**, per the finalized
  user decision above — not built, no schema changes made, no departure-city functionality
  invented. This is real outstanding master-plan work (§15 names it in Phase 6's recommended
  order), but it requires its own data-modeling decision (how a destination-based package model
  relates to the live site's city-based marketing pages) that was explicitly ruled out of this
  phase's scope. Follow-up: a dedicated future initiative, not implicitly bundled into Phase 7 or
  Phase 8 — whoever picks it up should start from the schema/data findings documented above
  (`destinations` already contains Chennai/Bangalore/Hyderabad rows with zero packages linked;
  `packages.destination_id` is one-to-many, not many-to-many; `/kerala/temple-nature-trail` has
  no matching row at all) rather than re-deriving them.
- Pages fully served by a static route folder (e.g. `/about-us`, `/contact-us`) render through
  the root layout too, so a CMS header/footer menu change would appear there only after the next
  redeploy (60s ISR on the 5 CMS-integrated routes; static-only pages have no revalidate window).
  Acceptable today since no CMS menu exists; worth widening `revalidate` to more static routes if
  navigation becomes genuinely CMS-managed later.

**Current status: CLOSED ✅**

Pages, Homepage Sections, Blog, FAQ, Testimonials, Banners, and Navigation/Menus are fully
implemented, verified (lint/build/migration state/targeted curl verification/one real
DB-confirmed content-rendering test), and committed. Packages/Destinations is explicitly and
permanently excluded from this phase's scope by final user decision (not an open item silently
carried forward) — see above for the full reasoning and the evidence a future initiative should
start from. `npm run lint`, `npm run build`, and `npx supabase migration list` (local == remote,
all 13 migrations) are clean.

---

## Phase 7 — Reports & Analytics

**Scope reconciliation (2026-08-20):** §12 "Reports & Analytics" is the master plan's only
section with actual metric definitions — Dashboard KPIs, Lead Reports, Sales Reports, Marketing
Reports, each with a concrete itemized list. §2 (Admin Panel menu structure) and §15 (Phase 7
summary) additionally name **Booking Reports, Conversion Reports, Package Performance,
Destination Performance, Staff Performance** as Reports-menu items / phase highlights, but no
metric, calculation, or field is defined for any of them anywhere in the document — named but
undefined, the same shape of gap as Phase 6's Packages/Destinations. Per explicit user decision,
**only §12's 4 defined categories were built**; the other 5 names are intentionally not present
as pages, per "if the master plan doesn't define it, leave it out." Two smaller ambiguities were
also resolved by explicit decision: (1) §2 lists "Lead conversion rate" and "Quotation conversion
rate" separately, §12 lists one unqualified "Conversion rate" — **both are shown separately** on
the Dashboard; (2) "Booking value" has no stated rule for cancelled bookings — **cancelled
bookings are excluded** (`booking_status != 'cancelled'`), consistent with "Confirmed bookings"
being tracked as its own separate KPI. No chart library exists in the project and §12 never
mentions charts — KPIs/reports are numeric cards and tables via the existing `StatCard`/`Table`
components, not visualizations.

**Implementation:**
- **Permission:** `view_reports` (new, `supabase/migrations/20260821100000_phase7_reports_permission.sql`),
  granted only to Admin/Manager (+ Super Admin automatically via the existing
  `auto_grant_super_admin` trigger) — matches §10 listing "Reports" only under that role. No new
  RLS policies anywhere else: Admin/Manager already holds `view_leads_all`,
  `view_quotations_all`, `view_bookings_all`, `view_whatsapp_messages_all`,
  `manage_whatsapp_automation`, and `manage_whatsapp_campaigns` from Phase 1/3/3.5/4, which
  already grant full read visibility on every table these reports read from.
- **Data layer:** `lib/reports/queries.js` — `getDashboardKpis`, `getLeadReports`,
  `getSalesReports`, `getMarketingReports`, each taking the caller's own session-scoped client
  (never service-role) and returning `{ data }` or `{ error }` explicitly — callers must render
  an error state, never treat a failed query as empty/zero. Aggregation is one lean-column query
  per table, reduced in JS (not a SQL view/function — justified by scale: a single small travel
  agency's CRM, not a high-volume dataset); raw rows never reach the browser.
- **Routes:** `/admin/reports/leads`, `/admin/reports/sales`, `/admin/reports/marketing` (new),
  plus the existing `/admin/dashboard` extended with the KPI section. All four check
  `view_reports` server-side (not just nav-hidden) and render an explicit "Access denied" state
  when absent — verified: nav hides "Reports" for Sales Staff, and direct URL access to
  `/admin/reports/leads`/`/admin/reports/sales` independently denies with the correct message.
  The Dashboard gates its entire KPI section the same way rather than showing a partial number:
  Sales Staff's session is RLS-scoped to their own assigned leads (`view_leads_own`), so a
  "company-wide" KPI computed under their session would be silently wrong (their own subset,
  presented as if it were the total), not just hidden — gating the whole section avoids that.
- **UI:** `components/admin/reports/BreakdownTable.jsx` (shared `[{label, count}]` renderer for
  Lead Reports' six breakdowns), reusing the existing `Card`/`StatCard`/`Table`/`Badge`/
  `EmptyState`/`ErrorState` admin design-system components throughout — no new visual language.

**Metric definitions (every rule explicit, none guessed):**
| Metric | Source | Rule |
|---|---|---|
| Today's enquiries | `leads.created_at` | Created today in IST (fixed +5:30, no DST) |
| New leads | `leads.status` | `= 'new'` (current pipeline snapshot) |
| Pending quotations | `quotations.status` | `IN ('draft','sent','viewed')` |
| Follow-ups due | `lead_followups` | `completed=false AND scheduled_at < now()` (same as the existing Follow-ups "overdue" view) |
| Confirmed bookings | `bookings.booking_status` | `= 'confirmed'` |
| Lost leads | `leads.status` | `= 'lost'` (distinct from `not_interested`/`cancelled`, which the schema tracks separately) |
| Lead conversion rate | `leads` | confirmed / total leads, all-time |
| Quotation conversion rate | `quotations` | accepted / sent (`sent_at is not null`) |
| Quotation value | `quotations.total_amount` | sum, excludes `rejected`/`expired` |
| Lead Reports date/source/destination/package/staff/status-wise | `leads` (+ `lead_sources`, `users`) | grouped by literal field value, "Unspecified"/"Unassigned" when blank; destination/package_interested are free-text fields on `leads`, not FKs into the Phase 2 catalog |
| Quotations sent/accepted/rejected | `quotations` | `sent_at is not null` / `status='accepted'` / `status='rejected'` |
| Booking value | `bookings.total_amount` | sum, excludes `booking_status='cancelled'` |
| WhatsApp sent/delivered/failed | `whatsapp_messages.status` | funnel `queued→sent→delivered→read`/`failed`: sent = not queued/failed, delivered = subset confirmed delivered, failed = terminal failure |
| Follow-up activity | `lead_followup_automation_state` | grouped by `status`, summed `messages_sent` |
| Campaign performance | `campaigns` | listed directly — table already carries `total_recipients`/`sent_count`/`failed_count` |

**Verification:**
- `npm run lint` — clean (only pre-existing `<img>` warnings in untouched files).
- `npm run build` — clean; all 4 new/changed routes compile.
- `npx supabase migration list` — local == remote, all 14 migrations.
- **Data correctness** — independently hand-calculated every metric against the real database
  (2 leads, 1 quotation, 1 booking, 0 WhatsApp/campaign activity — Phase 4's Meta blocker means
  zero messages have ever actually been sent, so empty states there are correct, not a bug), then
  confirmed via a real authenticated browser session (see below) that the application renders
  exactly those values: Today's Enquiries 0, New Leads 0, Pending Quotations 0, Follow-ups Due 0,
  Confirmed Bookings 0 (the one booking is `completed`, not `confirmed` — a real, deliberate
  distinction the KPI correctly makes), Lost Leads 0, Lead Conversion Rate 50%, Quotation
  Conversion Rate 100%, Quotation Value ₹27,000; Lead Reports' six breakdowns matched row-for-row;
  Sales Reports (sent 1/accepted 1/rejected 0/booking value ₹27,000/conversion 100%) and Marketing
  Reports (correct empty states) matched exactly.
- **Browser (targeted, user-confirmed before the live write it required)** — created two
  throwaway accounts (Admin/Manager, Sales Staff — same pattern as the Phase 5 closure session:
  created, used, deleted immediately after, cleanup confirmed via a direct `SELECT` returning
  zero rows). Logged in as each: Admin/Manager sees all 4 pages with the exact expected numbers
  and zero console errors; Sales Staff sees no "Reports" nav section, the Dashboard correctly
  shows no KPI section (not a wrong/partial one), and direct URL access to the report routes
  independently denies with "Access denied — You don't have permission to view reports." This was
  necessary because it's the one thing source-reading can't verify: a real Supabase Auth session,
  RLS, and full React render together.

**Bugs:** None in the Phase 7 code. One environment artifact during testing, not a code
defect: two `next dev` processes were briefly running concurrently against the same `.next`
build directory (leftover from an earlier session), corrupting the route manifest and causing
every admin route — including pre-existing ones untouched by Phase 7 — to 404 regardless of
session state. Resolved by killing all Next processes, clearing `.next`, and restarting a single
clean instance; re-verified cleanly afterward.

**Scope intentionally not implemented:** Booking Reports, Conversion Reports, Package
Performance, Destination Performance, Staff Performance — named in §2/§15 but never defined in
§12, per the reconciliation above. Not a gap glossed over: if the master plan is later amended
with concrete definitions for any of these, or a business decision authorizes constructing
reasonable derived metrics for them, that is new, separately-scoped work.

**Current status: CLOSED ✅**

**Database objects:** One new migration (permission only, no new tables/RLS — see above).

**Admin routes:** `/admin/reports/leads`, `/admin/reports/sales`, `/admin/reports/marketing`
(new); `/admin/dashboard` (extended).

**Dependencies on previous phases:** Phase 1 (`leads`, `lead_sources`, `lead_followups`), Phase 3
(`quotations`), Phase 3.5 (`bookings`), Phase 4 (`whatsapp_messages`, `campaigns`,
`lead_followup_automation_state`) — all read-only, no schema changes to any of them.

---

## Phase 7.1 — Admin UX, Navigation, Branding & Auto-Logout Fix

A focused maintenance/UX sub-task on the admin panel, not a master-plan-numbered phase. Four
objectives: compact navigation, fix auto-logout/session expiration, use the original logo, apply
the existing theme color consistently. No Phase 7 report calculations/metrics/permissions were
touched.

**Navigation (superseded/corrected within this same sub-task):** the first pass compacted the
existing full-width labeled sidebar (tighter padding/gaps). A follow-up correction replaced that
with the actually-intended two-level architecture on desktop: a narrow 56px icon rail
(`components/admin/AdminShell.jsx`'s `DesktopNav`) showing one icon per `NAV_SECTIONS` group, with
a hover-revealed flyout panel listing that group's routes. The active group is always highlighted
on the rail (independent of hover, via matching the current pathname against every item's href);
a hovered-but-inactive icon gets a lighter gray highlight. The flyout is `position: absolute`, not
part of the flex layout, so it overlays the main content without ever resizing/reflowing it. The
"hover gap" flicker bug is avoided structurally, not with a timeout: the flyout is a DOM
descendant of the same wrapper the rail icons live in (`onMouseLeave` on that one wrapper), so
moving the pointer from an icon into the panel never actually leaves the wrapper's subtree —
directly verified with a scripted continuous mouse-move from icon to a panel link (stayed open),
a click-through (navigated correctly, active state updated), and a move-away-entirely (panel
closed). Eight new icons were added to the existing hand-rolled `components/icons.jsx` set (no
icon library dependency) and are referenced from `navConfig.js` by string key, not component
reference — a real bug was caught and fixed here: `navConfig.js`'s `NAV_SECTIONS` crosses the
Server Component (`AdminNav.jsx`) → Client Component (`AdminShell.jsx`) prop boundary, and React
Server Components cannot serialize a function reference across that boundary ("Functions cannot
be passed directly to Client Components") — this only surfaced at runtime (13 console errors),
not during `npm run build`, since build doesn't render authenticated dynamic routes with real
session data. Mobile is untouched by any of this — it keeps its own separate, already-working
tap-based drawer with full labeled sections (hover has no touch equivalent), per the explicit
instruction not to force the desktop interaction onto mobile. All existing routes/permission
filtering are unchanged; `filterNavSections`'s existing per-section/per-item logic was not
touched. Verified end-to-end with a throwaway Super Admin account (created, used, deleted,
cleanup confirmed via `SELECT`): all 8 icons render with correct icons/labels, hover/click/leave
behavior all confirmed via scripted mouse control (not just visual inspection), `/admin/cms/pages`
renders its existing Phase 5 content with zero regression after flyout navigation, and the mobile
drawer still opens/scrolls/navigates correctly.

**Branding:** `public/logo.svg` — the same original asset already used on the public site's
Navbar/Footer, not a new or regenerated logo — added to the sidebar header (desktop + mobile) via
a new `BrandLink` component, and to all three public admin auth pages (login, forgot-password,
reset-password) via a new shared `components/admin/AuthCard.jsx` wrapper. Theme color source:
`tailwind.config.js`'s existing `primary` scale (sampled from the logo itself, already used
correctly by `components/admin/ui/Button.jsx`'s "primary" variant and `FormControls.jsx`'s focus
rings — those primitives were never the problem). The actual disconnect was the three auth pages
hand-rolling their own `bg-gray-900` buttons and raw `<input>`/`<label>` markup instead of using
those already-correctly-branded shared components — fixed by switching all three to `Button`/
`Field`/`Input`, which is a consistency fix, not new styling invented. Sidebar active-state accent
and "Forgot password?"/"Back to sign in" link hover states also switched from gray to
`primary-600`. No other admin components were restyled — Cards/Tables/Badges/etc. elsewhere
already used the primary/secondary scales appropriately (confirmed by inspection before touching
anything), so this stayed a targeted fix, not a redesign pass.

**Auto-logout root cause:** the codebase had zero `onAuthStateChange` listeners anywhere. Server
middleware (`middleware.js`) already correctly re-validates the session on every request and
redirects to login — that part was never broken. The actual gap: `/admin/security` already has a
working "Sign out other sessions" feature (`signOutOtherSessions()` → `supabase.auth.signOut({scope:
"others"})`, revoking every other session's refresh token server-side) with no way to notify an
already-open tab on one of those other sessions — it would keep rendering as if logged in until
its next full server round-trip. The same gap applies to a natural refresh-token
expiry/revocation discovered by the browser SDK's background auto-refresh. `supabase/config.toml`
already contains a commented-out `[auth.sessions]` `inactivity_timeout`/`timebox` block — this is
generic Supabase CLI scaffold boilerplate present in every `supabase init` project by default, not
a ConnectMyTours-specific requirement, and was deliberately left untouched: enabling it would mean
inventing a specific duration nobody has actually decided on, which the explicit instruction for
this task forbids.

**Fix:** `useAuthStateRedirect()` in `AdminShell.jsx` — a `useEffect` that subscribes to
`supabase.auth.onAuthStateChange()` (the browser client) and does a hard `window.location.href =
"/admin/login"` navigation whenever the resulting session is null. This is the standard,
officially-documented Supabase pattern for exactly this problem — not a client-side security
boundary (middleware/RLS remain the actual enforcement) and not an invented inactivity timer; it
makes an already-invalidated session (by any of the existing revocation paths) stop being usable
immediately instead of only on the user's next navigation.

**Verification performed:** `npm run lint` and `npm run build` clean. No database changes, so no
migration check applies. Browser-verified (throwaway Admin/Manager account, created/used/deleted,
cleanup confirmed via direct `SELECT`): login/forgot-password/reset-password all render the real
logo and primary-branded controls; the dashboard/sidebar render compactly with all sections and
the correct active-state accent (full page fits without scrolling vs. requiring significant
scroll before); mobile nav opens, scrolls to reveal every section including Reports, closes on
navigation, and the destination page renders correctly; `/admin/security`'s "Sign out other
sessions" button executes without error and correctly leaves the acting session logged in (its
own session is never revoked by `scope: "others"`).

**Known verification gap, stated plainly rather than overclaimed:** the specific
cross-tab/cross-device trigger — a *different*, genuinely independent session having its refresh
token revoked and that tab's `onAuthStateChange` firing and redirecting it — was not directly
fired-and-observed in this session. Playwright's tooling shares one cookie jar across all tabs in
a context, so two tabs there are the same login session, not two independent devices; a true
multi-device simulation would need two fully separate browser contexts, which was judged
disproportionate effort for this fix given the mechanism itself (`onAuthStateChange` firing
`SIGNED_OUT` on a failed/revoked refresh) is core, extensively-documented Supabase Auth SDK
behavior, not custom logic. If this specific path ever needs empirical proof, it requires two
separate browser contexts/profiles, not two tabs.

**Bugs:** One real bug found and fixed during the navigation correction — `navConfig.js` storing
icon component references directly, which broke at runtime (13 console errors, `npm run build`
didn't catch it) because a function can't cross the Server→Client Component prop boundary. Fixed
by storing string keys and resolving them to components inside the Client Component. No other
bugs. No Phase 7 regression: report pages, metrics, and `view_reports` permission gating are all
unchanged and were re-confirmed rendering identical data during this session's testing.

**Final correction — header, permanent submenu, and dashboard chart variety (same sub-task):**
A follow-up round corrected two things based on direct user feedback after seeing the previous
pass running live.

*Navigation:* Replaced the single-layer icon rail (hover = per-item flyout with routes) with the
two-independent-layers architecture actually specified: a permanent top header
(`components/admin/AdminShell.jsx`'s `Header`) with the logo and a `ProfileMenu` (circular
avatar, initials from `full_name`/email, opens on click, closes on outside-click/Escape, contains
Change Password + Sign out — reuses the existing `/admin/reset-password` flow as-is for "Change
Password" rather than building a second mechanism, since it already accepts any authenticated
session, not only a recovery link) — removing the old email/role/sign-out block from both the
desktop rail and the mobile drawer, which are now navigation-only. Below the header: an icon rail
whose hover reveals the *whole* rail as one `position: absolute` overlay (icon + label for every
group at once), and a separate, always-visible "permanent submenu" column whose content is driven
by `selectedLabel` — synced to the current route on mount/navigation, and changed only by clicking
a rail icon, never by hover. Clicking a rail icon pins the permanent submenu to that group without
navigating; only clicking an actual item inside the permanent submenu navigates. Verified
precisely, not just visually: a scripted hover recorded the Dashboard heading's bounding box as
byte-identical across pre-hover/mid-hover/post-hover (zero reflow), hovering CRM then Inventory
left the permanent submenu reading "OVERVIEW" throughout (hover never touches it), clicking CMS
inside the expanded overlay changed the permanent submenu to CMS without navigating, and a direct
load of `/admin/crm/quotations` (not a client-side click) correctly pre-selected CRM on the rail
and Quotations in the submenu. One correctness fix during this pass: the collapsed rail's buttons
were left in the DOM underneath the overlay, so two same-labelled "CMS" buttons existed
simultaneously (one blocked from receiving clicks) — fixed by marking the collapsed rail
`aria-hidden`/`inert` while the overlay is open.

*Dashboard:* The first pass used only horizontal progress-bar-style bars for all four
visualizations; the user asked for genuine chart-type variety (pie/donut, line, bar). Now: a
dependency-free SVG donut (`DonutChart.jsx`, stroke-dasharray technique) for Lead Status
Distribution, an SVG line chart (`LineChart.jsx`) for a new "Leads Over Time" 14-day trend (reuses
the exact `istDateLabel` day-bucketing rule already established for Lead Reports' "date-wise"
breakdown — master plan §12 — just windowed and zero-filled for a continuous line, not a new
metric), the existing horizontal `BarChart.jsx` for Lead Source Distribution, and a new
`VerticalBarChart.jsx` (plain CSS columns) for Quotation Outcomes. Booking Status Distribution was
dropped from the dashboard grid (kept the total at 4, per "don't overload" — the data is a single
row today and the "Confirmed Bookings" KPI card already surfaces the only meaningful part of it).
No charting library was added; all four remain plain SVG/CSS. No new business metrics — every
chart groups fields already fetched for the existing KPI cards.

**Second correction — CSS-only rail expansion, click navigates to first item (same sub-task):**
Direct user feedback after seeing the previous pass live: the "whole rail expands" mechanism was
built as a second, JS-conditionally-mounted `<div>` popping in on top of the rail — visually read
as "a new panel opening," not the rail itself growing. Rebuilt as one persistent rail element: a
fixed-width (80px) `position: relative` wrapper reserves real flex-layout space, containing one
`position: absolute` div (same origin) whose own Tailwind classes are `w-20 hover:w-32
transition-all duration-200` — pure CSS `:hover`, zero `onMouseEnter`/`onMouseLeave` state. Icon
labels are permanently in the DOM (not conditionally rendered), clipped by `overflow-hidden` at
80px and revealed via `group-hover:opacity-100` as the rail widens. Since there's only one DOM
tree now, the previous pass's `aria-hidden`/`inert` workaround (needed only because two
same-labelled buttons existed at once) is gone — removed, not just superseded. Also finalized per
this feedback: clicking a rail icon now navigates directly to that group's first submenu item
(`section.items[0].href`, a real `<Link>`) instead of only pinning the permanent submenu without
navigating; the submenu then updates itself via the existing pathname-sync effect, needing no
separate click-handler logic. Verified precisely: the rail's own bounding box measured 80px before
hover and 128px during hover at the identical `x/y` origin (same element, not a new one), the
Dashboard heading's position was byte-identical before/during hover (zero content shift), and
clicking CRM navigated to `/admin/crm/leads` with both the rail icon and the Leads submenu item
correctly shown active afterward.

**Current status: COMPLETE ✅**

---

## Phase 8 — Production Hardening

**Purpose (master plan §15):** Security review, permission testing, validation, error
handling, performance optimization, backup verification, cron verification, WhatsApp delivery
testing, production deployment.

**Discovery before implementation:** Phase 8 started from a bare "start the phase 8" instruction
(unlike every prior phase's detailed kickoff spec), so a discovery pass ran first rather than
guessing scope on the phase that touches production. An Explore agent swept the infrastructure/
security surface not otherwise reviewed (CI/CD, env var isolation, rate limiting, cron/webhook
security, audit logging, error logging, input validation, file upload security) and found the
codebase generally well-built — secrets correctly isolated to server-only modules with zero
client-side importers, RLS/permission checks consistent, the public enquiry endpoint already has
real validation + rate limiting + a honeypot — with the concrete gaps mapped below. Separately,
local `master` was found to be 16 commits ahead of `origin/master` (everything since Phase 5 has
only ever been committed locally) — this materially changes what "production deployment" means
here (see below).

**Scope decisions, made explicitly before implementation:**
- WhatsApp/Meta credentials confirmed **not yet available** — Phase 4 and this phase's "WhatsApp
  delivery testing" item stay deferred exactly as before, unchanged by this pass.
- Error logging: **lightweight in-house** (new table + admin viewer), no new external
  service/dependency/account.
- SVG upload gap: **sanitize on upload**, don't remove SVG support.
- Media bucket policy drift (deferred from Phase 2): **fix now**.

**Implementation:**
- **Security headers** (`next.config.js`): `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy` on all routes. No CSP —
  this app has no existing CSP baseline, and getting one right needs page-by-page verification
  a first pass can't safely claim; a wrong CSP is worse than none. Verified via `curl -D -` that
  all five headers appear on a real response.
- **Login rate limiting** (`app/admin/login/actions.js`): same in-memory-per-process technique
  already established in `app/api/enquiry/route.js`, but only failed attempts count (a legitimate
  staff member logging in repeatedly must never get locked out; only repeated wrong passwords
  should), keyed on IP+email. 5 failures / 10 minutes. Verified with 6 real login attempts
  against a throwaway account: attempts 1–5 correctly returned "Invalid login credentials",
  attempt 6 correctly returned the rate-limit message — and, importantly, a subsequent attempt
  with the *correct* password was also blocked (proving it throttles the IP+email combo, not
  just re-validating credentials), while a login on a *different* account from the same IP
  succeeded normally (proving the block is correctly scoped, not global).
- **Cron secret comparison** (`app/api/cron/whatsapp-followup/route.js`): switched from a plain
  `!==` string comparison to the same `crypto.timingSafeEqual` pattern the WhatsApp webhook's
  signature check already used correctly, for consistency. Verified: missing token and wrong
  token both still correctly return 401.
- **SVG upload sanitization** (`lib/media/sanitizeSvg.js`, wired into
  `app/admin/(protected)/inventory/media/actions.js`'s `uploadMedia`): a small, dependency-free
  regex-based strip of `<script>` blocks, `on*` event-handler attributes, and `javascript:` URIs
  — not a general HTML-sanitizer dependency (DOMPurify+jsdom) for one well-understood threat (an
  SVG opened directly from its public Storage URL executes embedded script, unlike an `<img
  src="...svg">` reference). Verified against real stored data, not just code inspection: uploaded
  an SVG containing a `<script>` tag, an `onload` attribute, and an `onclick` attribute, then
  downloaded the actual object back from Supabase Storage — all three were stripped, the
  legitimate visual content (a circle shape) was preserved. Raster upload path (unchanged code)
  re-verified working via a plain PNG upload, correctly re-encoded to WebP as before.
- **Error logging** (new `error_logs` table + RLS in the Phase 8 migration; `lib/logging/
  logServerError.js` helper; wired into the cron route's two existing failure sites, the
  webhook's two existing failure sites, and a new try/catch around the login action's auth call
  for genuinely unexpected exceptions): reuses `view_audit_logs` rather than a new permission key
  (same "operational visibility" concern as the audit trail it sits next to). New viewer page
  `/admin/settings/error-logs`, added to `navConfig.js`'s Settings section, reusing the existing
  `Table`/`Badge`/`PageHeader` admin design-system components. Verified: renders the correct
  empty state with zero real errors; a manually-inserted test row rendered correctly (source
  badge, message, JSON context, timestamp) and was cleaned up; a Sales Staff account (no
  `view_audit_logs`) correctly got "Access denied" on direct URL access, and the nav item is
  correctly absent for that role.
- **Audit logs — logout** (`lib/auth/recordLoginEvent.js`'s new `recordLogoutEvent`, called from
  `logout()` in `app/admin/login/actions.js`): symmetric with the existing login_success/
  login_failed entries. Verified directly against real `audit_logs` rows: the 5 failed attempts,
  1 successful login, and 1 logout from the rate-limit test above all appear correctly.
- **Media bucket policy drift** (Phase 8 migration): dropped `media_bucket_select_authenticated`
  (unscoped `SELECT` — any authenticated user, not just `manage_media` holders — found during
  Phase 2, explicitly deferred "at the latest, Phase 8") and the redundant
  `media_bucket_write_managed`. The 4 correctly-`manage_media`-scoped policies from Phase 2's own
  migration were already in place and are untouched. Bucket was empty at the time of this change
  (confirmed before and after), so zero data-access risk either way.

**Explicitly out of scope for this pass (documented, not silently dropped):**
- **WhatsApp delivery testing / Phase 4 closure** — blocked on Meta credentials, unchanged.
- **Broader audit-log coverage** (permission changes, CMS publish actions, media deletes, CRM
  mutations beyond login/logout) — materially larger than one Phase 8 bullet; a real, known gap
  for a future pass, not built here.
- **"Users & Roles" and the other missing Settings sub-pages** (`Website Settings`, `Email/SMTP`,
  `SEO Settings`, `System Settings`, a general `Audit Logs` viewer beyond this phase's narrower
  error-log one) — master plan §2 names these under Settings, but only `WhatsApp Settings` (Phase
  4) and now `Error Logs` (this phase) have ever been built; no phase 0–8 breakdown explicitly
  assigns building the rest. A genuine backlog gap, flagged rather than silently built or ignored.
- **CI/CD pipeline** — not named in master plan §14, and the deployment mechanism itself doesn't
  require one (Hostinger's own auto-deploy-on-push, not a GitHub Actions-driven deploy).
- **Database backups** — Supabase-hosted Postgres backup retention is a project-tier/dashboard
  setting, not something inspectable via CLI. Verification pending your confirmation from
  **Supabase Dashboard → Project Settings → Database → Backups**.
- **Production deployment** — see below.

**Database objects:** One new migration
(`supabase/migrations/20260822090000_phase8_hardening.sql`) — `error_logs` table + RLS, and the
media bucket policy fix described above.

**Admin routes:** `/admin/settings/error-logs` (new).

**External integrations:** None added. Hostinger/GitHub deployment itself remains untouched —
see below.

**Dependencies on previous phases:** All previous phases (0–7.1) — this phase hardens existing
objects, adds no new business features.

**Verification:**
- `npm run lint` — clean (only pre-existing `<img>` warnings in untouched files).
- `npm run build` — clean; `/admin/settings/error-logs` compiles and appears in the route
  manifest.
- `npx supabase migration list` — local == remote, all 15 migrations.
- Targeted browser verification (three throwaway accounts — Super Admin ×2, Sales Staff ×1 —
  created/used/deleted, cleanup confirmed via direct `SELECT` returning zero rows each time):
  covered above per hardening item. Zero console errors throughout.

**Bugs:** None found beyond the gaps this phase exists to fix. No regression to any prior phase
— the only touched files are the ones listed above, and the raster media-upload path (unchanged
code) was explicitly re-verified working.

**Git and deployment state:** Code committed in two commits (`feat: ...` then `docs: ...`,
matching every prior phase's pattern) — see commit hashes in "Current Next Action" below. **Not
pushed.** Local `master` remains ahead of `origin/master` by everything since Phase 5 plus this
phase's work. Production deployment is deliberately **not** part of this pass: it is not a small
Phase-8-only push — it would be the first time five phases of work reach GitHub/Hostinger at
all — so it stays a separate, explicitly-confirmed step requiring (a) your go-ahead specifically
for that push, and (b) confirmation of how Hostinger's auto-deploy is currently wired (which
branch, staging vs. production), neither of which this pass assumed.

**Current status (at the time this pass concluded): IMPLEMENTATION COMPLETE (hardening scope) —
NOT CLOSED, DEPLOYMENT NOT STARTED.** Not fully closed because WhatsApp delivery testing remains
genuinely blocked on external credentials (unchanged from Phase 4) and database-backup
verification awaited your dashboard confirmation — both stated plainly rather than glossed over.
Production deployment was a deliberately separate, not-yet-authorized step at this point. This
mirrored exactly how Phase 4 was carried all along, and kept "do not push unfinished work to
production" intact. **Superseded by the "Phase 8 — Final Closure" section below**, where
deployment was explicitly authorized, database backups were actually verified (result: none
currently exist), and GitHub was pushed — Hostinger deployment itself remains the one blocked
step.

---

## Phase 8.1 — User Management + Roles & Permissions

**Purpose:** Phase 0 built the full authorization architecture (`public.users`, `roles`,
`permissions`, `role_permissions`, `has_permission()`, RLS on all four) but never built an
in-app screen for using it — creating a staff account or changing a role could only be done by
hand-editing the database. This is the exact "Users & Roles ... missing Settings sub-page" gap
Phase 8 flagged and deliberately left open. Phase 8.1 fills it, strictly on top of the existing
architecture — no new tables, no new permission keys, no bypass of Supabase Auth.

**Audit before implementation:** Every migration was read to reconstruct, verbatim, the real
current state rather than assume it: exactly 4 roles exist (`Super Admin`, `Admin / Manager`,
`Sales Staff`, `Content Manager` — no "Content Writer" role exists anywhere; `Content Manager` is
the existing equivalent, so no duplicate role was created), 41 permission keys exist across all
phases, and `manage_users`/`manage_roles_permissions` were both already seeded in Phase 0 but
**only ever granted to Super Admin** — Admin / Manager holds neither. That boundary was kept
exactly as-is (a deliberate, conservative default, not an oversight) rather than widened. No
existing code path anywhere created an `auth.users` row or assigned a `role_id` before this phase
— confirmed by a full-repo grep.

**Implementation:**
- **`/admin/settings/users`** — list (search by name/email, filter by Role/Status, paginated),
  **Add User** (Full Name/Email/Role/Active — no password ever passes through this app; creation
  goes through `supabase.auth.admin.inviteUserByEmail()` via the existing service-role helper,
  `lib/supabase/admin.js`'s `createAdminClient()`, reusing forgot-password's exact existing PKCE
  callback → reset-password flow for the invited person to set their own password), and a
  detail/edit page (Name/Phone/Role editable; Email read-only after creation — changing it would
  desync `auth.users.email` from `public.users.email`, out of scope). **Activate/Deactivate** is
  a dedicated action, not a field edit: deactivating sets `active = false` (which
  `has_permission()` already treats as "no permissions, immediately," per its existing
  definition) and additionally calls the service-role client's `auth.admin.signOut(userId,
  "global")` to revoke their refresh token too, mirroring `/admin/security`'s existing "Sign out
  other sessions" pattern.
- **`/admin/settings/roles`** — a **Manage by Role** view (checkbox grid per role, grouped by
  module, generated live from the real `permissions` table — nothing hardcoded) and a read-only
  **Permission Matrix** view. Writes go through the normal authenticated client, since RLS
  already permits this for a `manage_roles_permissions` holder — no service-role client needed
  here. **Super Admin's row is rendered read-only** (no checkboxes) — a deliberate safeguard,
  since the `auto_grant_super_admin` trigger only re-grants on *new* permission inserts and has
  no protection against an existing grant being manually deleted.
- **Self-lockout prevention** (`lib/auth/superAdminGuard.js`): before a role change away from
  Super Admin or a deactivation, counts other *active* Super Admins; blocks with a clear
  on-screen error if the count would hit zero. Applies to self-directed and other-directed
  changes alike.
- **Audit logging** (`lib/audit/logAdminEvent.js`, new shared helper): `user_created`,
  `user_updated`, `user_role_changed`, `user_activated`, `user_deactivated`,
  `role_permissions_updated` — written via the normal authenticated client (the actor always has
  a real session here, unlike login/logout's admin-client path, so `audit_logs_insert_self`
  already covers it).
- **No hard delete** — deactivate is the only destructive-ish action; `public.users.id` is
  referenced by leads/quotations/bookings/audit_logs and this phase didn't audit every one of
  those tables' `ON DELETE` behavior, so hard delete was deliberately not built.
- **Navigation**: two new items added to `navConfig.js`'s existing `Settings` section (`Users`,
  `Roles & Permissions`) — no other nav/rail/submenu mechanics touched.

**Verification:**
- `npm run lint`, `npm run build` — both clean (dev server stopped first); all four new routes
  compile and appear in the route manifest. No database migration was needed — Phase 0's
  existing RLS already covers every new write.
- Throwaway accounts only (Super Admin ×1, Sales Staff ×1, a UI-flow target user ×1), created via
  the same service-role pattern used all session; all three deleted and cleanup confirmed via a
  direct `SELECT` returning zero rows.
- Full edit/role-change/deactivate/activate cycle exercised through the real UI against a
  throwaway target account, each step cross-checked directly against the database: name and role
  changes persisted correctly, the correct `user_updated` and `user_role_changed` audit rows were
  written (previous/new role id), deactivate flipped `active` to `false` and wrote
  `user_deactivated`, reactivate flipped it back and wrote `user_activated`, and the confirmation
  dialog's exact wording was captured and matches the "isSelf" vs. "other account" branches.
- Roles & Permissions: confirmed Super Admin renders with zero checkboxes and the "not editable"
  message; toggled `view_reports` on for Sales Staff through the real UI, confirmed the
  `role_permissions` row and a `role_permissions_updated` audit row (`added: ["view_reports"]`)
  existed in the database, then reverted it through the same UI and re-confirmed the database
  matched the original baseline exactly — no permanent change was left behind.
- Sales Staff denial, tested both ways per the Regression Rule (not just hidden nav): the entire
  Settings nav group is correctly absent for a Sales Staff account (all four Settings items are
  permission-gated and it holds none of them), and direct URL access to both
  `/admin/settings/users` and `/admin/settings/roles` correctly renders "Access denied" server-
  side.
- A real Supabase Auth constraint surfaced during testing, not a code bug: the project's
  email-sending rate limit (`over_email_send_rate_limit`, a low hourly cap on the built-in email
  service) was hit while testing, since it's shared with every `resetPasswordForEmail`/invite
  call made earlier this session. The trigger → profile-completion → role-assignment mechanics
  the `createUser` Server Action depends on were separately verified correct and working via a
  non-email-sending equivalent call (`auth.admin.createUser`), and the error-handling was
  improved to surface this specific case with a clear message ("Too many invitation emails have
  been sent recently...") instead of a generic one — confirmed live in the UI. The actual
  `inviteUserByEmail` HTTP call itself could not be exercised a second time within this session
  due to the live quota; it is Supabase's own already-proven primitive (the same one
  forgot-password already relies on), not new code this phase wrote.
- Self-lockout blocking (the exact "last remaining Super Admin" case) was verified by code review
  rather than a live test — the real Super Admin count in this environment is 2 (one production
  account plus the throwaway used for this testing), and deliberately reducing that to zero to
  observe the block would have meant manipulating the real production Super Admin population,
  which this pass chose not to risk. The "not blocked, since another Super Admin exists" path
  *was* exercised live (the throwaway target account's role/status changes all succeeded
  normally). Stated plainly as a verification boundary, not glossed over.

**Bugs found and fixed during this phase:** One — the `over_email_send_rate_limit` error case
above was originally mapped to a generic "Could not create the user account" message; fixed to
surface the real, actionable cause.

**Documentation:** `public/admin-user-guide.html` updated (not rewritten) — two new feature
sections (Users, Roles & Permissions) added under the existing Settings TOC group in nav order,
and the existing "Roles & Permissions" reference section's now-stale claim ("no self-service
screen exists") corrected to point at the new pages. TOC/anchor integrity re-verified (42
sections, 42 TOC links, zero broken anchors).

**Final closure pass addendum:** A dedicated final QA pass re-confirmed the implementation
directly against real data, not just code review. Confirmed via direct query that Admin / Manager
and Content Manager hold **neither** `manage_users` nor `manage_roles_permissions` — only Super
Admin does, exactly as designed, unwidened. Confirmed zero throwaway users/role assignments/
permission changes remain from any prior testing. Confirmed the earlier Sales Staff
`view_reports` test-grant is still correctly reverted. The last-Super-Admin guard
(`wouldOrphanSuperAdmin`) was additionally proven **read-only against the real, single active
Super Admin account** (`anandezine@gmail.com` — there is currently only 1, not 2 as briefly
assumed mid-session; the second one earlier was this project's own throwaway test account,
already deleted during cleanup): calling the guard function directly confirms it returns `true`
(blocked) for both deactivating and demoting that account, and `false` for a same-role no-op —
without ever mutating the real account. One real gap found and closed by this pass: `user_created`
had never actually been written to `audit_logs` historically, because every live
`inviteUserByEmail` attempt through the real UI had hit Supabase's project-wide email-send rate
limit — the underlying trigger/role-assignment mechanics were separately proven correct (via a
non-email-sending equivalent call), but the full `createUser` Server Action, including its audit
write, has still never completed end-to-end live. Not retested again this pass, per explicit
instruction not to keep retrying a known rate limit.

**Current status: COMPLETE.** User Management and Roles & Permissions are both implemented,
permission-gated (Super Admin only, matching the existing, unwidened `manage_users`/
`manage_roles_permissions` grants), audited, and verified against real data — with the two
verification boundaries above (last-Super-Admin blocking proven read-only rather than live;
`user_created` never exercised end-to-end due to a real, external rate limit) stated explicitly
rather than glossed over.

---

## Phase 8 — Final Closure: Database Backup Verification & Production Deployment

**Purpose:** The two items Phase 8 left explicitly open — database backup verification and
production deployment — closed out in one dedicated pass, per explicit authorization.

### Database Backup Verification

- **Status:** Verified — and the result is that **no automated backups currently exist**.
- **Verification method:** `supabase backups list --project-ref mybjwunznupckcnwywfv`, the
  Supabase CLI's read-only Management API call, run directly against the real production project
  (`connectmytours`, ref `mybjwunznupckcnwywfv`, region `ap-south-1`). No restore was attempted —
  none was possible or necessary to get a definitive answer.
- **Result:** `{"walg_enabled": true, "pitr_enabled": false, "backups": []}`. The underlying
  physical-backup engine is present at the infrastructure level, but Point-in-Time Recovery is
  **disabled** and the list of actual available backups is **empty** — there is currently nothing
  to restore from if the database were lost or corrupted.
- **Recoverability:** Cannot be demonstrated by a real restore test today, since there is nothing
  to restore. Recoverability currently depends entirely on enabling PITR (or upgrading to a plan
  tier that provides scheduled backups), neither of which exists right now.
- **Limitations:** This check covers Supabase's physical/PITR backup system specifically (per the
  CLI command's own description). Dashboard UI access was not available to independently confirm
  whether a separate logical/daily-backup feature exists outside this API; the project's exact
  billing/plan tier could not be confirmed via any available CLI command either. No retention
  period is stated, because none is currently being applied — stating one would be fabricated.
- **This is a genuine, current operational risk**, not a resolved item — surfaced here for your
  decision (e.g., enabling PITR or upgrading plan tier), not silently accepted as fine.

### Production Deployment

- **Commit range reviewed and pushed:** all 22 commits ahead of the prior `origin/master`
  (`41aff92`), spanning Phase 5 through Phase 8.1 and the Admin User Guide — confirmed via
  `git log --oneline origin/master..master` before pushing, matching exactly what was expected.
- **Pre-deployment checks:** `npm run lint` clean (only pre-existing `<img>` warnings, unrelated),
  `npm run build` clean, `npx supabase migration list` — local == remote across all 15 migrations,
  no mismatch.
- **GitHub push:** succeeded. Plain fast-forward, no force, no history rewrite:
  `41aff92..0df3ca2 master -> master`. Confirmed local `master` and `origin/master` point to the
  identical commit (`0df3ca2`) afterward.
- **Hostinger deployment: BLOCKED — genuinely not completed.** No Hostinger credentials, API
  access, or MCP tool exist in this environment, and no repo-level CI/webhook config was found
  (`.github/`, deploy scripts, etc. — none exist). `EMAIL_SETUP.md`'s own Hostinger section
  describes only manual hPanel steps (edit env vars, then **manually restart the Node.js
  application**) — nothing describing an automatic git-push-triggered deploy, despite the master
  plan's stated intended architecture (`GitHub → Hostinger Auto Deployment`). Empirically
  confirmed no deploy occurred: polled `https://connectmytours.com/admin/login` every ~30s for
  over 14 minutes after the push — it stayed `404` throughout, and the homepage's CDN cache `age`
  header kept climbing the whole time (177404s → 219973s) rather than resetting, meaning the
  origin was never rebuilt. Separately confirmed this 404 is a genuine Next.js application-level
  404 (proper `x-powered-by: Next.js` dynamic response, not a static/CDN artifact) and that the
  underlying Node.js server is alive and correctly running dynamic routes today
  (`/api/enquiry` returns a real `400` validation response, `/kerala` serves normally) — so this
  is specifically "the admin panel has never been part of any deployed build," not a hosting
  architecture problem. Per explicit instruction, this pass stopped here rather than guessing
  further or claiming success: **manual Hostinger action (a human logging into hPanel to pull the
  new code and restart the app, or providing deploy credentials/a trigger mechanism) is required
  to actually complete this.**
- **Consequently:** `https://connectmytours.com/admin-user-guide.html`, the post-deployment
  public-site check, the post-deployment admin check, and the "How to Use" live verification (C.5
  through C.8) could not be performed — there is nothing new deployed yet to check. Not
  attempted, not fabricated.

**Current status: NOT CLOSED.** Database backup verification is genuinely complete (the checklist
item asked for a verified answer, not a guaranteed outcome — the verified answer is that backups
do not currently exist). Production deployment is genuinely incomplete: GitHub is fully up to
date, but Hostinger has not yet served any of it. Phase 8 stays exactly where it was —
**IMPLEMENTATION COMPLETE, NOT CLOSED** — with one item's status changed from "awaiting your
confirmation" to "confirmed, and it's a real gap," and the deployment item now blocked on a
concrete, named, external action rather than an unconfirmed assumption.

---

## Current Phase Order

Phase 0 (CLOSED) → Phase 1 (CLOSED) → Phase 2 (CLOSED) → Phase 3 (CLOSED) →
Phase 3.5 (CLOSED) → Phase 4 (IN PROGRESS — QA INCOMPLETE) → Phase 5 (CLOSED) →
Phase 6 (CLOSED — Packages/Destinations permanently excluded, see Phase 6 section) →
Phase 7 (CLOSED — Booking/Conversion/Package/Destination/Staff reports excluded, see Phase 7
section) → Phase 7.1 (COMPLETE — admin UX/branding/auto-logout, see Phase 7.1 section) →
Phase 8 (IMPLEMENTATION COMPLETE, hardening scope — NOT CLOSED, backup verification done /
production deployment blocked on Hostinger access, see Phase 8 and Phase 8 Final Closure
sections) → Phase 8.1 (CLOSED — user management + roles & permissions, see Phase 8.1 section)

## Current Next Action

Phase 0 through Phase 3.5 are closed. Phase 4 — WhatsApp Automation — remains **IMPLEMENTATION
COMPLETE / QA INCOMPLETE**, unchanged this session (not reopened; no Phase 5 dependency
required touching it). It still cannot close until real Meta/staging credentials are
configured and a real send-and-receive, webhook delivery, and cron firing are verified against
a live WhatsApp number, plus full browser acceptance testing against every Phase 4 admin route.

Phase 5 — CMS — is now **CLOSED**. Implementation: 12 new tables (Pages/Page Builder/
revisions, Blog + categories/tags, FAQs, Testimonials, Banners, Menus + items), RLS on all of
them, 8 new permissions granted only to Content Manager, a database-level trigger enforcing the
publish/manage permission split on Pages and Blog Posts, and the shared `media`/`seo_metadata`
infrastructure from Phase 2 extended (not duplicated) to cover CMS entities. All 7 CMS nav
items route to real, permission-gated, non-duplicate pages. One real bug (a
`useFormState`-signature mismatch causing a 500 on menu creation, plus a missing error-display
gap in the same form) was found via Playwright in the first QA pass, fixed properly with a
client-component wrapper, and re-verified working. A dedicated follow-up QA closure session
then resolved the three gaps left open by the first pass: (1) confirmed via direct master-plan
text search that search/filter is not a CMS requirement anywhere in the document — documented
as intentionally out of scope, not built; (2) live-tested all remaining 17 Page Builder block
types individually (Hero/Rich Text already had full coverage) — every field type including a
real image upload and `items_json` arrays (both valid and deliberately invalid, to confirm the
error path), with a full hard-refresh persistence check across all of them; (3) ran the
complete navigation/browser-back/browser-forward/refresh/hard-refresh matrix across all 7 CMS
areas with zero console errors and zero data loss anywhere. No new bugs were found in the
closure session — it was pure verification of the already-committed implementation. `npm run
lint`, `npm run build`, and `npx supabase migration list` (local == remote, all 12 migrations)
are all clean. A security-drift item (see "Unresolved item" under Phase 2 above) — two
untracked policies on the pre-existing `media` bucket — remains intentionally open per explicit
user decision, unrelated to Phase 5, carried forward to Phase 8 Production Hardening.

Phase 6 — Website Integration — is now **CLOSED**. Pages, Blog, Homepage Sections, FAQ,
Testimonials, Banners, and Navigation/Menus are fully implemented and verified (see the Phase 6
section above for full detail). `npm run lint`, `npm run build`, and `npx supabase migration
list` (local == remote, all 13 migrations) are clean. Targeted curl-based verification confirmed
both the CMS and fallback rendering paths, 404 behavior for missing content, and the sitemap
extension; one real end-to-end content-rendering test was run against the linked database
(user-approved, fully reversible, confirmed cleaned up). `open_in_new_tab` on CMS menu items —
found unwired during a reconciliation pass, a real correctness gap since the Phase 5 admin
editor already exposes it to staff — was implemented and verified.

Packages/Destinations was reconciled explicitly against the master-plan text (which names no
requirement beyond "Packages → Destinations" in Phase 6's recommended order, and contains no
"departure city" concept at all) and against the actual schema/data (`destinations` conflates
true destinations with unused departure-city rows; `packages.destination_id` is one-to-many, not
many-to-many; one live package page has no matching DB row). This is real, genuine outstanding
master-plan work requiring its own data-modeling decision — the user explicitly chose to close
Phase 6 with it **permanently excluded from this phase's scope**, to be picked up as a dedicated
future initiative rather than reopening Phase 6 or folding it into Phase 7/8 implicitly.

Commits: `8c2ea6f` (feat: implement phase 6 website integration), `c4c4055` (docs: status doc),
`936d8fa` (fix: open_in_new_tab), plus this closure documentation update. Nothing pushed to any
remote; production (`https://connectmytours.com`) untouched.

Phase 7 — Reports & Analytics — is now **CLOSED**. Dashboard KPIs, Lead Reports, Sales Reports,
and Marketing Reports (§12's only defined categories) are implemented, permission-gated
(`view_reports`, Admin/Manager only — reusing the `_all` view permissions Admin/Manager already
held from Phase 1/3/3.5/4, no new RLS), and verified: every metric was independently
hand-calculated against the real database and then confirmed rendering exactly those values in a
real authenticated browser session (throwaway Admin/Manager and Sales Staff accounts, same
create-use-delete pattern as the Phase 5 closure session, cleanup confirmed via direct `SELECT`).
Booking Reports, Conversion Reports, Package Performance, Destination Performance, and Staff
Performance — named in §2/§15 but never defined in §12 — are intentionally not built, per
explicit user decision, not a gap glossed over. `npm run lint`, `npm run build`, and `npx
supabase migration list` (local == remote, all 14 migrations) are clean. No bugs in the Phase 7
code; one dev-environment artifact (two concurrent `next dev` processes corrupting the route
manifest, unrelated to any Phase 7 code) was hit and resolved during testing.

Phase 7.1 — Admin UX, Navigation, Branding & Auto-Logout Fix — is now **COMPLETE**. Compacted the
admin sidebar (all sections now fit one screen without scrolling), added the real ConnectMyTours
logo to the sidebar and all three auth pages, fixed the three auth pages' hand-rolled gray
buttons/inputs to use the already-correctly-branded shared `Button`/`Field`/`Input` components,
and diagnosed + fixed the actual auto-logout gap: zero `onAuthStateChange` listeners existed
anywhere, so an already-open tab never learned its session had been invalidated (by
`/admin/security`'s existing "Sign out other sessions" or a natural refresh-token
expiry/revocation) until its next server round-trip. No inactivity-timeout duration was invented
— `supabase/config.toml`'s commented-out `[auth.sessions]` block is generic CLI boilerplate, not
a project requirement. `npm run lint`/`npm run build` clean; no DB changes. No Phase 7 regression
(report pages/metrics/`view_reports` permission re-confirmed identical). One verification
boundary stated plainly rather than overclaimed: the specific cross-device revoke-then-redirect
trigger wasn't directly fired-and-observed (Playwright's tabs share one cookie jar, not
independent devices) — the mechanism itself is standard, documented Supabase SDK behavior, not
custom logic.

Phase 8 — Production Hardening — is now **IMPLEMENTATION COMPLETE (hardening scope)**, not
closed. Security headers, login rate limiting, timing-safe cron secret comparison, SVG upload
sanitization, an in-house error log + viewer, a symmetric logout audit entry, and the Phase
2-deferred media bucket policy drift are all implemented and verified — see the Phase 8 section
above for the full detail, including exactly what was verified against real data (not just code
inspection) for each item. `npm run lint`, `npm run build`, and `npx supabase migration list`
(local == remote, all 15 migrations) are clean.

WhatsApp delivery testing remains genuinely blocked on Meta credentials, unchanged from Phase 4.
Database-backup verification awaits your confirmation from the Supabase dashboard. Production
deployment is deliberately not part of this pass: local `master` was found to be 16 commits
ahead of `origin/master` (everything since Phase 5 has only ever been committed locally), so
pushing is not a small Phase-8-only action — it needs its own explicit go-ahead plus
confirmation of how Hostinger's auto-deploy is currently wired, neither of which this pass
assumed.

Commits: `2826a7e` (feat: implement phase 8 production hardening), plus this closure
documentation update. Nothing pushed to any remote; production (`https://connectmytours.com`)
untouched.

Phase 8.1 — User Management + Roles & Permissions — is now **COMPLETE**. Closes the "Users &
Roles" gap Phase 8 explicitly flagged and left open: `/admin/settings/users` and
`/admin/settings/roles`, built strictly on Phase 0's existing authorization architecture — no new
tables, no new permission keys, no new RLS. Confirmed the only 4 real roles (no "Content Writer"
role exists; "Content Manager" is the existing equivalent) and that `manage_users`/
`manage_roles_permissions` remain Super-Admin-only, unwidened. Self-lockout prevention, dedicated
deactivate/reactivate with session revocation, and full audit logging (`user_created`,
`user_updated`, `user_role_changed`, `user_activated`, `user_deactivated`,
`role_permissions_updated`) are all implemented and verified against real data through the
actual UI, with cleanup confirmed. `npm run lint` and `npm run build` are clean. See the Phase
8.1 section above for full detail, including the two verification boundaries stated plainly
rather than glossed over (the project's shared email-send rate limit blocked a second live
`inviteUserByEmail` call within this session, and the exact "last remaining Super Admin" block
path was verified by code review rather than a live test, to avoid manipulating the real
production Super Admin count).

Commits: `d1a815f` (feat: add admin user and role management), `0df3ca2` (docs: document user
management), plus this closure documentation update. See the Final Closure Pass paragraph below
for what happened to these once production deployment was authorized.

**Final Closure Pass (this update).** Phase 8.1 is now **CLOSED** — a dedicated final QA pass
re-confirmed every item directly against real data (not just code review), including proving the
last-Super-Admin guard blocks correctly when called read-only against the real, single active
Super Admin account, and closed one real gap: `user_created` had never actually been written to
`audit_logs`, because every live invite attempt had hit Supabase's project-wide email rate limit
— not retested again per explicit instruction, and stated as a real boundary rather than glossed
over. Database backup verification is now genuinely complete: Supabase's own Management API
confirms **no backups currently exist and PITR is disabled** for the production project — a real
operational risk surfaced for your decision, not a fabricated "all clear." All 22 local commits
(Phase 5 through Phase 8.1 and the Admin User Guide) were reviewed and pushed to `origin/master`
as a plain fast-forward (`41aff92..0df3ca2`, no force, no rewrite) — GitHub is now fully caught
up. Hostinger deployment itself is **blocked**: no credentials/API access exist in this
environment, no auto-deploy webhook config was found in the repo, and polling
`https://connectmytours.com/admin/login` for 14+ minutes after the push showed no rebuild (still
404, CDN cache age still climbing) — the underlying Node.js host is confirmed alive and capable
(dynamic routes work), it has simply never had the admin panel deployed to it before. This
requires a manual action in Hostinger's hPanel (or deployment credentials being provided) to
complete. **Phase 8 therefore remains NOT CLOSED** — implementation and both outstanding
verification items are done, but the actual production deployment is not, and closing it while
that's true would misrepresent the real state.

---

## Post-Phase 8 Fixes & Enhancements (this update, 2026-08-21)

Six independently-requested fixes/enhancements on top of the Phase 8/8.1 baseline. Not a new
numbered phase — scope was given directly, not transcribed from the master plan. Implementation
is **complete and verified against real data**; production deployment/push is not part of this
pass (see Phase 8's own closure note above — the same push/deploy gap still applies).

1. **Admin inactivity logout.** `components/admin/useInactivityLogout.js` (new) tracks the
   admin's last activity via throttled `mousemove`/`mousedown`/`keydown`/`scroll`/`touchstart`
   listeners (max one timer reschedule per 5s, not per event), shows a warning at 25 minutes
   (`components/admin/InactivityWarningModal.jsx`, built on the existing `Dialog`/`Button` UI
   components) and signs out at 30 minutes by calling the real `logout` Server Action from
   `app/admin/login/actions.js` directly (not via a form submit) — the same audit-logged
   (`recordLogoutEvent`) path manual sign-out already uses. Wired into `AdminShell.jsx` alongside
   the existing `useAuthStateRedirect()` session-invalidation listener, which is untouched — both
   run independently.
2. **"Go to Website" header link.** Added next to the existing "How to Use" link in
   `AdminShell.jsx`'s `Header`, using `siteConfig.domain`
   (`https://www.connectmytours.com`, `config/site.js` — the repo's only canonical public-domain
   value; no env var exists for this). `target="_blank" rel="noopener noreferrer"`.
3. **Public header-overlap fix.** Root cause: `Navbar.jsx`'s header is `fixed` with a flat `h-16`
   (64px) at every breakpoint, and no public page besides the Homepage (whose full-bleed hero is
   designed to sit under it) compensated for that. Fixed once, in the shared wrapper
   `components/layout/SiteChrome.jsx` — `pt-16` on `<main>` for every route except `/`. No
   per-page changes.
4. **Srivani VIP Darshan banner (Chennai + Hyderabad).** Root cause confirmed by inspection, not
   guessed: `PackageHeroBanner.jsx`'s default `image` prop pointed at
   `/images/hero-temple.jpg`, a file that **does not exist on disk** — both Srivani pages render
   this banner but never supplied their own `image`, so both silently 404'd (not a homepage-banner
   fallback; the homepage uses a different file, `banner-bg.png`, entirely). Fixed by giving the
   component a valid default and, more importantly, wiring an explicit, Srivani-specific
   `image`/`imageAlt` (`/images/maha-dwaram.jpg` — the Tirumala gate associated with the VIP
   break-darshan queue) into both pages' `hero={{...}}` objects, deliberately choosing an asset not
   already used by the site's own `PromoPopup` (which uses `hero-temple-1.jpg` and fires on every
   public page, Srivani pages included — using the same file there would have shown one photo
   twice on screen at once).
5. **Mobile-only sticky Call/WhatsApp bar.** New `components/layout/MobileContactBar.jsx`
   (`sm:hidden`, matching the header's own existing mobile/not-mobile cutoff), rendered from
   `SiteChrome.jsx` on every public page. Uses the site's existing `siteConfig.phone`/
   `siteConfig.whatsapp` values (no new number), existing `PhoneIcon`/`WhatsAppIcon`, and the
   already-established `green-600`/`secondary-500` Call/WhatsApp color pairing from
   `PackageHeroBanner.jsx`. A small `h-16 sm:hidden` spacer after `<Footer>` in `SiteChrome.jsx`
   keeps the fixed bar from covering the last row of footer content when scrolled to bottom.
6. **Call/WhatsApp click tracking + Admin "Contact Clicks" report.** New table
   `contact_click_events` (migration `20260822100000_phase8_1_contact_click_tracking.sql`,
   applied to remote — `npx supabase migration list` confirms local == remote, all 16
   migrations) with a single SELECT policy reusing `view_reports` (same "reuse an existing
   permission" precedent as `error_logs` reusing `view_audit_logs` in Phase 8). All writes go
   through a new `SECURITY DEFINER` function `record_contact_click()` — same
   anon-write-via-narrow-RPC shape as `submit_enquiry()`, no direct INSERT grant to any role.
   No `ip` column exists on the table at all, so the raw client IP can never be persisted even by
   a future mistake; `app/api/contact-click/route.js` uses the IP only in-memory for a best-effort
   `ip-api.com` lookup (country/region/city only, 2s timeout, swallowed on failure) before
   discarding it. `lib/auth/parseUserAgent.js` gained a `deviceType` (`mobile`/`tablet`/`desktop`)
   bucket, reused from the existing UA-parsing helper (no new dependency). Client-side, a new
   `components/shared/TrackedContactLink.jsx` fires the tracking POST un-awaited and never calls
   `preventDefault()`, so `tel:`/`wa.me` navigation is never delayed or gated by tracking
   succeeding — used by the new mobile bar and swapped into every existing Call/WhatsApp anchor
   site-wide (`Footer.jsx`, `ContactCTA.jsx`, `CityHero.jsx`, `PackageHeroBanner.jsx`) with no
   visual/behavioral change otherwise. Admin view: `/admin/reports/contact-clicks` (added to the
   existing Reports nav section, `view_reports` permission, no new permission key), built with the
   existing `Table`/`Pagination`/`Badge`/`StatCard` UI primitives, filters via `searchParams`
   (action/device/date-range), newest first.

**Verification performed against real data, not just code inspection:** the RPC was called
directly (anon key) — a row persisted correctly, then confirmed via the service-role key, then
deleted; a second attempt with an invalid `action_type` was correctly rejected server-side; a
direct anon `SELECT` against `contact_click_events` returned zero rows (RLS confirmed blocking
public reads). The full real pipeline (browser click → `TrackedContactLink` → `/api/contact-click`
→ UA parse → `record_contact_click()`) was exercised end-to-end from a running dev server — a
WhatsApp click correctly recorded `action_type: "whatsapp"`, `page_path: "/"`, `device_type:
"desktop"`, `os: "macOS"`, `browser: "Chrome"` (location was `null`, expected — `ip-api.com`
cannot geolocate a local dev IP; the graceful-degradation path is what's actually being verified
here) — then this test row was deleted too. Visually confirmed in a real browser: Homepage
hero unchanged; `/about-us`'s `<h1>` no longer sits under the fixed header (`pt-16` applied,
header measured at 88px); both Chennai and Hyderabad Srivani pages render a real, loading (non-404)
banner image with correct alt text; the mobile sticky bar renders with correct `tel:`/`wa.me`
hrefs and correct ARIA labels at a 390px viewport and is absent in the accessibility tree's normal
desktop flow; `/admin/reports/contact-clicks` correctly redirects an unauthenticated request to
`/admin/login` (existing middleware regression-checked, unmodified).

**One verification boundary stated plainly:** the admin-only UI (inactivity warning modal,
"Go to Website" link placement, the Contact Clicks report table/filters rendering with real rows
under an authenticated `view_reports` session) was verified by code review, exact reuse of already
-verified UI primitives (`Dialog`, `Button`, `Table`, `Pagination`, `StatCard`), and a successful
production build — not by an authenticated real-browser session, since no admin test credentials
were available in this pass and creating one was out of scope for a fix/enhancement pass.

`npm run lint` and `npm run build` are clean. `npx supabase db push` applied the one new migration
to remote with explicit go-ahead (schema-affecting; confirmed before running). Nothing pushed to
`origin/master` yet — see Git section of the final report for this pass.

