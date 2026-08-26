-- An append-only audit trail across the whole approval-workflow/reports
-- system. Deliberately a real table, not a view derived from existing
-- tables' timestamps: reopenReport already nulls out resolved_at/
-- resolved_by on reopen, so a view would silently lose "resolved ->
-- reopened" history the moment it happens, and a view can't show role
-- grants/revokes at all (nothing tracks those today).
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in (
    'submission_created', 'submission_updated', 'submission_approved',
    'submission_rejected', 'submission_changes_requested', 'submission_withdrawn',
    'editor_granted', 'editor_revoked', 'report_resolved', 'report_reopened'
  )),
  target_table text not null check (target_table in ('content_change_requests', 'problem_reports', 'profiles')),
  target_id uuid,
  summary text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_created_at_idx on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;

-- Admin-only for v1 (editors keep their own "my submissions" view on the
-- Approvals page as their personal history).
create policy activity_log_select_admin
  on public.activity_log for select
  using (private.is_admin((select auth.uid())));

-- Append-only: no update/delete policy at all.
create policy activity_log_insert_staff
  on public.activity_log for insert
  with check (private.is_staff((select auth.uid())) and actor_id = (select auth.uid()));
