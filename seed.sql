-- SEED DATA PRE STAVEBNINY ĽUBEĽA

-- Reset tabuliek (voliteľné, pozor na dáta)
truncate table products cascade;
truncate table rental_items cascade;

-- Vloženie kategórií (ak ich používate ako text, tento krok môžete preskočiť alebo použiť pre relácie)
-- Pre jednoduchosť budeme v produktoch používať textové kategórie.

-- PRODUKTY
insert into products (name, description, price, category, sku, stock_quantity, image_url) values
('Tehla Porotherm 30 Profi', 'Brúsená tehla pre obvodové murivo s vysokou tepelnou izoláciou.', 2.45, 'Hrubá stavba', 'TEH-P30', 1200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnXPvfmfX9p55sT5nDwCeB3hzIbGLRzRt0dpb_qe-ka-t6IuUqrLI-rTplyvCqe5Ot3v-h3WyJJ1dxTjm02K5-9rZNyWf9kbpIAkhxedOtP2LR8qPX1-swgxfPZZhWTmB87l_sTnZ_sLcyhIWzqF7B4f5xe5LHrQxyi_EnlgPqBlaMydiJXiitdAabBmhWiEKqplsuSoTkjCkSZel3SvIitzAEDyYRv4QZBvrgUQIiyWbGQCpf5Swt-vb6btxFe4FDBTR65QXBE779'),
('Tvárnica DT 20 (50x20x25)', 'Betónová tvárnica pre stratené debnenie základov.', 1.85, 'Hrubá stavba', 'TVAR-DT20', 850, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCe7c3oKe42xKjlkCcRz5M-R6JfcnFoZ1IZdoUxsx7iL-DCBoRZjRq9B-6eRw8Mk2uDZlMi7rGMVBuaTTJ3JMFTMOGCaJStBJRvyEsFhQCfu-YkBUzxs_013PnoaHVG-Si-EvQUh9Bbuyw3pvMEzDaKj6zMCSJlSWy98kUFrwtj_gCVERqjWqpUMVNRlQulPjYZoaPrEK-7uS1m4LwkmbHDJiR_PrA7VugvqMjdYPXdXSz_jZNzPkUnC4Jp_8Ex00w7cW48iHpdioS'),
('Cement CEM II 32.5 R (25kg)', 'Portlandský cement pre bežné betónárske práce.', 4.20, 'Hrubá stavba', 'CEM-25KG', 200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh6lM6vWj9f-I6_9_6i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7i7'),
('Sádrokartón GKB 12.5mm', 'Štandardná sádrokartónová doska pre interiérové priečky.', 8.90, 'Suchá výstavba', 'SDK-GKB12', 150, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmcTqHxnrA8hz8R093ub3Oe6ZJQGea-g7pitoexYfTGHwfaM9c38FNCilr1Xo4cSRdjQF9-MBzerwreo1R4vp4sKlxmO3bQNo_77J425znvQCmPzuj5a2Ktx9id-CIGadTXZOBB7q7GbxxwDgDkFXYBydAVwU0tVBeeLcDDvhzrTGgQkUaS-gZ4gUkoLexHkVPqzQDIzECJavs_514L6FOCl8GrCADy9dNtgAaLaoe_CRCqSyZ2hgP8D3uNys-9wC-iJM8wktAbpa3'),
('Fasádna vata Rockwool 100mm', 'Kamenná vlna pre tepelnú a akustickú izoláciu fasád.', 14.50, 'Izolácie', 'ISO-RW100', 45, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_9R8-7_s_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i'),
('Primalex Plus 15kg', 'Biela interiérová farba s vysokou krycou schopnosťou.', 22.90, 'Farby a laky', 'COL-PRXP15', 30, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKa0QBuZ3nmbJaX837_20pIhGzhn1cgrRhTktRXspPNKdcRddvBCNkAFOUWfVwiX3vhy1ZDf3hrkD1tWv5ZZoeEV1Jyf65Z0pWn073YOOpI4-2jGeLnYQsYa9UTsL_Aha0QjB0hf-wRmv_OhNaO0G7MijYDmpI573ibe6qakzCkFT9xSLhmCXDJ-GNMMtQVvKGLrasjwlvRC4GAuJPXJRtPfG_fpXC8_6TVOe5R9L5Fc2DPlbL78E84oEXW6nNokvhbp07zTLw2Nk');

-- POŽIČOVŇA
insert into rental_items (name, daily_price, availability, image_url) values
('Bager Takeuchi TB216', 150.00, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2w7e-Vd4pTgIDmk3NZZyBAEv4DfzDFMY3M2Pzdfh8vvRtE8PR2OrmcHp-FSvjqsm5i9po4CUCQVQK1RRL32ahTBRCgy9iHQVU9qK8S9Teeq9QQXQq-9ZrMCLK9b5FtBI6gnbakU8P9wQhu2MQs2tTXcYkmU6hDI4oWxW-7i6cd37-4jFqvh7hmBdC7xK_tmxml1FsfLGoFpaNQQkQBNwp5W5RJ54WJ8oG5wJSCxRnk6PyUwtcraCcx47fNYLh8FQSaRi_VNwbMCqk'),
('Vibračná doska 100kg', 35.00, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6v7k-3_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i_i'),
('Hilti TE 1000 Buracie kladivo', 45.00, true, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4tNKoC2T84CU_w1hL8h2Iez89Yj2zI13QT1Tm05x3eMQ5IPfn6OrbOoa3afI7GjjjuZdeos-RBfBTZ36MPqDgT0E-ZLiilau96tgKrhPjL9yBvZAyW-B3t9PqQ9KhevKc0OO3hH3sPIkTqS2Z2NbEqifznMNA7ChL-3sWopPVLiI3ItDJjFk_5Y2mzHAfPCDfC-a5awqrvw9-UWGn2Z8qW8V_mhcbSbSRNvXRkxDIswPxpzBvd_SkWy0sJ9s7xL3wGItVya7aJGn0');
