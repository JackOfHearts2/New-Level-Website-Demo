-- Public "report a problem" tickets. Any visitor (signed in or not) can
-- file one; only staff (editor/admin) can see or resolve them.
create table public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null check (issue_type in ('Incorrect info', 'Bug or broken feature', 'Something else')),
  details text not null,
  reporter_email text,
  page_url text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

create index problem_reports_status_idx on public.problem_reports(status);

alter table public.problem_reports enable row level security;

-- Same shape as the existing newsletter_subscribers anon-insert policy.
create policy problem_reports_insert_anon
  on public.problem_reports for insert
  with check (true);

create policy problem_reports_select_staff
  on public.problem_reports for select
  using (private.is_staff((select auth.uid())));

create policy problem_reports_update_staff
  on public.problem_reports for update
  using (private.is_staff((select auth.uid())))
  with check (private.is_staff((select auth.uid())));
