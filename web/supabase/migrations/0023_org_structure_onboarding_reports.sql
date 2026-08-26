-- Org structure framework (client ask, 2026-08-27): "building in a team
-- members or a company structure... so the user, if it's an editor we
-- bring on down the line, can see the organization structure... who's the
-- CEO, who's the CFO... report directly to the broker... you can use the
-- design I sent for the little circles with the avatar... onboarding
-- profile... actionable steps they can check off... submit reports to
-- their senior editor... we're not a massive company, but I want to build
-- the framework so the company can grow into it."
--
-- Explicitly framework-first per the client's own "12-bedroom house"
-- framing: this is schema + a working first pass at the UI, not the
-- differentiated per-department dashboards/permissions they described as
-- a later phase ("we don't need to have those built yet... I do want the
-- organization to try to be there").

-- Job title (free text — "CEO", "Marketing and AI Systems Consultant",
-- etc.) is distinct from `role`, which stays the coarse dashboard-
-- permission tier (editor/admin) and shouldn't be overloaded to also mean
-- "job title." department is free text too, not an enum — a small,
-- growing company's real department names shouldn't require a schema
-- migration every time one changes or gets added.
alter table public.profiles add column title text;
alter table public.profiles add column department text;

-- Per-person onboarding checklist. created_by is who assigned it (an
-- admin), not necessarily the same person it's assigned to.
create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index onboarding_tasks_user_id_idx on public.onboarding_tasks(user_id, sort_order);

alter table public.onboarding_tasks enable row level security;

create policy onboarding_tasks_select_own_or_admin
  on public.onboarding_tasks for select
  using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

-- Assigning tasks (creating them) is an admin action — an editor doesn't
-- write their own onboarding checklist, they work through one someone
-- else set up.
create policy onboarding_tasks_insert_admin
  on public.onboarding_tasks for insert
  with check (private.is_admin((select auth.uid())));

create policy onboarding_tasks_update_own_or_admin
  on public.onboarding_tasks for update
  using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())))
  with check (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy onboarding_tasks_delete_admin
  on public.onboarding_tasks for delete
  using (private.is_admin((select auth.uid())));

-- Same reasoning as guard_property_update: RLS's WITH CHECK can't pin
-- individual columns as immutable to a non-admin — the assigned person
-- should only ever be able to toggle their own task's completed state,
-- never rewrite its title/description/due date/who assigned it.
create or replace function private.guard_onboarding_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_admin(auth.uid()) then
    return new;
  end if;
  if new.title is distinct from old.title
     or new.description is distinct from old.description
     or new.due_date is distinct from old.due_date
     or new.created_by is distinct from old.created_by
     or new.sort_order is distinct from old.sort_order
     or new.user_id is distinct from old.user_id then
    raise exception 'Not allowed to change this field on an onboarding task.';
  end if;
  if new.completed and not old.completed then
    new.completed_at = now();
  elsif not new.completed then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger onboarding_tasks_guard_update
  before update on public.onboarding_tasks
  for each row execute function private.guard_onboarding_task_update();

-- Periodic free-text work reports a staff member submits to whoever they
-- report to (or an admin, if reports_to isn't set) — client ask: "submit
-- reports to their senior editor... to show what kind of work they did."
-- Append-only, same as activity_log/inquiry_notes — a report is a record,
-- not something to edit after the fact.
create table public.work_reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete set null,
  period_label text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index work_reports_author_id_idx on public.work_reports(author_id, created_at desc);
create index work_reports_recipient_id_idx on public.work_reports(recipient_id, created_at desc);

alter table public.work_reports enable row level security;

create policy work_reports_select_involved_or_admin
  on public.work_reports for select
  using (
    author_id = (select auth.uid())
    or recipient_id = (select auth.uid())
    or private.is_admin((select auth.uid()))
  );

create policy work_reports_insert_own
  on public.work_reports for insert
  with check (private.is_staff((select auth.uid())) and author_id = (select auth.uid()));

-- No update/delete policy — append-only.

alter table public.activity_log
  drop constraint activity_log_target_table_check;
alter table public.activity_log
  add constraint activity_log_target_table_check
  check (target_table in ('content_change_requests', 'problem_reports', 'profiles', 'properties', 'inquiries', 'onboarding_tasks', 'work_reports'));

alter table public.activity_log
  drop constraint activity_log_event_type_check;
alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'submission_created', 'submission_updated', 'submission_approved',
    'submission_rejected', 'submission_changes_requested', 'submission_withdrawn',
    'editor_granted', 'editor_revoked', 'report_resolved', 'report_reopened',
    'content_published', 'content_draft_saved', 'code_deploy', 'staff_invited',
    'inquiry_status_changed', 'inquiry_assigned', 'inquiry_note_added',
    'staff_hierarchy_updated', 'onboarding_task_assigned', 'onboarding_task_completed',
    'work_report_submitted'
  ));
