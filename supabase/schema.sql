-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── PEOPLE ───────────────────────────────────────────────────────────────────
create type role_enum as enum ('co-chair', 'director', 'associate director');
create type subteam_enum as enum (
  'Engagement','Engineering','Finance','Logistics',
  'Marketing & Strategy','Programming','Co-Chairs','All-Board'
);

create table if not exists people (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        role_enum not null,
  subteam     subteam_enum not null,
  email       text,
  phone       text,
  location    text,
  linkedin    text,
  to_confirm  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── TASKS ────────────────────────────────────────────────────────────────────
create type task_status_enum as enum ('open','done','in progress','not started');

create table if not exists tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  owner_id     uuid references people(id) on delete set null,
  due_date     date,
  subteam_tags subteam_enum[] not null default '{}',
  status       task_status_enum not null default 'not started',
  month_bucket text not null,   -- format: YYYY-MM  (e.g. "2026-05")
  created_at   timestamptz not null default now()
);

-- ─── MILESTONES ───────────────────────────────────────────────────────────────
create table if not exists milestones (
  id            uuid primary key default gen_random_uuid(),
  month         text not null,  -- "Feb.", "March", etc.
  general_label text,
  team_label    text,
  team          subteam_enum
);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable realtime for tasks table so status changes broadcast live
alter publication supabase_realtime add table tasks;

-- ─── RLS (Row Level Security) ─────────────────────────────────────────────────
-- The site is protected by Basic Auth at the Next.js middleware layer.
-- We use the anon key from the browser only after the password check passes.
-- For simplicity, allow all operations with the anon key (the middleware is the gate).
alter table people enable row level security;
alter table tasks enable row level security;
alter table milestones enable row level security;

create policy "allow_all_people"     on people     for all using (true) with check (true);
create policy "allow_all_tasks"      on tasks      for all using (true) with check (true);
create policy "allow_all_milestones" on milestones for all using (true) with check (true);
