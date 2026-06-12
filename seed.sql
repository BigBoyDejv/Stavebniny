  -- SEED DATA PRE STAVEBNINY ĽUBEĽA
-- Rozšírená databáza pre profesionálnu ukážku e-shopu v2.0

-- Reset tabuliek
truncate table products cascade;
truncate table rental_items cascade;
drop table if exists categories cascade;

-- Zabezpečenie správnej schémy
alter table if exists rental_items add column if not exists category text;
alter table if exists products add column if not exists type text default 'material';

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  type text default 'material', -- material, tool, rental
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Vloženie kategórií
insert into categories (name, type) values 
('Hrubá stavba', 'material'),
('Suchá výstavba', 'material'),
('Izolácie', 'material'),
('Strechy', 'material'),
('Záhrada', 'material'),
('Ručné náradie', 'tool'),
('Elektrické náradie', 'tool'),
('Farby a laky', 'tool'),
('Ochranné pomôcky', 'tool'),
('Stroje', 'rental'),
('Náradie', 'rental'),
('Vybavenie', 'rental'),
('Krmivá', 'agriculture'),
('Hnojivá', 'agriculture'),
('Substráty', 'agriculture'),
('Osivá a semená', 'agriculture'),
('Postreky', 'agriculture'),
('Hrable a náradie', 'agriculture');


-- 1. PRODUKTY (MATERIÁLY) - 20 Položiek
insert into products (name, description, price, category, sku, stock_quantity, image_url, type) values
('Tehla Porotherm 30 Profi', 'Brúsená tehla pre obvodové murivo s vysokou tepelnou izoláciou.', 2.45, 'Hrubá stavba', 'TEH-P30', 1200, 'https://images.unsplash.com/photo-1590069230005-db32bc76f57b?auto=format&fit=crop&w=800&q=80', 'material'),
('Tvárnica DT 20 (50x20x25)', 'Betónová tvárnica pre stratené debnenie základov.', 1.85, 'Hrubá stavba', 'TVAR-DT20', 850, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 'material'),
('Cement CEM II 32.5 R (25kg)', 'Portlandský cement pre bežné betónárske práce.', 4.20, 'Hrubá stavba', 'CEM-25KG', 200, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80', 'material'),
('Murovacia malta Profi (25kg)', 'Suchá zmes pre murovanie z tehál i tvárnic.', 4.80, 'Hrubá stavba', 'MAL-25KG', 300, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'material'),
('Sádrokartón GKB 12.5mm', 'Štandardná sádrokartónová doska Rigips.', 8.90, 'Suchá výstavba', 'SDK-GKB12', 150, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 'material'),
('Sádrokartón RBI (Vodeodolný)', 'Zelená doska do kúpeľní.', 12.50, 'Suchá výstavba', 'SDK-RBI12', 80, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'material'),
('CD Profil 3m', 'Oceľový profil pre sádrokartónové podhľady.', 3.20, 'Suchá výstavba', 'PRO-CD3', 200, 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80', 'material'),
('Polystyrén EPS 70 (100mm)', 'Fasádny polystyrén pre zateplenie.', 9.50, 'Izolácie', 'ISO-EPS70', 300, 'https://images.unsplash.com/photo-1615529175066-6b215886d34e?auto=format&fit=crop&w=800&q=80', 'material'),
('Lepidlo na zateplenie (25kg)', 'Lepiaca malta pre EPS.', 5.90, 'Izolácie', 'LEP-25KG', 250, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80', 'material'),
('Škridla Bramac Classic', 'Strešná krytina – Čierna.', 1.45, 'Strechy', 'STR-BRC', 2000, 'https://images.unsplash.com/photo-1632759162453-194f4c1722ec?auto=format&fit=crop&w=800&q=80', 'material'),
('Zámková dlažba 6cm Sivá', 'Dlažba pre chodníky.', 14.90, 'Záhrada', 'DLZ-HO6', 50, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80', 'material'),
('Záhradný obrubník', 'Betónová príruba.', 2.80, 'Záhrada', 'OBR-ZAH', 120, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80', 'material');

-- 2. PRODUKTY (NÁSTROJE) - 10 Položiek
insert into products (name, description, price, category, sku, stock_quantity, image_url, type) values
('Kladivo 500g Stanley', 'Kvalitné tesárske kladivo s ergonomickou rúčkou.', 14.50, 'Ručné náradie', 'NAR-KLAD', 15, 'https://images.unsplash.com/photo-1586864387417-f58fd44fa20e?auto=format&fit=crop&w=800&q=80', 'tool'),
('Uhlová brúska Bosch GWS', '125mm elektrická brúska pre profesionálov.', 89.00, 'Elektrické náradie', 'NAR-BRUS', 8, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'tool'),
('Sada skrutkovačov (6ks)', 'Sada plochých a krížových skrutkovačov.', 19.90, 'Ručné náradie', 'NAR-SKRD', 20, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'tool'),
('Primalex Plus 15kg', 'Biela interiérová farba.', 22.90, 'Farby a laky', 'COL-PRXP15', 30, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 'tool'),
('Štetec plochý 2.5"', 'Štetec na natieranie dreva a kovov.', 3.20, 'Farby a laky', 'COL-STET', 50, 'https://images.unsplash.com/photo-1596495573105-31054700d1d2?auto=format&fit=crop&w=800&q=80', 'tool'),
('Meter 5m zvinovací', 'Robustný zvinovací meter so zámkom.', 5.80, 'Ručné náradie', 'NAR-MET5', 40, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'tool');

-- 4. POĽNOHOSPODÁRSKE PRODUKTY
insert into products (name, description, price, category, sku, stock_quantity, image_url, type) values
('Krmivo pre nosnice Klasik (25kg)', 'Kompletná kŕmna zmes pre nosnice v období znášky.', 16.90, 'Krmivá', 'AGR-KRM-NOS', 45, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Záhradnícky substrát B (50L)', 'Univerzálny záhradnícky substrát s aktívnym humusom.', 5.20, 'Substráty', 'AGR-SUB-50L', 120, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Cererit hnojivo s guánom (10kg)', 'Bezchloridové granulované organominerálne hnojivo.', 11.50, 'Hnojivá', 'AGR-HNO-CER', 60, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Trávne semeno Šport (1kg)', 'Kvalitná trávna zmes pre zaťažované plochy.', 6.80, 'Osivá a semená', 'AGR-SEM-TRA', 30, 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Kuprikol 50 (100g)', 'Tradičný mednatý prípravok vo forme zmáčateľného prášku na ochranu rastlín proti plesniam a hubovým chorobám.', 4.80, 'Postreky', 'AGR-POS-KUP', 50, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Bofix (100ml)', 'Selektívny systémový herbicíd na ničenie dvojklíčnolistových burín v trávnikoch.', 8.50, 'Postreky', 'AGR-POS-BOF', 30, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Záhradné hrable kovové (14 zubov)', 'Kvalitné kovové hrable s drevenou násadou pre prácu v záhrade, hrabanie lístia a hliny.', 12.90, 'Hrable a náradie', 'AGR-NAR-HRA', 25, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Záhradná lopata Fiskars', 'Ergonomická špicatá lopata s kovovou násadou pre ľahké rytie a prácu so zeminou.', 24.50, 'Hrable a náradie', 'AGR-NAR-LOP', 15, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'agriculture');


-- 3. POŽIČOVŇA
insert into rental_items (name, daily_price, availability, image_url, category) values
('Minibager Takeuchi TB216', 150.00, true, 'https://images.unsplash.com/photo-1579450334237-4b7e335025d2?auto=format&fit=crop&w=800&q=80', 'Stroje'),
('Vibračná doska 100kg', 35.00, true, 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80', 'Stroje'),
('Hilti TE 1000 Kladivo', 45.00, true, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Náradie');
