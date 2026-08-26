-- Lightweight inquiries pipeline + staff reporting hierarchy (client ask,
-- 2026-08-27: "a way to track inquiries... a bit of a CRM framework, not a
-- full thing... qualify those inquiries... the initial response needs to
-- happen from the platform... team member section that shows who reports
-- to who... message them, escalate to them, add them as a participant").
--
-- Scoped per the client's own follow-up answers rather than guessed:
-- - Initial response = a note logged on the inquiry, with an optional real
--   email to the inquirer (inquiry_notes.emailed) — not a full helpdesk.
-- - After qualification, this stays internal status stages
--   (new/contacted/qualified/converted/lost) + a copy/export action in the
--   UI; no external CRM integration (that's a future ask once a specific
--   tool is chosen).
-- - Hierarchy applies to real staff accounts (profiles), not the public
--   marketing team roster in content.ts (still placeholder names/bios) —
--   reports_to lets an admin lay out placeholder reporting lines now,
--   reassignable once the real org structure is set.
-- - "Message them" = a threaded comment per inquiry (inquiry_notes again,
--   doubling as both the initial-response record and the ongoing
--   discussion trail), not real-time chat/DMs.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  -- Which public form this came from — property.html's InquiryForm,
  -- contact.html's general form, or the careers form. All three are
  -- currently demo-only (submit and confirm, but save nothing); this is
  -- the real backing table they start writing to.
  source text not null check (source in ('property', 'contact', 'careers')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),

  name text not null,
  email text not null,
  phone text,
  contact_method text,
  message text,
  -- Per-source extra fields that don't need their own columns (property
  -- purpose/dates/quote summary, career role applied for, etc.) — same
  -- "flexible bag for source-specific detail" role jsonb plays elsewhere
  -- in this schema (properties.photos, activity_log.metadata).
  metadata jsonb not null default '{}'::jsonb,

  assigned_to uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_idx on public.inquiries(status);
create index inquiries_assigned_to_idx on public.inquiries(assigned_to);
create index inquiries_created_at_idx on public.inquiries(created_at desc);

alter table public.inquiries enable row level security;

-- Public forms submit without a session — same shape as
-- problem_reports_insert_anon (with check (true), no anon SELECT policy
-- at all so a submitter can never read other inquiries back).
create policy inquiries_insert_public
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy inquiries_select_staff
  on public.inquiries for select
  using (private.is_staff((select auth.uid())));

create policy inquiries_update_staff
  on public.inquiries for update
  using (private.is_staff((select auth.uid())))
  with check (private.is_staff((select auth.uid())));

-- No delete policy — inquiries are a permanent record, same as
-- activity_log's append-only stance.

create or replace function private.set_inquiry_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function private.set_inquiry_updated_at();

-- The initial-response record AND the ongoing per-inquiry comment thread
-- are the same mechanism (client ask covered both with the same "message
-- them" / "initial response from the platform" language) — one note row,
-- optionally flagged as also sent to the inquirer as a real email.
create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

create index inquiry_notes_inquiry_id_idx on public.inquiry_notes(inquiry_id, created_at);

alter table public.inquiry_notes enable row level security;

create policy inquiry_notes_select_staff
  on public.inquiry_notes for select
  using (private.is_staff((select auth.uid())));

create policy inquiry_notes_insert_staff
  on public.inquiry_notes for insert
  with check (private.is_staff((select auth.uid())) and author_id = (select auth.uid()));

-- Notes are an append-only discussion trail — no update/delete policy.

-- Staff reporting hierarchy — nullable, self-referencing. Deliberately no
-- circular-reference guard beyond what a human would notice in a small
-- staff list; not worth a recursive CHECK for the handful of rows this
-- will ever have.
alter table public.profiles
  add column reports_to uuid references public.profiles(id) on delete set null;

-- Widen activity_log for the new event types + target table.
alter table public.activity_log
  drop constraint activity_log_target_table_check;
alter table public.activity_log
  add constraint activity_log_target_table_check
  check (target_table in ('content_change_requests', 'problem_reports', 'profiles', 'properties', 'inquiries'));

alter table public.activity_log
  drop constraint activity_log_event_type_check;
alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'submission_created', 'submission_updated', 'submission_approved',
    'submission_rejected', 'submission_changes_requested', 'submission_withdrawn',
    'editor_granted', 'editor_revoked', 'report_resolved', 'report_reopened',
    'content_published', 'content_draft_saved', 'code_deploy', 'staff_invited',
    'inquiry_status_changed', 'inquiry_assigned', 'inquiry_note_added'
  ));
