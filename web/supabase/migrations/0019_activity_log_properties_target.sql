-- Properties get their own activity-log entries (submitted/published/
-- approved/rejected/changes-requested), same as content changes — needs
-- 'properties' as a valid target_table.
alter table public.activity_log
  drop constraint activity_log_target_table_check;

alter table public.activity_log
  add constraint activity_log_target_table_check
  check (target_table in ('content_change_requests', 'problem_reports', 'profiles', 'properties'));
