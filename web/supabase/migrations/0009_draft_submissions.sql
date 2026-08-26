-- Adds a 'draft' status so an editor can save work-in-progress without it
-- entering the admin approval queue — client ask (2026-08-26): "an option
-- where they can just save it but not submit it." A draft is invisible to
-- admin's Approvals list/badge count (filtered at the application layer,
-- same as content_change_requests_select_own_or_admin already lets admins
-- see every row regardless of status for auditability) — only its own
-- author can see/resume it via the existing revise flow.
alter table public.content_change_requests
  drop constraint content_change_requests_status_check;

alter table public.content_change_requests
  add constraint content_change_requests_status_check
  check (status in ('draft', 'pending', 'changes_requested', 'approved', 'rejected', 'withdrawn'));

-- Widened from 0004's version: an editor can now update their own row
-- while it's a draft (to keep saving it) or transition it into 'pending'
-- (submit for review) or back to 'draft' (keep working) or 'withdrawn'.
drop policy content_change_requests_update_own on public.content_change_requests;

create policy content_change_requests_update_own
  on public.content_change_requests for update
  using (submitted_by = (select auth.uid()) and status in ('draft', 'pending', 'changes_requested'))
  with check (submitted_by = (select auth.uid()) and status in ('draft', 'pending', 'withdrawn'));
