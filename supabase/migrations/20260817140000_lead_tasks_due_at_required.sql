-- lead_tasks.due_at was nullable, so the addTask() insert path could create a
-- task with no due date whenever client-side validation was skipped. Enforce
-- it at the database boundary as the last line of defense, independent of
-- the application/UI layers.
--
-- Added NOT VALID: 3 existing rows already have a null due_at (created while
-- this gap existed) and would fail a validated constraint. NOT VALID still
-- blocks every new insert/update immediately; the pre-existing rows can be
-- backfilled and the constraint validated (`validate constraint`) separately.
alter table public.lead_tasks
  add constraint lead_tasks_due_at_required check (due_at is not null) not valid;
