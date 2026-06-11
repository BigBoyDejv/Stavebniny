import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ChevronRight, CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { 
  MUNICIPALITIES, 
  KM_RATES, 
  ADDITIONAL_FEES, 
  calculateShopShipping 
} from '../lib/shipping';

const Checkout = () => {
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

  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: ''
  });

  // Shipping calculator state variables
  const [shippingMethod, setShippingMethod] = useState('pickup'); // 'pickup' | 'delivery'
  const [municipality, setMunicipality] = useState(activeMunicipalities[0]?.name || 'Ľubeľa');
  const [vehicle, setVehicle] = useState('car35'); // 'car35' | 'hr8'
  const [customDistance, setCustomDistance] = useState(10);
  const [craneUnloading, setCraneUnloading] = useState(false);
  const [palletsCount, setPalletsCount] = useState(1);
  const [waitTime, setWaitTime] = useState(false);
  const [waitHalfHours, setWaitHalfHours] = useState(1);

  // Compute shipping price
  const shippingResult = shippingMethod === 'delivery' 
    ? calculateShopShipping({
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
      })
    : { basePrice: 0, cranePrice: 0, waitPrice: 0, totalShipping: 0 };

  const shippingCost = shippingResult.totalShipping;
  const grandTotal = totalPrice + shippingCost;

  const handleInputChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Package shipping details into order shipping_info
      const finalShippingInfo = {
        ...orderDetails,
        shippingMethod,
        shippingPrice: shippingCost,
        ...(shippingMethod === 'delivery' ? {
          deliveryMunicipality: municipality === 'other' ? 'Iná obec' : municipality,
          deliveryDistanceKm: municipality === 'other' ? customDistance : null,
          deliveryVehicle: vehicle === 'hr8' ? 'Auto s HR 8t' : 'Auto do 3.5t',
          craneUnloading: vehicle === 'hr8' ? craneUnloading : false,
          palletsCount: (vehicle === 'hr8' && craneUnloading) ? palletsCount : 0,
          waitTime: waitTime,
          waitHalfHours: waitTime ? waitHalfHours : 0,
        } : {
          deliveryMunicipality: 'Osobný odber Ľubeľa'
        })
      };

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          total_price: grandTotal,
          status: 'prijatá', // In slovak
          shipping_info: finalShippingInfo
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const itemsToInsert = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Success
      setSuccess(true);
      clearCart();
    } catch (err) {
      toast.error('Chyba pri vytváraní objednávky: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-20 px-8 flex flex-center flex-col items-center justify-center text-center">
        <div className="bg-emerald-100 text-emerald-600 p-6 rounded-full mb-8">
           <CheckCircle size={64} />
        </div>
        <h1 className="text-4xl font-black mb-4">REZERVÁCIA PRIJATÁ!</h1>
        <p className="text-on-surface-variant max-w-md mb-12 uppercase text-[10px] font-bold tracking-widest leading-loose">
          Vaša požiadavka na prípravu tovaru bola odoslaná. Budeme vás kontaktovať ohľadom času prevzatia alebo dovozu. Platba prebieha pri prevzatí.
        </p>
        <Link to="/" className="bg-[#2d2f2b] text-primary px-10 py-5 font-black uppercase text-sm tracking-widest">
          Späť na úvod
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-20 px-8 text-center">
        <h2 className="text-2xl font-black mb-8">VÁŠ KOŠÍK JE PRÁZDNY</h2>
        <Link to="/katalog" className="bg-primary text-on-primary px-10 py-5 font-black uppercase text-sm tracking-widest">
          Prejsť do katalógu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-8 md:12">DOKONČENIE OBJEDNÁVKY</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Form */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-black">1</span>
                Kontaktné údaje
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="firstName" placeholder="Meno" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
                <input required name="lastName" placeholder="Priezvisko" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
                <input required name="email" type="email" placeholder="E-mail" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
                <input required name="phone" type="tel" placeholder="Telefón" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-black">2</span>
                Adresa doručenia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="address" placeholder="Ulica a číslo" className="bg-white border-outline/20 p-4 w-full md:col-span-2 focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
                <input required name="city" placeholder="Mesto" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
                <input required name="zip" placeholder="PSČ" className="bg-white border-outline/20 p-4 w-full focus:ring-1 focus:ring-primary outline-none" onChange={handleInputChange}/>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-black">3</span>
                Spôsob prevzatia a doprava
              </h2>
              
              <div className="space-y-4">
                {/* Delivery Options Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('pickup')}
                    className={cn(
                      "p-5 text-left border-2 flex flex-col justify-between transition-all",
                      shippingMethod === 'pickup' 
                        ? "border-primary bg-primary/5 text-on-surface" 
                        : "border-outline/10 bg-white text-on-surface hover:bg-surface-container-low"
                    )}
                  >
                    <span className="font-bold text-xs uppercase tracking-wider block mb-1">Osobný odber</span>
                    <span className="font-black text-lg text-emerald-600">ZADARMO</span>
                    <span className="text-[10px] text-outline mt-2">Pripravíme v Ľubeli</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('delivery')}
                    className={cn(
                      "p-5 text-left border-2 flex flex-col justify-between transition-all",
                      shippingMethod === 'delivery' 
                        ? "border-primary bg-primary/5 text-on-surface" 
                        : "border-outline/10 bg-white text-on-surface hover:bg-surface-container-low"
                    )}
                  >
                    <span className="font-bold text-xs uppercase tracking-wider block mb-1">Dovoz na stavbu</span>
                    <span className="font-black text-sm">Podľa kalkulačky</span>
                    <span className="text-[10px] text-outline mt-2">Dovoz našimi autami</span>
                  </button>
                </div>

                {/* Delivery Options Form Fields */}
                {shippingMethod === 'delivery' && (
                  <div className="bg-[#fcfcf9] border border-outline/10 p-6 space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong mb-2">Kalkulácia dovozu stavebnín</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-outline">Obec doručenia</label>
                        <select
                          value={municipality}
                          onChange={(e) => setMunicipality(e.target.value)}
                          className="w-full bg-white border border-outline/20 p-4 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                        >
                          {activeMunicipalities.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                          <option value="other">Iná obec (vlastná km sadzba)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-outline">Typ vozidla</label>
                        <select
                          value={vehicle}
                          onChange={(e) => setVehicle(e.target.value)}
                          className="w-full bg-white border border-outline/20 p-4 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="car35">Auto do 3.5t (Ľahký dovoz)</option>
                          <option value="hr8">Auto s hydraulickou rukou 8t (Ťažké palety)</option>
                        </select>
                      </div>
                    </div>

                    {municipality === 'other' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <label className="text-[10px] font-bold uppercase text-outline block">
                          Celková vzdialenosť (km) — tam aj späť
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={customDistance}
                            onChange={(e) => setCustomDistance(Math.max(1, Number(e.target.value)))}
                            className="bg-white border border-outline/20 p-4 text-sm font-bold text-on-surface w-24 outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-[11px] text-outline font-semibold">
                            Sadzba: {activeKmRates[vehicle].toFixed(2)} € / km (Spolu: {(customDistance * activeKmRates[vehicle]).toFixed(2)} €)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-outline/5 space-y-4">
                      <span className="block text-[10px] font-bold uppercase text-outline">Doplnkové služby</span>

                      {/* Crane unloading checkbox */}
                      <div className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-outline/15 transition-opacity",
                        vehicle !== 'hr8' && "opacity-40 pointer-events-none"
                      )}>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={vehicle === 'hr8' ? craneUnloading : false}
                            onChange={(e) => setCraneUnloading(e.target.checked)}
                            disabled={vehicle !== 'hr8'}
                            className="w-4 h-4 text-primary bg-zinc-100 border-zinc-300 focus:ring-primary rounded-none"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase block">Vykládka hydraulickou rukou (HR)</span>
                            <span className="text-[10px] text-outline">Sadzba: {activeFees.craneUnloadPerPallet.toFixed(2)} € / paleta</span>
                          </div>
                        </label>

                        {craneUnloading && vehicle === 'hr8' && (
                          <div className="mt-3 sm:mt-0 flex items-center gap-2 animate-in zoom-in-95 duration-200">
                            <span className="text-[10px] text-outline uppercase font-bold">Počet paliet:</span>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={palletsCount}
                              onChange={(e) => setPalletsCount(Math.max(1, Number(e.target.value)))}
                              className="bg-surface border border-outline/20 p-2 text-center text-xs font-bold text-on-surface w-16 outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        )}
                      </div>

                      {/* Wait time checkbox */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-outline/15">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={waitTime}
                            onChange={(e) => setWaitTime(e.target.checked)}
                            className="w-4 h-4 text-primary bg-zinc-100 border-zinc-300 focus:ring-primary rounded-none"
                          />
                          <div>
                            <span className="font-bold text-xs uppercase block">Čakanie šoféra (prestoj)</span>
                            <span className="text-[10px] text-outline">
                              Sadzba: {activeFees.waitTimePerHalfHour[vehicle].toFixed(2)} € za každú začatú 1/2 hod.
                            </span>
                          </div>
                        </label>

                        {waitTime && (
                          <div className="mt-3 sm:mt-0 flex items-center gap-2 animate-in zoom-in-95 duration-200">
                            <span className="text-[10px] text-outline uppercase font-bold">Doba:</span>
                            <select
                              value={waitHalfHours}
                              onChange={(e) => setWaitHalfHours(Number(e.target.value))}
                              className="bg-surface border border-outline/20 p-2 text-xs font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="1">30 min</option>
                              <option value="2">60 min</option>
                              <option value="3">90 min</option>
                              <option value="4">120 min</option>
                              <option value="6">180 min</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-outline/10 p-6 flex flex-col gap-2 bg-white mt-6">
                <div className="flex items-center gap-4 text-primary-strong">
                  <CreditCard size={20} />
                  <span className="font-black text-sm uppercase tracking-widest">Platba pri prevzatí</span>
                </div>
                <p className="text-[10px] font-bold text-outline leading-normal font-medium">
                  {shippingMethod === 'pickup' 
                    ? 'Tovar zaplatíte v hotovosti alebo kartou priamo na predajni v Ľubeli pri prevzatí.' 
                    : 'Objednávku uhradíte šoférovi (v hotovosti alebo kartou) pri vykládke materiálu.'}
                </p>
              </div>
            </section>
          </form>
        </div>

        {/* Summary Overlay */}
        <div className="lg:col-span-5">
           <div className="bg-white p-8 border border-outline/10 shadow-xl sticky top-32">
              <h2 className="text-xl font-black mb-8 border-b border-outline/5 pb-4">SÚHRN KOŠÍKA</h2>
              <div className="space-y-4 mb-8">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center">
                      <div className="flex gap-4">
                         <span className="font-bold text-xs bg-surface px-2.5 h-[30px] flex items-center justify-center whitespace-nowrap">x{item.quantity} {item.unit || 'ks'}</span>
                         <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
                   </div>
                 ))}
              </div>
              
              <div className="border-t border-outline/10 pt-6 space-y-2 mb-8">
                 <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Doprava ({shippingMethod === 'pickup' ? 'Osobný odber' : 'Dovoz'})</span>
                    <span className={cn("font-bold text-sm", shippingCost === 0 ? "text-emerald-600 uppercase" : "text-on-surface")}>
                      {shippingCost === 0 ? 'Zdarma' : `${shippingCost.toFixed(2)} €`}
                    </span>
                 </div>
                 {shippingMethod === 'delivery' && (
                   <div className="space-y-1 pl-4 border-l-2 border-primary/45 text-[11px] text-on-surface-variant font-medium">
                     <div className="flex justify-between">
                       <span>Základné dovozné:</span>
                       <span>{shippingResult.basePrice.toFixed(2)} €</span>
                     </div>
                     {vehicle === 'hr8' && craneUnloading && (
                       <div className="flex justify-between">
                         <span>Vykládka HR ({palletsCount}x):</span>
                         <span>{shippingResult.cranePrice.toFixed(2)} €</span>
                       </div>
                     )}
                     {waitTime && (
                       <div className="flex justify-between">
                         <span>Prestoj ({waitHalfHours * 30} min):</span>
                         <span>{shippingResult.waitPrice.toFixed(2)} €</span>
                       </div>
                     )}
                   </div>
                 )}
                 <div className="flex justify-between text-2xl font-black pt-2 border-t border-outline/5 mt-2">
                    <span>Celkom</span>
                    <span>{grandTotal.toFixed(2)} €</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  form="checkout-form"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 font-black uppercase text-sm tracking-widest hover:bg-[#daf900] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {loading ? 'SPRACOVÁVAM...' : 'Potvrdiť rezerváciu tovaru'}
                   <ChevronRight size={18} />
                 </button>
                 <div className="flex items-center gap-2 justify-center text-[10px] text-outline font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> Bezpečný nákup cez SSL
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
