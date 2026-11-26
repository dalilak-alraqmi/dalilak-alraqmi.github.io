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
  sample boolean not null default false,
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
grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.admins to authenticated;
-- After the owner signs up on the site, add them (replace the email):
-- insert into public.admins values ('owner@example.com');

-- Theme and font settings (owner changes them from the admin panel)
create table if not exists public.settings (key text primary key, value text not null);
alter table public.settings enable row level security;
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
create policy "read settings" on public.settings for select using (true);
create policy "admin insert settings" on public.settings for insert with check (public.is_admin());
create policy "admin update settings" on public.settings for update using (public.is_admin());
insert into public.settings values ('theme','logo'),('font','thmanyah') on conflict (key) do nothing;
