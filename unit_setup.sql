-- SQL skript pre pridanie stĺpca 'unit' do tabuľky produktov a aktualizáciu dát.
-- Spustite tento skript v Supabase SQL Editore.

-- 1. Pridanie stĺpca unit s predvolenou hodnotou 'ks'
alter table products add column if not exists unit text default 'ks';

-- 2. Aktualizácia jednotiek pre existujúce produkty (podľa názvu/kategórie)

-- Karisiete, tvárnice, tehly (predávané na ks)
update products set unit = 'ks' where name ilike '%tehla%' or name ilike '%tvárnica%' or name ilike '%karisieť%' or name ilike '%profil%' or name ilike '%štetec%' or name ilike '%meter%' or name ilike '%kladivo%' or name ilike '%brúska%' or name ilike '%skrutkovač%';

-- Screws / vruty (predávané na 100 ks)
update products set unit = '100 ks' where name ilike '%skrutk%' or name ilike '%vrut%';

-- Nails / drôty (predávané na kg)
update products set unit = 'kg' where name ilike '%klin%' or name ilike '%drôt%';

-- Cement, malta, lepidlo (predávané na ks / vrecia)
update products set unit = 'ks' where name ilike '%cement%' or name ilike '%malta%' or name ilike '%lepidlo%';

-- Farby, laky, lazúry, Primalex (predávané na balenie - vedro, plechovka atď)
update products set unit = 'balenie' where name ilike '%farba%' or name ilike '%lak%' or name ilike '%lazúr%' or name ilike '%primalex%' or name ilike '%primál%';

-- Hnojivá, substráty, krmivá, osivá (predávané na balenie - vrece, krabica atď)
update products set unit = 'balenie' where name ilike '%hnojiv%' or name ilike '%substrát%' or name ilike '%krmiv%' or name ilike '%osiv%';

-- Polystyrén, zámková dlažba (predávané na m² - "štvorce")
update products set unit = 'm²' where name ilike '%polystyrén%' or name ilike '%dlažba%' or name ilike '%izolác%';

