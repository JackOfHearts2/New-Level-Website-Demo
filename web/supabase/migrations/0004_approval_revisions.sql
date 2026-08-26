-- Adds a third review outcome ("changes requested") and lets an editor
-- revise or withdraw their own still-open submission — previously they
-- had zero UPDATE rights on content_change_requests at all.
alter table public.content_change_requests
  drop constraint content_change_requests_status_check;

alter table public.content_change_requests
  add constraint content_change_requests_status_check
  check (status in ('pending', 'changes_requested', 'approved', 'rejected', 'withdrawn'));

create policy content_change_requests_update_own
  on public.content_change_requests for update
  using (submitted_by = (select auth.uid()) and status in ('pending', 'changes_requested'))
  with check (submitted_by = (select auth.uid()) and status in ('pending', 'withdrawn'));

-- RLS alone can't express "this column stays fixed regardless of who's
-- updating" — a trigger is the right tool. Admins are exempt (they're the
-- ones setting reviewed_by/reviewed_at/review_note in the first place);
-- an owner revising/withdrawing their own row is blocked from touching
-- who submitted it, what it targets, when it was created, or any
-- reviewer field.
create or replace function private.guard_change_request_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.is_admin(auth.uid()) then
    return new;
  end if;
  if new.submitted_by is distinct from old.submitted_by
     or new.target_type is distinct from old.target_type
     or new.created_at is distinct from old.created_at
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.review_note is distinct from old.review_note then
    raise exception 'Not allowed to change this field on a content change request.';
  end if;
  return new;
end;
$$;

create trigger content_change_requests_guard_update
  before update on public.content_change_requests
  for each row execute function private.guard_change_request_update();
