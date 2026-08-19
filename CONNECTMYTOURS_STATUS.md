# ConnectMyTours — Implementation Status & QA Governance

Updated: 2026-08-19 (Phase 4 implementation completed and bug-fixed — QA INCOMPLETE, browser QA not started)

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
`blog_posts`, `blog_categories`, `blog_tags`, `faqs`, `testimonials`, `banners`, `menus`
(plus shared `media`, `seo_metadata` from §9 Media & SEO)

**Admin routes (planned — master plan §2 CMS menu):** Pages, Page Builder, Blog, Banners,
FAQs, Testimonials, Homepage Sections, Navigation/Menus

**Server actions / API:** None yet.

**External integrations:** None specified.

**Dependencies on previous phases:** Phase 0 (roles: Content Manager); Phase 2 (media library
reused for CMS media).

**Acceptance requirements:** Full QA governance framework above.

**Current status: NOT STARTED**
Evidence: no CMS code, routes, or database tables exist.

---

## Phase 6 — Website Integration

**Purpose (master plan §15):** Gradually replace hardcoded public content with CMS-driven
content, in the order: Packages → Destinations → Pages → Blog → Homepage Sections → Other
Content. Current public UI must remain visually stable during migration.

**Exact features:** As stated above — no additional detail is given in the master plan beyond
the migration order and the visual-stability constraint.

**Database objects:** None new — reads from Phase 2 (`packages`, `destinations`) and Phase 5
(`pages`, `blog_posts`, etc.) tables.

**Admin routes:** None new — this phase changes what the public site reads from, not the
admin panel.

**Server actions / API:** None yet.

**External integrations:** None specified.

**Dependencies on previous phases:** Phase 2 (packages/destinations); Phase 5 (CMS
pages/blog/homepage sections).

**Acceptance requirements:** Full QA governance framework above, plus explicit regression
testing of the existing public site (per Permanent Rule 8) since this phase modifies
customer-facing pages directly.

**Current status: NOT STARTED**
Evidence: public site pages (`app/*` outside `app/admin/`) are still statically defined; no
CMS-driven rendering path exists yet.

---

## Phase 7 — Reports & Analytics

**Purpose (master plan §15):** Dashboard, lead analytics, sales analytics, conversion
reports, package performance, destination performance, staff performance, marketing
performance.

**Exact features (master plan §12):**
- Dashboard KPIs: today's enquiries, new leads, pending quotations, follow-ups due, confirmed
  bookings, lost leads, conversion rate, quotation value
- Lead reports: date-wise, source-wise, destination-wise, package-wise, staff-wise,
  status-wise
- Sales reports: quotations sent/accepted/rejected, booking value, conversion rate
- Marketing reports: WhatsApp messages sent/delivered/failed, follow-up activity, campaign
  performance

**Database objects:** None new — aggregates/reads from Phase 1 (`leads`), Phase 3
(`quotations`), Phase 3.5 (`bookings`), Phase 4 (`whatsapp_messages`, `campaigns`) tables.

**Admin routes (planned — master plan §2 Reports menu):** Lead Reports, Quotation Reports,
Booking Reports, Conversion Reports, Package Performance, Destination Performance, Staff
Performance, Marketing Performance

**Server actions / API:** None yet.

**External integrations:** None specified.

**Dependencies on previous phases:** Phase 1, Phase 3, Phase 3.5, Phase 4 (all source data).

**Acceptance requirements:** Full QA governance framework above, with particular attention to
Rule 2 (Mandatory Testing Model) since report correctness depends entirely on accurate
database reads.

**Current status: NOT STARTED**
Evidence: no reporting code or routes exist.

---

## Phase 8 — Production Hardening

**Purpose (master plan §15):** Security review, permission testing, validation, error
handling, performance optimization, backup verification, cron verification, WhatsApp delivery
testing, production deployment.

**Exact features (master plan §14, §15):**
- Security: Supabase Auth, role-based authorization, RLS, environment variables, input
  validation, API protection, rate limiting where appropriate, secure file uploads, audit
  logs, error logging, database backups, secrets never exposed to the frontend
- Deployment: Claude Code → GitHub → Hostinger Auto Deployment; Hostinger cron/scheduled jobs
  for automation

**Database objects:** None new — this phase hardens existing objects across all prior phases.

**Admin routes:** None new.

**Server actions / API:** None yet.

**External integrations:** Hostinger (hosting/cron), GitHub (deployment).

**Dependencies on previous phases:** All previous phases (0–7).

**Acceptance requirements:** Full QA governance framework above, applied retroactively across
every previously closed phase (per Permanent Rule 8, Regression Rule).

**Current status: NOT STARTED**
Evidence: no hardening pass has been performed; current phase is still Phase 0.

---

## Current Phase Order

Phase 0 (CLOSED) → Phase 1 (CLOSED) → Phase 2 (CLOSED) → Phase 3 (CLOSED) →
Phase 3.5 (CLOSED) → Phase 4 (IN PROGRESS — QA INCOMPLETE) → Phase 5 → Phase 6 → Phase 7 →
Phase 8

## Current Next Action

Phase 0 through Phase 3.5 are closed. Phase 4 — WhatsApp Automation implementation is now
**complete**: database layer (7 tables, 7 functions, RLS, 5 permissions) matches remote with no
drift; all four master-plan vertical slices are built and wired — enquiry confirmation,
quotation messages, morning/evening follow-up automation with an atomic claim-then-send cron
route, and campaigns (including scheduled sends); Templates/Automation/Campaigns/
Messages/Settings admin UI all exist with real permission-gated routes and no dead nav links;
stop/pause/resume and consent/opt-out (webhook-driven, now enforced centrally on every send
path) are wired end-to-end. This session found and fixed 9 real bugs across this
previously-uncommitted code (broken imports that failed the build outright, a raw-HTML
description string, a missing success flag, a mismatched join alias, an unsupported/redundant
RLS-duplicate filter, a NOT NULL constraint violation silently breaking enquiry-confirmation
message logging, and missing opt-out enforcement on non-campaign sends) — see the Phase 4
section above for the full list. `npm run lint` and `npm run build` are both clean.
Phase 4 cannot close until: real Meta/staging credentials are configured and a real
send-and-receive, webhook delivery, and cron firing are verified against a live WhatsApp
number (Rule 9); and real browser acceptance testing is performed against every Phase 4 admin
route. Neither has been done in this environment. A security-drift item (see "Unresolved item"
under Phase 2 above) — two untracked policies on the pre-existing `media` bucket — remains
intentionally open per explicit user decision, carried forward rather than resolved; revisit at
the latest during Phase 8 Production Hardening.
