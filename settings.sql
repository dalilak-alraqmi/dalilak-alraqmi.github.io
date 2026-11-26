-- Theme and font settings (owner changes them from the admin panel)
create table if not exists public.settings (key text primary key, value text not null);
alter table public.settings enable row level security;
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
create policy "read settings" on public.settings for select using (true);
create policy "admin insert settings" on public.settings for insert with check (public.is_admin());
create policy "admin update settings" on public.settings for update using (public.is_admin());
insert into public.settings values ('theme','logo'),('font','thmanyah') on conflict (key) do nothing;
