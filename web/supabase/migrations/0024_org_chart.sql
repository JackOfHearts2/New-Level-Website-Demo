-- Real visual org chart (client ask, 2026-08-27): "think circles with
-- lines that connect to each other... click on one of those circles to
-- add an individual, add their role, their picture, their contact
-- information, and set their permissions... it has to be easy to edit...
-- click on that circle and drag it to be below another one."
--
-- Supersedes last round's approach of driving the chart straight off
-- `profiles` (title/department/reports_to, migration 0023): that only
-- covered people who already have a real dashboard login, but the client
-- explicitly wants to sketch positions that don't have a hire yet ("who's
-- the CFO, who's the CTO" — aspirational headcount, not just today's two
-- accounts). org_members is a standalone "position in the chart" record
-- that OPTIONALLY links to a real profiles row — a real-business-software
-- pattern (Rippling/Pingboard-style org charts separate the org record
-- from the system-login record) rather than requiring an auth account to
-- exist before a box can go on the chart. profiles.title/department/
-- reports_to from 0023 are left in place but unused going forward — not
-- worth a data migration for two rows.
create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.org_members(id) on delete set null,
  linked_profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  title text,
  department text,
  email text,
  phone text,
  avatar_updated_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index org_members_parent_id_idx on public.org_members(parent_id, sort_order);
-- A dashboard account can only occupy one box on the chart.
create unique index org_members_linked_profile_id_idx
  on public.org_members(linked_profile_id) where linked_profile_id is not null;

alter table public.org_members enable row level security;

-- Any staff member can see the chart (client ask: "if it's an editor we
-- bring on... they can see the organization structure") — only admins can
-- change it.
create policy org_members_select_staff
  on public.org_members for select
  using (private.is_staff((select auth.uid())));

create policy org_members_insert_admin
  on public.org_members for insert
  with check (private.is_admin((select auth.uid())));

create policy org_members_update_admin
  on public.org_members for update
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy org_members_delete_admin
  on public.org_members for delete
  using (private.is_admin((select auth.uid())));

-- Seed one chart box per existing staff account, carrying over whatever
-- 0023 already captured, so the chart isn't empty on first load.
insert into public.org_members (linked_profile_id, name, title, department, email)
select id, coalesce(full_name, email, 'Unknown'), title, department, email
from public.profiles
where role in ('editor', 'admin');

update public.org_members om
set parent_id = parent_om.id
from public.profiles p
join public.org_members parent_om on parent_om.linked_profile_id = p.reports_to
where om.linked_profile_id = p.id and p.reports_to is not null;

alter table public.activity_log
  drop constraint activity_log_target_table_check;
alter table public.activity_log
  add constraint activity_log_target_table_check
  check (target_table in ('content_change_requests', 'problem_reports', 'profiles', 'properties', 'inquiries', 'onboarding_tasks', 'work_reports', 'org_members'));

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
    'work_report_submitted', 'org_member_added', 'org_member_updated',
    'org_member_moved', 'org_member_removed'
  ));
