import React from 'react';
import { Truck, CreditCard, ShieldCheck, MapPin } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="pt-32 pb-20 px-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black mb-8 tracking-tight">DOPRAVA A PLATBA</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-primary-strong w-8 h-8" />
            <h2 className="text-2xl font-bold">Možnosti dopravy</h2>
          </div>
          <ul className="space-y-6">
            <li className="bg-surface p-6 border-l-4 border-primary shadow-sm">
              <p className="font-bold mb-1">Dovoz na stavbu (Vlastná doprava)</p>
              <p className="text-sm text-on-surface-variant">Pri väčšom odbere (paletové množstvá) v rámci okresu Liptovský Mikuláš.</p>
              <p className="mt-2 font-black">Cena: Podľa vzdialenosti</p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-primary shadow-sm">
              <p className="font-bold mb-1">Packeta / Kuriér DPD</p>
              <p className="text-sm text-on-surface-variant">Pre menšie zásielky do 30kg.</p>
              <p className="mt-2 font-black">Cena: od 4.50 €</p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-primary shadow-sm">
              <p className="font-bold mb-1">Osobný odber v Ľubeli</p>
              <p className="text-sm text-on-surface-variant">Vyzvihnutie priamo v našich stavebninách počas otváracích hodín.</p>
              <p className="mt-2 font-black text-emerald-600 uppercase">Zadarmo</p>
            </li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="text-primary-strong w-8 h-8" />
            <h2 className="text-2xl font-bold">Spôsoby platby</h2>
          </div>
          <ul className="space-y-6">
            <li className="bg-surface p-6 border-l-4 border-outline/20">
              <p className="font-bold mb-1">Platba v hotovosti / kartou</p>
              <p className="text-sm text-on-surface-variant">Pri osobnom odbere alebo priamo pri dovoze naším vozidlom.</p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-outline/20">
              <p className="font-bold mb-1">Prevodom na účet</p>
              <p className="text-sm text-on-surface-variant">Tento spôsob spracujeme hneď po pripísaní sumy na náš účet.</p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-outline/20">
              <p className="font-bold mb-1">Dobierka</p>
              <p className="text-sm text-on-surface-variant">Platba kuriérovi pri prevzatí balíka.</p>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-16 bg-[#2d2f2b] text-white p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
         <MapPin className="w-12 h-12 text-primary shrink-0 transition-transform hover:scale-110 duration-300" />
         <div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-primary">Kde nás nájdete?</h3>
            <p className="text-zinc-300">Hlavná ulica 123, 032 14 Ľubeľa. Sme otvorení Po-Pi 7:00-16:00, So 7:00-12:00.</p>
         </div>
      </div>
    </div>
  );
};

export default Shipping;
