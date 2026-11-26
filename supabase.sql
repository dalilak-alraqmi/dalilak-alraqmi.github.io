-- Run once in Supabase > SQL Editor
create table if not exists public.admins (email text primary key);
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  slug text unique not null,
  title text not null,
  cat text not null default 'عام',
  description text not null,
  body text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
alter table public.admins enable row level security;
create or replace function public.is_admin() returns boolean language sql security definer as
$$ select exists(select 1 from public.admins where email = (auth.jwt()->>'email')) $$;
create policy "read published" on public.posts for select using (published or public.is_admin());
create policy "admin insert" on public.posts for insert with check (public.is_admin());
create policy "admin update" on public.posts for update using (public.is_admin());
create policy "admin delete" on public.posts for delete using (public.is_admin());
create policy "admin sees admins" on public.admins for select using (public.is_admin());
-- After the owner signs up on the site, add them (replace the email):
-- insert into public.admins values ('owner@example.com');
