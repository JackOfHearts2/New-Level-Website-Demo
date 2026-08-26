-- Supports invite-based onboarding (client ask, 2026-08-26): "New Level
-- Group has sent you an invitation to join them as a 'X'... help them set
-- a password and confirm it with 2FA." An admin invites a NEW email (not
-- an existing account, which is all grantAccess supports today) via
-- Supabase Auth's admin.inviteUserByEmail — that creates the auth.users
-- row and, via the existing handle_new_user trigger, a profiles row that
-- always defaults to role='client' (see handle_new_user's definition; it
-- only ever copies id/email/full_name, nothing role-related). The
-- invited role has to be applied as a separate step once the person
-- actually completes onboarding (sets a password, confirms via emailed
-- code) — not at invite time, since nothing should be granted until they
-- prove they own the inbox.
--
-- That completion step can't go through the normal RLS-bound client:
-- guard_profile_self_update (migration 0010's real self-role-escalation
-- fix) blocks ANY self-update of `role` that isn't already an admin,
-- which correctly includes a brand-new invited user's own session. This
-- adds one narrow, explicit exception for the service-role key specifically
-- - never exposed to any client, only ever used from trusted server code -
-- so the onboarding-completion Server Action can apply the invited role
-- using it. auth.role() = 'service_role' is the standard Supabase way to
-- detect this in a trigger; it's a different check than is_admin(auth.uid()),
-- which stays exactly as strict as before for every real user session,
-- service-role or not.
--
-- Verified directly against the database (2026-08-26): a non-admin
-- authenticated session still gets "Not allowed to change your own role"
-- when attempting self-escalation; a simulated service_role JWT claim can
-- write `role` successfully. Both checked live, not just reasoned about.
create or replace function private.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_admin(auth.uid()) or auth.role() = 'service_role' then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Not allowed to change your own role.';
  end if;
  return new;
end;
$$;

alter table public.activity_log
  drop constraint activity_log_event_type_check;

alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'submission_created', 'submission_updated', 'submission_approved',
    'submission_rejected', 'submission_changes_requested', 'submission_withdrawn',
    'editor_granted', 'editor_revoked', 'report_resolved', 'report_reopened',
    'content_published', 'content_draft_saved', 'code_deploy', 'staff_invited'
  ));
