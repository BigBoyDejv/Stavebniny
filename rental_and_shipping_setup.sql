-- SQL skript pre rozšírenie tabuľky rental_items, import 24 položiek požičovne a nahratie cenníka dopravy do site_settings.
-- Spustite tento skript v Supabase SQL Editore.

-- 1. Úprava tabuľky rental_items - pridanie chýbajúcich stĺpcov pre pokročilé nacenenie a detaily
alter table rental_items add column if not exists price4h numeric(10,2) default 0.00;
alter table rental_items add column if not exists price24h numeric(10,2) default 0.00;
alter table rental_items add column if not exists deposit numeric(10,2) default 100.00;
alter table rental_items add column if not exists description text default '';
alter table rental_items add column if not exists note text default '';
alter table rental_items add column if not exists accessories jsonb default '[]'::jsonb;
alter table rental_items alter column daily_price drop not null;

-- 2. Povolenie RLS a definovanie prístupu pre rental_items
alter table rental_items enable row level security;

drop policy if exists "Povoliť verejné čítanie rental_items" on rental_items;
create policy "Povoliť verejné čítanie rental_items" 
on rental_items for select 
using ( true );

drop policy if exists "Povoliť úpravu rental_items pre adminov" on rental_items;
create policy "Povoliť úpravu rental_items pre adminov" 
on rental_items for all 
using ( true )
with check ( true );

-- 3. Vyčistenie starých položiek (ak existujú) a nahratie 24 kompletných nástrojov cenníka
truncate table rental_items cascade;

insert into rental_items (id, name, category, price4h, price24h, deposit, image_url, description, note, accessories, availability) values
-- Vibračná a hutniaca technika
('6ee5a97d-6c17-4ef8-8255-e46be9f518e1', 'Vibračná doska 160 kg', 'Vibračná a hutniaca technika', 24.60, 43.00, 200.00, 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80', 'Profesionálna vibračná doska strednej váhovej kategórie s reverzným posunom, ideálna na hutnenie piesku, štrku a zámkovej dlažby.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e2', 'Vibračná doska 100 kg', 'Vibračná a hutniaca technika', 18.50, 36.90, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Jednosmerná vibračná doska vhodná na asfaltové práce, úpravy chodníkov a záhradné terénne úpravy.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e3', 'Podložka k vibračnej doske (Samostatná)', 'Vibračná a hutniaca technika', 2.50, 2.50, 20.00, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80', 'Gumená (polyuretánová) tlmiaca podložka zabraňujúca poškodeniu vibrovaného materiálu (napr. zámkovej dlažby).', '', '[]'::jsonb, true),

-- Sekanie a vŕtanie
('6ee5a97d-6c17-4ef8-8255-e46be9f518e4', 'Búracie kladivo (Ťažké)', 'Sekanie a vŕtanie', 18.50, 24.60, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Vysoko výkonné zbíjacie kladivo na búranie betónu, muriva a podláh.', '', '[{"id": "sekac", "name": "Opotrebenie sekáča (plochý/špicatý)", "price": 5.00, "flat": true, "unit": "ks"}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e5', 'AKU skrutkovač / Vŕtačka', 'Sekanie a vŕtanie', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80', 'Akumulátorová príklepová vŕtačka a uťahovačka s 2 batériami pre plynulú prácu.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e6', 'Vŕtacie kladivo SDS-Plus', 'Sekanie a vŕtanie', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80', 'Kombinované vŕtacie a sekacie kladivo pre vŕtanie do betónu a ľahšie sekacie práce.', '', '[{"id": "sekac-vrtak", "name": "Opotrebenie SDS vrtákov/sekáčov", "price": 10.00, "flat": true}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e7', 'Motorový pôdny vrták', 'Sekanie a vŕtanie', 30.00, 49.00, 200.00, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'Benzínový jednochlapový pôdny vrták pre hĺbenie dier na stĺpiky plotov, výsadbu stromčekov a základy.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f518e8', 'Vrtáky a sekáče (Súprava)', 'Sekanie a vŕtanie', 10.00, 10.00, 30.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Sada rôznych vrtákov a sekáčov pre bežné murovacie práce.', '', '[]'::jsonb, true),

-- Pílenie a rezanie
('6ee5a97d-6c17-4ef8-8255-e46be9f518e9', 'Rezačka na polystyrén (odporová)', 'Pílenie a rezanie', 12.30, 24.60, 100.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Tavná rezačka na presné a čisté bezodpadové rezanie fasádneho a podlahového polystyrénu.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51810', 'Píla na betónovú dlažbu (stolová) 350', 'Pílenie a rezanie', 18.50, 24.60, 200.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Stolová píla s vodným chladením pre rezanie dlažby, kameňa, tehál a obkladov s priemerom kotúča 350 mm.', '', '[{"id": "dia-350", "name": "Opotrebenie DIA kotúča 350 (cena za 1 mm)", "price": 19.00}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51811', 'Uhlová brúska 125 mm', 'Pílenie a rezanie', 6.50, 12.30, 50.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Kompaktná a výkonná uhlová brúska s reguláciou otáčok pre bežné rezanie a brúsenie.', '', '[{"id": "brúsny-odsavaci", "name": "Brúsny adaptér na odsávanie 125 mm", "price": 6.50, "flat": true}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51812', 'Adaptér brúsny na odsávanie 125', 'Pílenie a rezanie', 6.50, 12.30, 50.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Protiprachový kryt pre uhlové brúsky 125mm s vývodom pre pripojenie priemyselného vysávača.', '', '[{"id": "dia-brusny-opotrebenie", "name": "Opotrebenie brúsneho DIA kotúča (za 1 mm)", "price": 14.50}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51813', 'Uhlová brúska 230 mm (veľká)', 'Pílenie a rezanie', 12.30, 18.50, 80.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Veľká flexa pre náročné rezanie betónu, armovaného železa a tehál.', '', '[{"id": "dia-230", "name": "Opotrebenie DIA kotúča 230 (cena za 1 mm)", "price": 12.00}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51814', 'Elektrická píla chvostovka', 'Pílenie a rezanie', 12.30, 20.90, 100.00, 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80', 'Vratná píla na rezy do dreva, plastu, kovových trubiek alebo pórobetónových tvárnic Ytong.', '', '[]'::jsonb, true),

-- Odvlhčovanie a iné
('6ee5a97d-6c17-4ef8-8255-e46be9f51815', 'Profesionálny odvlhčovač vzduchu', 'Odvlhčovanie a iné', 8.60, 17.20, 150.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Priemyselný sušič a odvlhčovač pre stavby, vysušovanie omietok, poterov a zatopených pivníc.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51816', 'Priemyselný čistič vzduchu', 'Odvlhčovanie a iné', 10.00, 10.00, 100.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'HEPA čistička vzduchu na elimináciu prachu a zápachov pri rekonštrukčných prácach v interiéri.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51817', 'Vysokotlakový čistič (Wapka)', 'Odvlhčovanie a iné', 12.30, 22.00, 150.00, 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80', 'Tlakový čistič pre umývanie stavebných strojov, striech, terás, fasád a vozidiel.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51818', 'Miešačka na betón 180 litrov', 'Odvlhčovanie a iné', 18.50, 24.60, 150.00, 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80', 'Klasická stavebná miešačka so silným motorom pre prípravu betónových a maltových zmesí.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51819', 'Brúska na sádrokartón (Žirafa)', 'Odvlhčovanie a iné', 14.80, 24.60, 150.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Teleskopická brúska na sadrokartónové stropy a steny pre dokonalú finálnu rovnosť stierok.', '', '[{"id": "brusny-papier", "name": "Náhradný brúsny papier / výsek", "price": 3.00, "flat": true, "unit": "ks"}]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51820', 'Priemyselný vysávač na mokré/suché sanie', 'Odvlhčovanie a iné', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Profesionálny stavebný vysávač pre prácu s elektronáradím, vysávanie prachu a sutiny.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51821', 'Priemyselný vysávač s auto-oklepom filtrov', 'Odvlhčovanie a iné', 12.30, 24.60, 150.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Špeciálny bezsáčkový vysávač so stálym automatickým čistením filtrov pre extrémny jemný sadrový a betónový prach.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51822', 'Kompresor jednovalcový', 'Odvlhčovanie a iné', 8.60, 12.30, 100.00, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'Prenosný vzduchový kompresor pre pneumatické klincovačky, striekacie pištole a hustenie pneu.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51823', 'Benzínová elektrocentrála 3 kW', 'Odvlhčovanie a iné', 12.30, 18.50, 150.00, 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80', 'Prenosný generátor elektrického prúdu pre prácu na stavbách a chatách bez elektrickej prípojky.', '', '[]'::jsonb, true),
('6ee5a97d-6c17-4ef8-8255-e46be9f51824', 'Motorový vertikutátor', 'Odvlhčovanie a iné', 27.00, 35.60, 150.00, 'https://images.unsplash.com/photo-1558905619-17254203dc1d?auto=format&fit=crop&w=800&q=80', 'Benzínový prevzdušňovač na odstránenie machu a trávnej plsti, posilnenie koreňovej štruktúry vášho trávnika.', '', '[]'::jsonb, true);

-- 4. Nahratie prepravného cenníka do tabuľky site_settings
insert into site_settings (key, value) values (
  'shipping_config',
  '{"rates":{"car35":1.50,"hr8":3.00},"fees":{"crane":5.00,"wait_car35":5.00,"wait_hr8":10.00},"municipalities":[{"name":"Ľubeľa","car35":8.00,"hr8":45.00},{"name":"Dúbrava","car35":16.00,"hr8":45.00},{"name":"Lipt. Kľačany","car35":16.00,"hr8":45.00},{"name":"Vlachy, Vlašky","car35":20.00,"hr8":50.00},{"name":"Krmeš","car35":16.00,"hr8":45.00},{"name":"Malatíny","car35":16.00,"hr8":45.00},{"name":"Svätý Kríž","car35":20.00,"hr8":50.00},{"name":"Gálovany","car35":20.00,"hr8":50.00},{"name":"Part. Lupča","car35":20.00,"hr8":45.00},{"name":"Lipt. Mikuláš","car35":30.00,"hr8":50.00},{"name":"Ružomberok","car35":30.00,"hr8":50.00},{"name":"Lipt. Michal","car35":25.00,"hr8":50.00},{"name":"Andice","car35":25.00,"hr8":50.00},{"name":"Gôtovany","car35":16.00,"hr8":45.00}]}'
) on conflict (key) do update set value = excluded.value;
