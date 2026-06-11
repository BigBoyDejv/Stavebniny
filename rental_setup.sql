-- SQL skript pre vytvorenie tabuľky rezervácií techniky a nastavenie RLS politík
-- Tento skript spustite v Supabase SQL Editore.

-- 1. Vytvorenie tabuľky pre rezervácie prenájmu
create table if not exists rental_bookings (
  id uuid default gen_random_uuid() primary key,
  rental_item_id uuid references rental_items(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  start_date date not null,
  end_date date not null,
  status text default 'pending', -- pending (čaká), approved (schválená), rejected (odmietnutá)
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Povolenie Row Level Security (RLS)
alter table rental_bookings enable row level security;

-- 3. RLS Politika pre čítanie (všetci môžu čítať rezervácie pre overenie dostupnosti)
drop policy if exists "Povoliť verejné čítanie rezervácií" on rental_bookings;
create policy "Povoliť verejné čítanie rezervácií"
on rental_bookings for select
using ( true );

-- 4. RLS Politika pre nahrávanie (zákazníci môžu vytvárať rezervácie)
drop policy if exists "Povoliť verejné vytváranie rezervácií" on rental_bookings;
create policy "Povoliť verejné vytváranie rezervácií"
on rental_bookings for insert
with check ( true );

-- 5. RLS Politika pre úpravu (admin môže meniť stav rezervácie)
drop policy if exists "Povoliť verejnú úpravu rezervácií" on rental_bookings;
create policy "Povoliť verejnú úpravu rezervácií"
on rental_bookings for update
using ( true );

-- 6. RLS Politika pre mazanie (admin môže vymazať rezerváciu)
drop policy if exists "Povoliť verejné mazanie rezervácií" on rental_bookings;
create policy "Povoliť verejné mazanie rezervácií"
on rental_bookings for delete
using ( true );
