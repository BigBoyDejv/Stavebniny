-- SQL SETUP PRE EXOHOSTING (PostgreSQL 15.4)
-- Spustite tento skript v phpPgAdmin alebo Adminer rozhraní ExoHostingu

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. KATEGÓRIE
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  type text DEFAULT 'material',
  created_at timestamp with time zone DEFAULT NOW()
);

INSERT INTO categories (name, type) VALUES 
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
('Hrable a náradie', 'agriculture')
ON CONFLICT (name) DO NOTHING;

-- 2. PRODUKTY
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text,
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  image_url text,
  type text DEFAULT 'material',
  unit text DEFAULT 'ks',
  created_at timestamp with time zone DEFAULT NOW()
);

-- 2. VZOROVÉ PRODUKTY (voliteľné)
-- Ak chcete prázdnu databázu, nespúšťajte INSERT produktov.

-- 3. POLOŽKY POŽIČOVNE
DROP TABLE IF EXISTS rental_items CASCADE;
CREATE TABLE rental_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  price4h numeric(10,2) DEFAULT 0.00,
  price24h numeric(10,2) DEFAULT 0.00,
  deposit numeric(10,2) DEFAULT 100.00,
  daily_price numeric(10,2),
  image_url text,
  description text DEFAULT '',
  note text DEFAULT '',
  accessories jsonb DEFAULT '[]'::jsonb,
  availability boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

INSERT INTO rental_items (name, category, price4h, price24h, deposit, image_url, description, note, accessories, availability) VALUES
('Vibračná doska 160 kg', 'Vibračná a hutniaca technika', 24.60, 43.00, 200.00, 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80', 'Profesionálna vibračná doska strednej váhovej kategórie s reverzným posunom, ideálna na hutnenie piesku, štrku a zámkovej dlažby.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('Vibračná doska 100 kg', 'Vibračná a hutniaca technika', 18.50, 36.90, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Jednosmerná vibračná doska vhodná na asfaltové práce, úpravy chodníkov a záhradné terénne úpravy.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('Podložka k vibračnej doske (Samostatná)', 'Vibračná a hutniaca technika', 2.50, 2.50, 20.00, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80', 'Gumená (polyuretánová) tlmiaca podložka zabraňujúca poškodeniu vibrovaného materiálu (napr. zámkovej dlažby).', '', '[]'::jsonb, true),
('Búracie kladivo (Ťažké)', 'Sekanie a vŕtanie', 18.50, 24.60, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Vysoko výkonné zbíjacie kladivo na búranie betónu, muriva a podláh.', '', '[{"id": "sekac", "name": "Opotrebenie sekáča (plochý/špicatý)", "price": 5.00, "flat": true, "unit": "ks"}]'::jsonb, true),
('AKU skrutkovač / Vŕtačka', 'Sekanie a vŕtanie', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80', 'Akumulátorová príklepová vŕtačka a uťahovačka s 2 batériami pre plynulú prácu.', '', '[]'::jsonb, true),
('Vŕtacie kladivo SDS-Plus', 'Sekanie a vŕtanie', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80', 'Kombinované vŕtacie a sekacie kladivo pre vŕtanie do betónu a ľahšie sekacie práce.', '', '[{"id": "sekac-vrtak", "name": "Opotrebenie SDS vrtákov/sekáčov", "price": 10.00, "flat": true}]'::jsonb, true),
('Motorový pôdny vrták', 'Sekanie a vŕtanie', 30.00, 49.00, 200.00, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'Benzínový jednochlapový pôdny vrták pre hĺbenie dier na stĺpiky plotov, výsadbu stromčekov a základy.', '', '[]'::jsonb, true),
('Vrtáky a sekáče (Súprava)', 'Sekanie a vŕtanie', 10.00, 10.00, 30.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Sada rôznych vrtákov a sekáčov pre bežné murovacie práce.', '', '[]'::jsonb, true),
('Rezačka na polystyrén (odporová)', 'Pílenie a rezanie', 12.30, 24.60, 100.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Tavná rezačka na presné a čisté bezodpadové rezanie fasádneho a podlahového polystyrénu.', '', '[]'::jsonb, true),
('Píla na betónovú dlažbu (stolová) 350', 'Pílenie a rezanie', 18.50, 24.60, 200.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Stolová píla s vodným chladením pre rezanie dlažby, kameňa, tehál a obkladov s priemerom kotúča 350 mm.', '', '[{"id": "dia-350", "name": "Opotrebenie DIA kotúča 350 (cena za 1 mm)", "price": 19.00}]'::jsonb, true),
('Uhlová brúska 125 mm', 'Pílenie a rezanie', 6.50, 12.30, 50.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Kompaktná a výkonná uhlová brúska s reguláciou otáčok pre bežné rezanie a brúsenie.', '', '[{"id": "brúsny-odsavaci", "name": "Brúsny adaptér na odsávanie 125 mm", "price": 6.50, "flat": true}]'::jsonb, true),
('Adaptér brúsny na odsávanie 125', 'Pílenie a rezanie', 6.50, 12.30, 50.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Protiprachový kryt pre uhlové brúsky 125mm s vývodom pre pripojenie priemyselného vysávača.', '', '[{"id": "dia-brusny-opotrebenie", "name": "Opotrebenie brúsneho DIA kotúča (za 1 mm)", "price": 14.50}]'::jsonb, true),
('Uhlová brúska 230 mm (veľká)', 'Pílenie a rezanie', 12.30, 18.50, 80.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Veľká flexa pre náročné rezanie betónu, armovaného železa a tehál.', '', '[{"id": "dia-230", "name": "Opotrebenie DIA kotúča 230 (cena za 1 mm)", "price": 12.00}]'::jsonb, true),
('Elektrická píla chvostovka', 'Pílenie a rezanie', 12.30, 20.90, 100.00, 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80', 'Vratná píla na rezy do dreva, plastu, kovových trubiek alebo pórobetónových tvárnic Ytong.', '', '[]'::jsonb, true),
('Profesionálny odvlhčovač vzduchu', 'Odvlhčovanie a iné', 8.60, 17.20, 150.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Priemyselný sušič a odvlhčovač pre stavby, vysušovanie omietok, poterov a zatopených pivníc.', '', '[]'::jsonb, true),
('Priemyselný čistič vzduchu', 'Odvlhčovanie a iné', 10.00, 10.00, 100.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'HEPA čistička vzduchu na elimináciu prachu a zápachov pri rekonštrukčných prácach v interiéri.', '', '[]'::jsonb, true),
('Vysokotlakový čistič (Wapka)', 'Odvlhčovanie a iné', 12.30, 22.00, 150.00, 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80', 'Tlakový čistič pre umývanie stavebných strojov, striech, terás, fasád a vozidiel.', '', '[]'::jsonb, true),
('Miešačka na betón 180 litrov', 'Odvlhčovanie a iné', 18.50, 24.60, 150.00, 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80', 'Klasická stavebná miešačka so silným motorom pre prípravu betónových a maltových zmesí.', '', '[]'::jsonb, true),
('Brúska na sádrokartón (Žirafa)', 'Odvlhčovanie a iné', 14.80, 24.60, 150.00, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Teleskopická brúska na sadrokartónové stropy a steny pre dokonalú finálnu rovnosť stierok.', '', '[{"id": "brusny-papier", "name": "Náhradný brúsny papier / výsek", "price": 3.00, "flat": true, "unit": "ks"}]'::jsonb, true),
('Priemyselný vysávač na mokré/suché sanie', 'Odvlhčovanie a iné', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Profesionálny stavebný vysávač pre prácu s elektronáradím, vysávanie prachu a sutiny.', '', '[]'::jsonb, true),
('Priemyselný vysávač s auto-oklepom filtrov', 'Odvlhčovanie a iné', 12.30, 24.60, 150.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Špeciálny bezsáčkový vysávač so stálym automatickým čistením filtrov pre extrémny jemný sadrový a betónový prach.', '', '[]'::jsonb, true),
('Kompresor jednovalcový', 'Odvlhčovanie a iné', 8.60, 12.30, 100.00, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'Prenosný vzduchový kompresor pre pneumatické klincovačky, striekacie pištole a hustenie pneu.', '', '[]'::jsonb, true),
('Benzínová elektrocentrála 3 kW', 'Odvlhčovanie a iné', 12.30, 18.50, 150.00, 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80', 'Prenosný generátor elektrického prúdu pre prácu na stavbách a chatách bez elektrickej prípojky.', '', '[]'::jsonb, true),
('Motorový vertikutátor', 'Odvlhčovanie a iné', 27.00, 35.60, 150.00, 'https://images.unsplash.com/photo-1558905619-17254203dc1d?auto=format&fit=crop&w=800&q=80', 'Benzínový prevzdušňovač na odstránenie machu a trávnej plsti, posilnenie koreňovej štruktúry vášho trávnika.', '', '[]'::jsonb, true);

-- 4. REZERVOVANIA POŽIČOVNE
DROP TABLE IF EXISTS rental_bookings CASCADE;
CREATE TABLE rental_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT NOW(),
  rental_item_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  start_date date,
  end_date date,
  start_time text,
  end_time text,
  delivery_method text DEFAULT 'pickup',
  delivery_address text,
  delivery_city text,
  delivery_zip text,
  delivery_municipality text,
  delivery_price numeric(10,2) DEFAULT 0.00,
  status text DEFAULT 'pending',
  note text
);

-- 5. OBJEDNÁVKY
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT NOW(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_method text DEFAULT 'pickup',
  delivery_address text,
  delivery_city text,
  delivery_zip text,
  delivery_price numeric(10,2) DEFAULT 0.00,
  total_price numeric(10,2) NOT NULL,
  payment_method text DEFAULT 'cash',
  note text,
  status text DEFAULT 'new',
  items jsonb NOT NULL
);

-- 6. DOPYTY (DOPYT/KONTAKT)
DROP TABLE IF EXISTS inquiries CASCADE;
CREATE TABLE inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT NOW(),
  type text DEFAULT 'Kontakt',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  subject text,
  details text,
  status text DEFAULT 'new'
);

-- 7. NASTAVENIA WEBU (SITE SETTINGS)
DROP TABLE IF EXISTS site_settings CASCADE;
CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value text
);

INSERT INTO site_settings (key, value) VALUES
('contact_phone', '+421 905 123 456'),
('contact_email', 'kubik@stavivalubela.sk'),
('opening_hours_mon_fri', '07:00 - 16:30'),
('opening_hours_sat', '07:00 - 12:00'),
('opening_hours_sun', 'Zatvorené'),
('hours_alert_enabled', 'false'),
('hours_alert_message', ''),
('hours_alert_type', 'info'),
('shipping_config', '{"rates":{"car35":1.50,"hr8":3.00},"fees":{"crane":5.00,"wait_car35":5.00,"wait_hr8":10.00},"municipalities":[{"name":"Ľubeľa","car35":8.00,"hr8":45.00},{"name":"Dúbrava","car35":16.00,"hr8":45.00},{"name":"Lipt. Kľačany","car35":16.00,"hr8":45.00},{"name":"Vlachy, Vlašky","car35":20.00,"hr8":50.00},{"name":"Krmeš","car35":16.00,"hr8":45.00},{"name":"Malatíny","car35":16.00,"hr8":45.00},{"name":"Svätý Kríž","car35":20.00,"hr8":50.00},{"name":"Gálovany","car35":20.00,"hr8":50.00},{"name":"Part. Lupča","car35":20.00,"hr8":45.00},{"name":"Lipt. Mikuláš","car35":30.00,"hr8":50.00},{"name":"Ružomberok","car35":30.00,"hr8":50.00},{"name":"Lipt. Michal","car35":25.00,"hr8":50.00},{"name":"Andice","car35":25.00,"hr8":50.00},{"name":"Gôtovany","car35":16.00,"hr8":45.00}]}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. ADMIN POUŽÍVATELIA
DROP TABLE IF EXISTS admins CASCADE;
CREATE TABLE admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Pridanie predvoleného admin účtu (heslo: admin123, hashované cez SHA256)
INSERT INTO admins (email, password_hash) VALUES
('kubik@stavivalubela.sk', encode(digest('admin123', 'sha256'), 'hex'))
ON CONFLICT (email) DO NOTHING;
