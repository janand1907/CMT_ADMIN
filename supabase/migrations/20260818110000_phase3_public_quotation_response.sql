-- Phase 3 QA fix — public customer Accept/Reject on the share-link page.
-- Adds the only other anon-callable quotation entry point besides
-- get_quotation_by_token() (same migration, same narrow SECURITY DEFINER
-- shape). No RLS grant to anon is added anywhere — this single function
-- remains the sole way an anonymous customer can ever change a quotation
-- row, mirroring the get_quotation_by_token() precedent exactly.

-- Row is locked with "for update" for the duration of the function's own
-- implicit transaction, so two near-simultaneous clicks (double-click, two
-- browser tabs) serialize instead of racing: the second call blocks until
-- the first commits, then sees the now-terminal status and raises the same
-- readable "no longer awaiting a response" exception a normal retry would
-- get. The follow-up "update ... where status in (...)" + row-count check
-- is defense in depth against any path that reaches the update without
-- going through the lock (there is none today, but the guard is free).
--
-- No new quotation_messages/lead_activities insert is needed here —
-- log_quotation_status_change_trg (existing, unmodified) already fires on
-- any quotations status change regardless of caller, and already logs both
-- a quotation_messages row and a lead_activities row for this transition.
create function public.respond_to_quotation(p_share_token uuid, p_response text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_status text;
  v_updated int;
begin
  if p_response not in ('accepted', 'rejected') then
    raise exception 'Invalid response';
  end if;

  select id, status into v_id, v_status
  from public.quotations
  where share_token = p_share_token
  for update;

  if v_id is null then
    raise exception 'Quotation not found';
  end if;

  if v_status not in ('sent', 'viewed') then
    raise exception 'This quotation is no longer awaiting a response.';
  end if;

  update public.quotations
  set status = p_response
  where id = v_id
    and status in ('sent', 'viewed');

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'This quotation is no longer awaiting a response.';
  end if;

  return jsonb_build_object('status', p_response);
end;
$$;

comment on function public.respond_to_quotation(uuid, text) is
  'No explicit grant statement needed — Postgres grants EXECUTE on new '
  'functions to PUBLIC by default (same precedent as get_quotation_by_token() '
  'in the Phase 3 migration), which is what lets the public /quote/[token] '
  'page call this as anon.';
