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

INSERT INTO products (name, description, price, category, sku, stock_quantity, image_url, type, unit) VALUES
('Tehla Porotherm 30 Profi', 'Brúsená tehla pre obvodové murivo s vysokou tepelnou izoláciou.', 2.45, 'Hrubá stavba', 'TEH-P30', 1200, 'https://images.unsplash.com/photo-1590069230005-db32bc76f57b?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('Tvárnica DT 20 (50x20x25)', 'Betónová tvárnica pre stratené debnenie základov.', 1.85, 'Hrubá stavba', 'TVAR-DT20', 850, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('Cement CEM II 32.5 R (25kg)', 'Portlandský cement pre bežné betónárske práce.', 4.20, 'Hrubá stavba', 'CEM-25KG', 200, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80', 'material', 'balenie'),
('Murovacia malta Profi (25kg)', 'Suchá zmes pre murovanie z tehál i tvárnic.', 4.80, 'Hrubá stavba', 'MAL-25KG', 300, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'material', 'balenie'),
('Sádrokartón GKB 12.5mm', 'Štandardná sádrokartónová doska Rigips.', 8.90, 'Suchá výstavba', 'SDK-GKB12', 150, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('Sádrokartón RBI (Vodeodolný)', 'Zelená doska do kúpeľní.', 12.50, 'Suchá výstavba', 'SDK-RBI12', 80, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('CD Profil 3m', 'Oceľový profil pre sádrokartónové podhľady.', 3.20, 'Suchá výstavba', 'PRO-CD3', 200, 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('Polystyrén EPS 70 (100mm)', 'Fasádny polystyrén pre zateplenie.', 9.50, 'Izolácie', 'ISO-EPS70', 300, 'https://images.unsplash.com/photo-1615529175066-6b215886d34e?auto=format&fit=crop&w=800&q=80', 'material', 'm2'),
('Lepidlo na zateplenie (25kg)', 'Lepiaca malta pre EPS.', 5.90, 'Izolácie', 'LEP-25KG', 250, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80', 'material', 'balenie'),
('Škridla Bramac Classic', 'Strešná krytina – Čierna.', 1.45, 'Strechy', 'STR-BRC', 2000, 'https://images.unsplash.com/photo-1632759162453-194f4c1722ec?auto=format&fit=crop&w=800&q=80', 'material', 'ks'),
('Zámková dlažba 6cm Sivá', 'Dlažba pre chodníky.', 14.90, 'Záhrada', 'DLZ-HO6', 50, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80', 'material', 'm2'),
('Kladivo 500g Stanley', 'Kvalitné tesárske kladivo s ergonomickou rúčkou.', 14.50, 'Ručné náradie', 'NAR-KLAD', 15, 'https://images.unsplash.com/photo-1586864387417-f58fd44fa20e?auto=format&fit=crop&w=800&q=80', 'tool', 'ks'),
('Uhlová brúska Bosch GWS', '125mm elektrická brúska pre profesionálov.', 89.00, 'Elektrické náradie', 'NAR-BRUS', 8, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'tool', 'ks'),
('Kuprikol 50 (100g)', 'Tradičný mednatý prípravok vo forme zmáčateľného prášku na ochranu rastlín.', 4.80, 'Postreky', 'AGR-POS-KUP', 50, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture', 'balenie'),
('Bofix (100ml)', 'Selektívny systémový herbicíd na ničenie dvojklíčnolistových burín.', 8.50, 'Postreky', 'AGR-POS-BOF', 30, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture', 'balenie'),
('Záhradné hrable kovové (14 zubov)', 'Kvalitné kovové hrable s drevenou násadou.', 12.90, 'Hrable a náradie', 'AGR-NAR-HRA', 25, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80', 'agriculture', 'ks'),
('Záhradná lopata Fiskars', 'Ergonomická špicatá lopata s kovovou násadou.', 24.50, 'Hrable a náradie', 'AGR-NAR-LOP', 15, 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80', 'agriculture', 'ks')
ON CONFLICT (sku) DO NOTHING;

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
('Vibračná doska 160 kg', 'Vibračná a hutniaca technika', 24.60, 43.00, 200.00, 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80', 'Profesionálna vibračná doska strednej váhovej kategórie s reverzným posunom.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('Vibračná doska 100 kg', 'Vibračná a hutniaca technika', 18.50, 36.90, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Jednosmerná vibračná doska vhodná na asfaltové práce.', 'Zľava 10% nad 3 dni', '[{"id": "podlozka", "name": "Gumená podložka k vibračnej doske", "price": 2.50, "flat": true}]'::jsonb, true),
('Búracie kladivo (Ťažké)', 'Sekanie a vŕtanie', 18.50, 24.60, 150.00, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'Vysoko výkonné zbíjacie kladivo na búranie betónu.', '', '[{"id": "sekac", "name": "Opotrebenie sekáča", "price": 5.00, "flat": true}]'::jsonb, true),
('AKU skrutkovač / Vŕtačka', 'Sekanie a vŕtanie', 12.30, 18.50, 100.00, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80', 'Akumulátorová príklepová vŕtačka s 2 batériami.', '', '[]'::jsonb, true),
('Profesionálny odvlhčovač vzduchu', 'Odvlhčovanie a iné', 8.60, 17.20, 150.00, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Priemyselný sušič a odvlhčovač pre stavby.', '', '[]'::jsonb, true);

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
('hours_alert_type', 'info')
ON CONFLICT (key) DO NOTHING;

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
