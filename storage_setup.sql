-- SQL skript pre nastavenie Supabase Storage pre fotky produktov
-- Tento skript povolí verejné čítanie a nahrávanie fotiek do bucketu product-images.

-- 1. Vytvorenie bucketu (ak neexistuje)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. RLS Politika pre čítanie (ktokoľvek môže vidieť fotky)
drop policy if exists "Verejné čítanie fotiek" on storage.objects;
create policy "Verejné čítanie fotiek"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- 3. RLS Politika pre nahrávanie (vkladanie nových fotiek)
drop policy if exists "Verejné nahrávanie fotiek" on storage.objects;
create policy "Verejné nahrávanie fotiek"
on storage.objects for insert
with check ( bucket_id = 'product-images' );

-- 4. RLS Politika pre úpravu fotiek (ak by bolo potrebné prepísať existujúce)
drop policy if exists "Verejná úprava fotiek" on storage.objects;
create policy "Verejná úprava fotiek"
on storage.objects for update
using ( bucket_id = 'product-images' );

-- 5. RLS Politika pre mazanie fotiek
drop policy if exists "Verejné mazanie fotiek" on storage.objects;
create policy "Verejné mazanie fotiek"
on storage.objects for delete
using ( bucket_id = 'product-images' );
