-- Broadens activity_log for the "every change through the portal gets
-- logged, for anyone" requirement (client, 2026-08-26) — until now only
-- editor submissions/approvals/reports/role-grants were logged; an admin's
-- own instant "Save changes" (live publish) and any draft save by either
-- role were silent. Adds two event types for those, plus a `source` column
-- so a future deploy/CLI-triggered entry (planned, not wired yet — needs a
-- Netlify webhook, a separate step) can be told apart from a portal action
-- and rendered in its own "Code changes" section, admin-only, on the
-- Activity page.
alter table public.activity_log
  add column source text not null default 'portal' check (source in ('portal', 'cli'));

alter table public.activity_log
  drop constraint activity_log_event_type_check;

alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'submission_created', 'submission_updated', 'submission_approved',
    'submission_rejected', 'submission_changes_requested', 'submission_withdrawn',
    'editor_granted', 'editor_revoked', 'report_resolved', 'report_reopened',
    'content_published', 'content_draft_saved', 'code_deploy'
  ));

create index activity_log_source_idx on public.activity_log(source);
