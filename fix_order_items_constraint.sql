-- SQL script to update the foreign key constraint on order_items to cascade on delete.
-- Run this script in your Supabase SQL Editor to allow product deletion.

alter table order_items 
  drop constraint if exists order_items_product_id_fkey;

alter table order_items
  add constraint order_items_product_id_fkey 
  foreign key (product_id) 
  references products(id) 
  on delete cascade;
