-- Admin/editor-side "report a problem" + escalation, mirroring the public
-- widget (client ask, 2026-08-26): "a reporting system for bugs on the
-- management side just like the little flag on the client side... similar
-- to the escalation workflow in case a change is made but not reflecting
-- on the live site even after confirmation." Reuses problem_reports rather
-- than a parallel table — same review/resolve workflow already works for
-- staff, this just needs to distinguish who a report is from and, for the
-- "change not live" case, which submission it's actually about.
--
-- No new INSERT policy needed: problem_reports_insert_anon already allows
-- any insert (`with check (true)`) — staff are "anyone" too. The staff-side
-- Server Action is what sets source/reported_by correctly (auth-checked
-- there, not enforced by RLS, same as how submitProblemReport already
-- trusts the server action to set page_url etc. honestly).
alter table public.problem_reports
  add column source text not null default 'public' check (source in ('public', 'staff'));

alter table public.problem_reports
  add column reported_by uuid references public.profiles(id) on delete set null;

alter table public.problem_reports
  add column related_request_id uuid references public.content_change_requests(id) on delete set null;

-- Snapshot of the automated checklist's findings at filing time (the
-- related request's status, timestamps, etc.) so whoever picks up the
-- report — an admin today, potentially an AI assistant later — has real
-- context without re-deriving it. Nothing here is a live/authoritative
-- value; related_request_id is what stays authoritative.
alter table public.problem_reports
  add column diagnostic jsonb;

alter table public.problem_reports drop constraint problem_reports_issue_type_check;
alter table public.problem_reports add constraint problem_reports_issue_type_check
  check (issue_type in (
    'Incorrect info', 'Bug or broken feature', 'Something else',
    'Change not reflecting live', 'Dashboard bug'
  ));

create index problem_reports_source_idx on public.problem_reports(source);
