import React, { useState } from 'react';
import { Truck, CreditCard, ShieldCheck, MapPin, Calculator, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { 
  MUNICIPALITIES, 
  THIRD_PARTY_ZONES, 
  ADDITIONAL_FEES, 
  KM_RATES, 
  calculateShopShipping, 
  calculateThirdPartyShipping 
} from '../lib/shipping';
import { cn } from '../lib/utils';

const Shipping = () => {
  const { settings } = useSettings();

  // Parse shipping config from settings if available
  let activeMunicipalities = MUNICIPALITIES;
  let activeKmRates = KM_RATES;
  let activeFees = ADDITIONAL_FEES;

  if (settings.shipping_config) {
    try {
      const parsed = typeof settings.shipping_config === 'string'
        ? JSON.parse(settings.shipping_config)
        : settings.shipping_config;
      
      if (parsed.municipalities) activeMunicipalities = parsed.municipalities;
      if (parsed.rates) activeKmRates = parsed.rates;
      if (parsed.fees) {
        activeFees = {
          craneUnloadPerPallet: parsed.fees.crane,
          waitTimePerHalfHour: {
            car35: parsed.fees.wait_car35,
            hr8: parsed.fees.wait_hr8
          }
        };
      }
    } catch (e) {
      console.error('Error parsing shipping_config:', e);
    }
  }

  // Calculator State
  const [calcTab, setCalcTab] = useState('shop'); // 'shop' | 'thirdParty'
  const [municipality, setMunicipality] = useState(activeMunicipalities[0]?.name || 'Ľubeľa');
  const [vehicle, setVehicle] = useState('car35'); // 'car35' | 'hr8'
  const [customDistance, setCustomDistance] = useState(10);
  const [craneUnloading, setCraneUnloading] = useState(false);
  const [palletsCount, setPalletsCount] = useState(1);
  const [waitTime, setWaitTime] = useState(false);
  const [waitHalfHours, setWaitHalfHours] = useState(1);

  const [thirdPartyZone, setThirdPartyZone] = useState(THIRD_PARTY_ZONES[0].name);

  // Shop delivery cost calculation
  const shopResult = calculateShopShipping({
    municipalityName: municipality,
    vehicleType: vehicle,
    customDistance: Number(customDistance),
    craneUnloading: vehicle === 'hr8' ? craneUnloading : false,
    palletsCount: Number(palletsCount),
    waitTime,
    waitHalfHours: Number(waitHalfHours),
    customMunicipalities: activeMunicipalities,
    customKmRates: activeKmRates,
    customFees: activeFees
  });

  // Third party cargo calculation
  const thirdPartyResult = calculateThirdPartyShipping(thirdPartyZone);

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto min-h-screen">
      <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight uppercase">DOPRAVA A PLATBA</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        <section className="bg-white p-8 border border-outline/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-primary-strong w-8 h-8" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Možnosti dopravy</h2>
          </div>
          <ul className="space-y-4">
            <li className="bg-surface p-6 border-l-4 border-primary shadow-sm">
              <p className="font-bold mb-1">Dovoz na stavbu (Vlastná doprava)</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pre dovoz zakúpeného stavebného materiálu na vašu adresu. K dispozícii je vozidlo do 3.5t pre užšie uličky, alebo 8t vozidlo s hydraulickou rukou pre vykládku paliet.
              </p>
              <p className="mt-3 text-xs font-black uppercase text-primary-strong">Cena: Podľa kalkulačky nižšie</p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-primary shadow-sm">
              <p className="font-bold mb-1">Osobný odber v Ľubeli</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Vyzvihnutie zakúpeného tovaru priamo v našom areáli Stavebnín Ľubeľa. Tovar pre vás pripravíme na naloženie.
              </p>
              <p className="mt-3 text-xs font-black text-emerald-600 uppercase tracking-widest">Cena: Zadarmo</p>
            </li>
          </ul>
        </section>

        <section className="bg-white p-8 border border-outline/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="text-primary-strong w-8 h-8" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Spôsoby platby</h2>
          </div>
          <ul className="space-y-4">
            <li className="bg-surface p-6 border-l-4 border-outline/25">
              <p className="font-bold mb-1">Platba pri prevzatí (Dobierka)</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Najpoužívanejší spôsob. Tovar zaplatíte v hotovosti alebo platobnou kartou priamo šoférovi pri dovoze, prípadne na predajni pri osobnom odbere.
              </p>
            </li>
            <li className="bg-surface p-6 border-l-4 border-outline/25">
              <p className="font-bold mb-1">Prevodom na účet (Zálohová faktúra)</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Po spracovaní objednávky vám zašleme zálohovú faktúru. Po pripísaní platby na náš účet tovar ihneď expedujeme alebo pripravíme na odber.
              </p>
            </li>
          </ul>
        </section>
      </div>

      {/* Shipping Calculator Section */}
      <section className="bg-[#2d2f2b] text-white p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-5 pointer-events-none">
          <Truck size={400} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-on-primary">
                <Calculator size={24} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Kalkulačka ceny dopravy</h3>
                <p className="text-xs text-zinc-400 font-medium">Zistite okamžitú cenu prepravy podľa našich sadzieb.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#1d1f1c] p-1.5 border border-zinc-700 w-full md:w-auto">
              <button
                onClick={() => setCalcTab('shop')}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
                  calcTab === 'shop' ? "bg-primary text-on-primary" : "text-zinc-400 hover:text-white"
                )}
              >
                Preprava tovaru zo stavebnín
              </button>
              <button
                onClick={() => setCalcTab('thirdParty')}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
                  calcTab === 'thirdParty' ? "bg-primary text-on-primary" : "text-zinc-400 hover:text-white"
                )}
              >
                Preprava cudzieho tovaru (HR 8t)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-10">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              {calcTab === 'shop' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Obec doručenia</label>
                      <select
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        className="w-full bg-[#1c1e1a] border border-zinc-700 p-4 text-sm font-bold text-white outline-none focus:border-primary transition-colors"
                      >
                        {activeMunicipalities.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                        <option value="other">Iná obec (vlastná km sadzba)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Kategória vozidla</label>
                      <select
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        className="w-full bg-[#1c1e1a] border border-zinc-700 p-4 text-sm font-bold text-white outline-none focus:border-primary transition-colors"
                      >
                        <option value="car35">Auto do 3.5t (Ľahké dovozy)</option>
                        <option value="hr8">Auto s hydraulickou rukou 8t (Ťažké palety)</option>
                      </select>
                    </div>
                  </div>

                  {municipality === 'other' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                        Celková vzdialenosť (km) — cesta tam aj späť
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={customDistance}
                          onChange={(e) => setCustomDistance(Math.max(1, Number(e.target.value)))}
                          className="bg-[#1c1e1a] border border-zinc-700 p-4 text-sm font-bold text-white w-32 outline-none focus:border-primary transition-colors"
                        />
                        <span className="text-zinc-400 text-xs font-semibold">
                          Sadzba: {activeKmRates[vehicle].toFixed(2)} € / km (Spolu: {(customDistance * activeKmRates[vehicle]).toFixed(2)} €)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-800 space-y-4">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Doplnkové poplatky</span>
                    
                    {/* Crane Unloading Checkbox */}
                    <div className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1c1e1a] border border-zinc-800 transition-opacity",
                      vehicle !== 'hr8' && "opacity-40 pointer-events-none"
                    )}>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={vehicle === 'hr8' ? craneUnloading : false}
                          onChange={(e) => setCraneUnloading(e.target.checked)}
                          disabled={vehicle !== 'hr8'}
                          className="w-5 h-5 text-primary bg-zinc-800 border-zinc-700 focus:ring-primary rounded-none"
                        />
                        <div>
                          <span className="font-bold text-xs uppercase block">Vykládka hydraulickou rukou (HR)</span>
                          <span className="text-[10px] text-zinc-400">Sadzba: {activeFees.craneUnloadPerPallet.toFixed(2)} € / paleta</span>
                        </div>
                      </label>
                      
                      {craneUnloading && vehicle === 'hr8' && (
                        <div className="mt-3 sm:mt-0 flex items-center gap-2 animate-in zoom-in-95 duration-200">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">Počet paliet:</span>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={palletsCount}
                            onChange={(e) => setPalletsCount(Math.max(1, Number(e.target.value)))}
                            className="bg-zinc-900 border border-zinc-700 p-2 text-center text-xs font-bold text-white w-16 outline-none focus:border-primary"
                          />
                        </div>
                      )}
                    </div>

                    {/* Waiting time check */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1c1e1a] border border-zinc-800">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={waitTime}
                          onChange={(e) => setWaitTime(e.target.checked)}
                          className="w-5 h-5 text-primary bg-zinc-800 border-zinc-700 focus:ring-primary rounded-none"
                        />
                        <div>
                          <span className="font-bold text-xs uppercase block">Čakanie / Prestoj pri vykládke</span>
                          <span className="text-[10px] text-zinc-400">
                            Sadzba: {activeFees.waitTimePerHalfHour[vehicle].toFixed(2)} € za každú začatú 1/2 hod.
                          </span>
                        </div>
                      </label>

                      {waitTime && (
                        <div className="mt-3 sm:mt-0 flex items-center gap-2 animate-in zoom-in-95 duration-200">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">Čas:</span>
                          <select
                            value={waitHalfHours}
                            onChange={(e) => setWaitHalfHours(Number(e.target.value))}
                            className="bg-zinc-900 border border-zinc-700 p-2 text-xs font-bold text-white outline-none focus:border-primary"
                          >
                            <option value="1">30 min (1x)</option>
                            <option value="2">60 min (2x)</option>
                            <option value="3">90 min (3x)</option>
                            <option value="4">120 min (4x)</option>
                            <option value="6">180 min (6x)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Prepravná zóna obce</label>
                    <select
                      value={thirdPartyZone}
                      onChange={(e) => setThirdPartyZone(e.target.value)}
                      className="w-full bg-[#1c1e1a] border border-zinc-700 p-4 text-sm font-bold text-white outline-none focus:border-primary transition-colors"
                    >
                      {THIRD_PARTY_ZONES.map(z => (
                        <option key={z.name} value={z.name}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="p-4 bg-primary/10 border-l-4 border-primary text-xs leading-relaxed text-zinc-300">
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">Informácie o preprave cudzieho tovaru</p>
                    Táto preprava sa vzťahuje na tovar, ktorý nebol zakúpený v našich stavebninách. Pre tento typ je využívané výhradne ťažké auto s hydraulickou rukou (HR 8t). Ceny sú fixné za zónu.
                  </div>
                </div>
              )}
            </div>

            {/* Results Column */}
            <div className="lg:col-span-5 bg-[#1d1f1c] border border-zinc-800 p-8 flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 pb-2 border-b border-zinc-800">
                  Kalkulovaný súhrn
                </h4>
                
                {calcTab === 'shop' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Základná preprava:</span>
                      <span className="font-bold text-white">{shopResult.basePrice.toFixed(2)} €</span>
                    </div>
                    {craneUnloading && vehicle === 'hr8' && (
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Vykládka HR ({palletsCount}x):</span>
                        <span className="font-bold text-white">{shopResult.cranePrice.toFixed(2)} €</span>
                      </div>
                    )}
                    {waitTime && (
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Prestoj ({waitHalfHours * 30} min):</span>
                        <span className="font-bold text-white">{shopResult.waitPrice.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Typ vozidla:</span>
                      <span className="font-bold text-white uppercase text-[10px] tracking-wider bg-zinc-800 px-2 py-0.5">
                        {vehicle === 'hr8' ? 'Auto s HR 8t' : 'Auto do 3.5t'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Fixná cena za zónu:</span>
                      <span className="font-bold text-white">{thirdPartyResult.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Vozidlo:</span>
                      <span className="font-bold text-white uppercase text-[10px] tracking-wider bg-zinc-800 px-2 py-0.5">Auto s HR 8t</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-zinc-800 mt-8">
                <div className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-2">Celková cena dopravy</div>
                <div className="text-5xl font-black text-primary tracking-tight">
                  {(calcTab === 'shop' ? shopResult.totalShipping : thirdPartyResult).toFixed(2)} <span className="text-2xl font-black">€</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-2">
                  *Cena je uvedená vrátane DPH. Platba pri prevzatí tovaru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <div className="mt-8 bg-[#fdfdf7] border border-outline/10 p-6 flex items-start gap-4 max-w-xl">
         <AlertCircle className="w-5 h-5 text-primary-strong shrink-0 mt-0.5" />
         <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Doprava nad 500 € zadarmo</h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium">
              Pri celkovom nákupe tovaru z nášho eshopu v hodnote nad 500 € je doprava v rámci obce Ľubeľa a susedných obcí (Dúbrava, Lipt. Kľačany, Gôtovany) úplne zadarmo.
            </p>
         </div>
      </div>

      <div className="mt-16 bg-[#1d1f1c] text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-xl">
         <MapPin className="w-12 h-12 text-primary shrink-0 transition-transform hover:scale-110 duration-300" />
         <div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-primary">Kde nás nájdete?</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {settings.contact_address || 'Ľubeľa, Slovensko'}. Sme otvorení Po-Pi {settings.hours_weekday || '7:00 - 16:30'}, So {settings.hours_saturday || '7:00 - 12:00'}.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Shipping;
