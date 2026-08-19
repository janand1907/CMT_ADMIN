-- Business decision reversal: customers never mutate a quotation's status.
-- The share-link page is view-only — opening it may still flip sent -> viewed
-- (get_quotation_by_token() side effect, unchanged), but accepted/rejected
-- stays a manual Admin/Manager action on the quotation detail page. This
-- drops the anon-callable respond_to_quotation() added in the prior Phase 3
-- QA fix migration, since leaving it live would let anyone holding a share
-- token call it directly (SECURITY DEFINER, PUBLIC-callable) even with no UI
-- button pointing at it. No RLS or status-transition logic changes — this
-- only removes the one bypass path that let anon reach it.
drop function if exists public.respond_to_quotation(uuid, text);
