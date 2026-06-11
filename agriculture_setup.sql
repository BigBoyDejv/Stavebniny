-- SQL skript pre vytvorenie poľnohospodárskych kategórií a produktov
-- Spustite tento skript v Supabase SQL Editore.

-- 1. Vloženie kategórií
insert into categories (name, type) values 
('Krmivá', 'agriculture'),
('Hnojivá', 'agriculture'),
('Substráty', 'agriculture'),
('Osivá a semená', 'agriculture')
on conflict (name) do nothing;

-- 2. Vloženie produktov
insert into products (name, description, price, category, sku, stock_quantity, image_url, type) values
('Krmivo pre nosnice Klasik (25kg)', 'Kompletná kŕmna zmes pre nosnice v období znášky.', 16.90, 'Krmivá', 'AGR-KRM-NOS', 45, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Záhradnícky substrát B (50L)', 'Univerzálny záhradnícky substrát s aktívnym humusom.', 5.20, 'Substráty', 'AGR-SUB-50L', 120, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Cererit hnojivo s guánom (10kg)', 'Bezchloridové granulované organominerálne hnojivo.', 11.50, 'Hnojivá', 'AGR-HNO-CER', 60, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80', 'agriculture'),
('Trávne semeno Šport (1kg)', 'Kvalitná trávna zmes pre zaťažované plochy.', 6.80, 'Osivá a semená', 'AGR-SEM-TRA', 30, 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&w=800&q=80', 'agriculture')
on conflict (sku) do nothing;
