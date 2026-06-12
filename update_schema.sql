-- SQL MIGRÁCIA PRE STAVEBNINY ĽUBEĽA
-- Spustite tento skript v Supabase SQL Editore.

-- 1. Rozšírenie tabuľky rental_bookings o podporu časov a dovozu
alter table rental_bookings add column if not exists start_time text;
alter table rental_bookings add column if not exists end_time text;
alter table rental_bookings add column if not exists delivery_method text default 'pickup';
alter table rental_bookings add column if not exists delivery_address text;
alter table rental_bookings add column if not exists delivery_city text;
alter table rental_bookings add column if not exists delivery_zip text;
alter table rental_bookings add column if not exists delivery_municipality text;
alter table rental_bookings add column if not exists delivery_price numeric(10,2) default 0.00;

-- 2. Vytvorenie predvolených nastavení pre oznamovací banner
insert into site_settings (key, value) values 
('hours_alert_enabled', 'false'),
('hours_alert_message', ''),
('hours_alert_type', 'info')
on conflict (key) do nothing;

-- 3. Vloženie nových poľnohospodárskych kategórií
insert into categories (name, type) values 
('Postreky', 'agriculture'),
('Hrable a náradie', 'agriculture')
on conflict (name) do nothing;

-- 4. Vloženie vzorových produktov pre nové kategórie (ak ešte neexistujú podľa SKU)
insert into products (name, description, price, category, sku, stock_quantity, image_url, type, unit) values
('Kuprikol 50 (100g)', 'Tradičný mednatý prípravok vo forme zmáčateľného prášku na ochranu rastlín proti plesniam a hubovým chorobám.', 4.80, 'Postreky', 'AGR-POS-KUP', 50, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture', 'balenie'),
('Bofix (100ml)', 'Selektívny systémový herbicíd na ničenie dvojklíčnolistových burín v trávnikoch.', 8.50, 'Postreky', 'AGR-POS-BOF', 30, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture', 'balenie'),
('Záhradné hrable kovové (14 zubov)', 'Kvalitné kovové hrable s drevenou násadou pre prácu v záhrade, hrabanie lístia a hliny.', 12.90, 'Hrable a náradie', 'AGR-NAR-HRA', 25, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80', 'agriculture', 'ks'),
('Záhradná lopata Fiskars', 'Ergonomická špicatá lopata s kovovou násadou pre ľahké rytie a prácu so zeminou.', 24.50, 'Hrable a náradie', 'AGR-NAR-LOP', 15, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'agriculture', 'ks')
on conflict (sku) do nothing;
