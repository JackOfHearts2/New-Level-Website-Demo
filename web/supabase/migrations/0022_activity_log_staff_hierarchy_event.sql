-- Follow-up to 0021: a reports_to change is its own event type, not
-- editor_granted (which means an actual role grant and would be
-- misleading in the activity log if reused here).
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
    'staff_hierarchy_updated'
  ));
