-- SEED DATA PRE STAVEBNINY ĽUBEĽA
-- Rozšírená databáza pre profesionálnu ukážku e-shopu

-- Reset tabuliek
truncate table products cascade;
truncate table rental_items cascade;

-- 1. PRODUKTY (MATERIÁLY) - 30 Položiek
insert into products (name, description, price, category, sku, stock_quantity, image_url) values
-- HRUBÁ STAVBA (1-8)
('Tehla Porotherm 30 Profi', 'Brúsená tehla pre obvodové murivo s vysokou tepelnou izoláciou.', 2.45, 'Hrubá stavba', 'TEH-P30', 1200, 'https://images.unsplash.com/photo-1590069230005-db32bc76f57b?auto=format&fit=crop&w=800&q=80'),
('Tvárnica DT 20 (50x20x25)', 'Betónová tvárnica pre stratené debnenie základov.', 1.85, 'Hrubá stavba', 'TVAR-DT20', 850, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
('Cement CEM II 32.5 R (25kg)', 'Vysokokvalitný portlandský cement pre bežné betónárske práce a potery.', 4.20, 'Hrubá stavba', 'CEM-25KG', 200, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80'),
('Vápno hydrát (20kg)', 'Vápenný hydrát pre klasické omietky a maltu.', 3.50, 'Hrubá stavba', 'VAP-20KG', 120, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'),
('Murovacia malta Profi (25kg)', 'Suchá zmes pre murovanie z tehál i tvárnic.', 4.80, 'Hrubá stavba', 'MAL-25KG', 300, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'),
('Betón B20 (25kg)', 'Suchý betón pre zhotovenie podláh a drobných základov.', 5.20, 'Hrubá stavba', 'BET-B20', 400, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80'),
('Armovacia sieť 15x15 (4mm)', 'Kari sieť pre vystuženie základových dosiek a betónu.', 18.50, 'Hrubá stavba', 'SIE-1515', 50, 'https://images.unsplash.com/photo-1565439380816-77890f6e91f1?auto=format&fit=crop&w=800&q=80'),
('Betónová preklad 1.25m', 'Keramický preklad pre okná a dvere.', 12.90, 'Hrubá stavba', 'PRE-125', 20, 'https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=800&q=80'),

-- SUCHÁ VÝSTAVBA (9-14)
('Sádrokartón GKB 12.5mm', 'Štandardná sádrokartónová doska Rigips.', 8.90, 'Suchá výstavba', 'SDK-GKB12', 150, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'),
('Sádrokartón RBI (Vodeodolný)', 'Zelená doska do kúpeľní a vlhkých priestorov.', 12.50, 'Suchá výstavba', 'SDK-RBI12', 80, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'),
('CD Profil 3m', 'Oceľový profil pre sádrokartónové podhľady.', 3.20, 'Suchá výstavba', 'PRO-CD3', 200, 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80'),
('UD Profil 3m', 'Ovodový profil pre konštrukciu SDK.', 1.95, 'Suchá výstavba', 'PRO-UD3', 150, 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80'),
('Špachtľovacia tmel (5kg)', 'Tmel pre spoje sádrokartónových dosiek.', 7.40, 'Suchá výstavba', 'TML-5KG', 60, 'https://images.unsplash.com/photo-1517646281694-2226b1445b9b?auto=format&fit=crop&w=800&q=80'),
('Skrutky TN 25mm (1000ks)', 'Skrutky do sádrokartónu a dreva.', 9.20, 'Suchá výstavba', 'SKR-TN25', 40, 'https://images.unsplash.com/photo-1586864387417-f58fd44fa20e?auto=format&fit=crop&w=800&q=80'),

-- IZOLÁCIE (15-20)
('Polystyrén EPS 70 (100mm)', 'Fasádny polystyrén pre zateplenie obvodových stien.', 9.50, 'Izolácie', 'ISO-EPS70', 300, 'https://images.unsplash.com/photo-1615529175066-6b215886d34e?auto=format&fit=crop&w=800&q=80'),
('Sklenná vata Knauf 10cm', 'Izolačná rola pre podkrovia a priečky.', 45.00, 'Izolácie', 'ISO-KV10', 40, 'https://images.unsplash.com/photo-1620614815052-198188040713?auto=format&fit=crop&w=800&q=80'),
('Extrudovaný polystyrén XPS', 'Tuhá izolácia pre spodné stavby a sokle.', 14.20, 'Izolácie', 'ISO-XPS', 100, 'https://images.unsplash.com/photo-1615529175066-6b215886d34e?auto=format&fit=crop&w=800&q=80'),
('Lepidlo na zateplenie (25kg)', 'Lepiaca a stierkovacia malta pre EPS/MW.', 5.90, 'Izolácie', 'LEP-25KG', 250, 'https://images.unsplash.com/photo-1590486803833-2c521021bc64?auto=format&fit=crop&w=800&q=80'),
('Sklotextilná mriežka (50m)', 'Sklenná sieťka pre armovanie fasády.', 38.00, 'Izolácie', 'MRI-50M', 25, 'https://images.unsplash.com/photo-1565439380816-77890f6e91f1?auto=format&fit=crop&w=800&q=80'),
('Parozábrana (75m2)', 'Fólia pod sádrokartón pre ochranu izolácie.', 24.50, 'Izolácie', 'ISO-PARO', 15, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),

-- STRECHY & ŽIĽABY (21-26)
('Škridla Bramac Classic', 'Betónová strešná krytina – Čierna.', 1.45, 'Strechy', 'STR-BRC', 2000, 'https://images.unsplash.com/photo-1632759162453-194f4c1722ec?auto=format&fit=crop&w=800&q=80'),
('Strešná fólia (75m2)', 'Difúzna fólia pod strešnú krytinu.', 85.00, 'Strechy', 'STR-FOL', 10, 'https://images.unsplash.com/photo-1632759162453-194f4c1722ec?auto=format&fit=crop&w=800&q=80'),
('Okapový žľab – 4m', 'Pozinkovaný žľab priemere 125mm.', 14.80, 'Strechy', 'ZLAB-4M', 20, 'https://images.unsplash.com/photo-1541888941259-773a9417d741?auto=format&fit=crop&w=800&q=80'),
('Žľabový hák', 'Držiak strešného žľabu – lakovaný.', 2.10, 'Strechy', 'ZLAB-HAK', 100, 'https://images.unsplash.com/photo-1541888941259-773a9417d741?auto=format&fit=crop&w=800&q=80'),
('Strešný asfaltový pás', 'Hydroizolácia pre ploché strechy.', 35.00, 'Strechy', 'STR-ASF', 15, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80'),
('Vetrací pás hrebeňa', 'Prvok pre vetranie šikmej strechy.', 11.20, 'Strechy', 'STR-VET', 30, 'https://images.unsplash.com/photo-1632759162453-194f4c1722ec?auto=format&fit=crop&w=800&q=80'),

-- ZÁHRADA & DLAŽBY (27-30)
('Zámková dlažba 6cm Sivá', 'Klasická dlažba pre chodníky a parkoviská.', 14.90, 'Záhrada', 'DLZ-HO6', 50, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80'),
('Záhradný obrubník', 'Betónová príruba pre dlažbu.', 2.80, 'Záhrada', 'OBR-ZAH', 120, 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80'),
('Zemina záhradná (50L)', 'Substrát pre kvety a trávniky.', 6.50, 'Záhrada', 'ZEM-50L', 100, 'https://images.unsplash.com/photo-1592150621344-82841b994804?auto=format&fit=crop&w=800&q=80'),
('Geotextília 200g (m2)', 'Separačná vrstva pod štrk a dlažbu.', 1.15, 'Záhrada', 'GEO-200', 500, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80');

-- 2. POŽIČOVŇA - 5 Položiek
insert into rental_items (name, daily_price, availability, image_url, category) values
('Minibager Takeuchi TB216', 150.00, true, 'https://images.unsplash.com/photo-1579450334237-4b7e335025d2?auto=format&fit=crop&w=800&q=80', 'Stroje'),
('Vibračná doska 100kg', 35.00, true, 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80', 'Stroje'),
('Hilti TE 1000 Kladivo', 45.00, true, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'Náradie'),
('Miesič betónu 140L', 20.00, true, 'https://images.unsplash.com/photo-1517646281694-2226b1445b9b?auto=format&fit=crop&w=800&q=80', 'Stroje'),
('Lešenie HAKI (Sada)', 25.00, true, 'https://images.unsplash.com/photo-1541888941259-773a9417d741?auto=format&fit=crop&w=800&q=80', 'Vybavenie');
