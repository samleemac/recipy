-- ============================================================
-- Adds the `avatars` storage bucket + opens existing storage policies
-- so users can upload their own profile photo. Safe to re-run.
--
-- Paste this into Supabase → SQL Editor → New query → Run.
-- ============================================================

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- Replace the existing bucket-list policies so `avatars` is included
-- alongside `cooks` and `recipes`.
drop policy if exists "cooks public read"          on storage.objects;
drop policy if exists "cooks authenticated upload" on storage.objects;
drop policy if exists "cooks owner delete"         on storage.objects;

create policy "cooks public read"
  on storage.objects for select
  using (bucket_id in ('cooks','recipes','avatars'));

create policy "cooks authenticated upload"
  on storage.objects for insert
  with check (bucket_id in ('cooks','recipes','avatars') and auth.role() = 'authenticated');

create policy "cooks owner delete"
  on storage.objects for delete
  using (bucket_id in ('cooks','recipes','avatars') and owner = auth.uid());

-- Allow overwriting your own avatar (so the upsert flow works).
drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());
