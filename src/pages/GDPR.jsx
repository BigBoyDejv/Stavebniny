import React from 'react';

const GDPR = () => {
  return (
    <div className="pt-32 pb-20 px-8 max-w-4xl mx-auto prose prose-zinc">
      <h1 className="text-4xl font-black mb-8 tracking-tight">OCHRANA OSOBNÝCH ÚDAJOV (GDPR)</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. Základné ustanovenia</h2>
        <p>Prevádzkovateľom osobných údajov podľa článku 4 bod 7 nariadenia Európskeho parlamentu a Rady (EÚ) 2016/679 o ochrane fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov (ďalej len: „GDPR“) sú Stavebniny Ľubeľa (ďalej len „prevádzkovateľ“).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">2. Aké údaje spracovávame</h2>
        <p>Spracovávame osobné údaje, ktoré ste nám poskytli pri vytvorení objednávky alebo dopytu:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Meno a priezvisko</li>
          <li>E-mailová adresa</li>
          <li>Poštová adresa (pre doručenie tovaru)</li>
          <li>Telefónne číslo</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. Zákonný dôvod a účel spracovania</h2>
        <p>Zákonným dôvodom spracovania je plnenie zmluvy medzi vami a prevádzkovateľom podľa čl. 6 ods. 1 písm. b) GDPR.</p>
        <p>Účel spracovania: Vybavenie vašej objednávky a výkon práv a povinností vyplývajúcich zo zmluvného vzťahu.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">4. Doba uchovávania údajov</h2>
        <p>Prevádzkovateľ uchováva osobné údaje po dobu potrebnú na výkon práv a povinností vyplývajúcich zo zmluvného vzťahu (maximálne 10 rokov od ukončenia zmluvného vzťahu).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">5. Vaše práva</h2>
        <p>Máte právo na prístup k svojim údajom, opravu, vymazanie („právo na zabudnutie“) a právo vzniesť námietku proti spracovaniu.</p>
      </section>
    </div>
  );
};

export default GDPR;
