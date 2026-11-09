-- CareerOS phase 1 schema. Run in your own Supabase SQL editor / migration CLI.
create extension if not exists pgcrypto;

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  target_role text not null default '' check (length(target_role) <= 160),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  original_text text not null default '' check (length(original_text) <= 100000),
  source_file_name text check (length(source_file_name) <= 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_user_recent_idx on public.resumes(user_id, updated_at desc);

create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  title text not null,
  target_role text not null default '',
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  unique (resume_id, version_no)
);
create index resume_versions_recent_idx on public.resume_versions(resume_id, version_no desc);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null default '',
  title text not null check (length(trim(title)) > 0),
  jd_text text not null default '',
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_user_recent_idx on public.jobs(user_id, created_at desc);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  resume_id uuid references public.resumes(id) on delete set null,
  company text not null default '',
  position text not null default '',
  status text not null default 'planned' check (status in ('planned','applied','interview','offer','rejected','withdrawn')),
  notes text not null default '',
  applied_at timestamptz,
  created_at timestamptz not null default now()
);
create index applications_user_recent_idx on public.applications(user_id, created_at desc);

-- RLS: private personal career data by ownership.
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy resumes_owner_select on public.resumes for select to authenticated using (user_id = (select auth.uid()));
create policy resumes_owner_insert on public.resumes for insert to authenticated with check (user_id = (select auth.uid()));
create policy resumes_owner_update on public.resumes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy resumes_owner_delete on public.resumes for delete to authenticated using (user_id = (select auth.uid()));

-- Snapshots may only refer to resumes owned by the same authenticated user.
create policy versions_owner_select on public.resume_versions for select to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid())));
create policy versions_owner_insert on public.resume_versions for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid())));
-- No direct update or delete of individual snapshots; parent cascade deletes them.

create policy jobs_owner_select on public.jobs for select to authenticated using (user_id = (select auth.uid()));
create policy jobs_owner_insert on public.jobs for insert to authenticated with check (user_id = (select auth.uid()));
create policy jobs_owner_update on public.jobs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy jobs_owner_delete on public.jobs for delete to authenticated using (user_id = (select auth.uid()));

create policy applications_owner_select on public.applications for select to authenticated using (user_id = (select auth.uid()));
create policy applications_owner_insert on public.applications for insert to authenticated with check (user_id = (select auth.uid()) and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid()))) and (resume_id is null or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid()))));
create policy applications_owner_update on public.applications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (job_id is null or exists (select 1 from public.jobs j where j.id = job_id and j.user_id = (select auth.uid()))) and (resume_id is null or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = (select auth.uid()))));
create policy applications_owner_delete on public.applications for delete to authenticated using (user_id = (select auth.uid()));

create function public.touch_resume_time() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger touch_resume_before_update before update on public.resumes for each row execute function public.touch_resume_time();

-- A snapshot is created in the SAME TRANSACTION as create/update.
create function public.snapshot_resume() returns trigger language plpgsql set search_path = '' as $$
declare next_no integer;
begin
  select coalesce(max(version_no), 0) + 1 into next_no from public.resume_versions where resume_id = new.id;
  insert into public.resume_versions(resume_id, user_id, version_no, title, target_role, content)
  values (new.id, new.user_id, next_no, new.title, new.target_role, new.content);
  return new;
end $$;
create trigger snapshot_resume_after_write after insert or update of title, target_role, content on public.resumes
for each row execute function public.snapshot_resume();

-- Restrict table access to authenticated users. RLS applies on all access.
revoke all on public.resumes, public.resume_versions, public.jobs, public.applications from anon;
grant select, insert, update, delete on public.resumes to authenticated;
grant select, insert on public.resume_versions to authenticated;
grant select, insert, update, delete on public.jobs, public.applications to authenticated;
