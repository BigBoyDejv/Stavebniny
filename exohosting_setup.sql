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
