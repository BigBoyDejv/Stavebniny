import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { ChevronRight, ClipboardList, CheckCircle, Store, Truck, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { sendEmailNotification } from '../lib/email';

const Checkout = () => {
  const { settings } = useSettings();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: '', deliveryMethod: 'pickup', message: '', _honeypot: ''
  });

  useEffect(() => {
    document.title = "Odoslanie dopytu | Stavebniny Ľubeľa"
  }, [])

  const handleInputChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (method) => {
    setOrderDetails(prev => ({ ...prev, deliveryMethod: method }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const deliveryLabels = {
      pickup: 'Osobný odber na predajni Ľubeľa',
      delivery: 'Dovoz na stavbu (Nákladné auto / HR)',
      own_transport: 'Vlastná doprava zákazníka'
    };

    const orderPayload = {
      customer_name: `${orderDetails.firstName} ${orderDetails.lastName}`.trim(),
      customer_email: orderDetails.email,
      customer_phone: orderDetails.phone,
      delivery_method: orderDetails.deliveryMethod,
      delivery_address: orderDetails.deliveryMethod === 'pickup' ? 'Osobný odber na predajni Ľubeľa' : orderDetails.address,
      delivery_city: orderDetails.deliveryMethod === 'pickup' ? 'Ľubeľa' : orderDetails.city,
      delivery_zip: orderDetails.deliveryMethod === 'pickup' ? '03213' : orderDetails.zip,
      total_price: 0,
      status: 'dopyt',
      note: `[Požadovaná doprava: ${deliveryLabels[orderDetails.deliveryMethod] || orderDetails.deliveryMethod}]\n` + (orderDetails.message || ''),
      items: cart,
      _honeypot: orderDetails._honeypot
    }

    try {
      await api.orders.create(orderPayload);
      try {
        const itemsSummary = cart.map(item => `- ${item.name} (${item.quantity} ${item.unit || 'ks'})`).join('\n');
        await api.inquiries.create({
          type: 'Dopyt z katalógu',
          customer_name: orderPayload.customer_name,
          customer_email: orderPayload.customer_email,
          customer_phone: orderPayload.customer_phone,
          subject: `Dopyt z katalógu (${cart.length} položiek)`,
          details: `DOPRAVA: ${deliveryLabels[orderDetails.deliveryMethod] || orderDetails.deliveryMethod}\nADRESA: ${orderPayload.delivery_address}, ${orderPayload.delivery_zip} ${orderPayload.delivery_city}\n\nPOLOŽKY:\n${itemsSummary}\n\nPOZNÁMKA: ${orderDetails.message || 'Žiadna'}`,
          silent: true,
          _honeypot: orderDetails._honeypot
        });
      } catch (inqErr) {}
      setSuccess(true);
      clearCart();
      toast.success('Dopyt bol úspešne odoslaný!');
    } catch (err) {
      toast.error('Chyba pri odosielaní dopytu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-24 sm:pt-36 pb-16 px-4 sm:px-6 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="bg-emerald-100 text-emerald-600 p-5 rounded-full mb-6">
           <CheckCircle size={56} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mb-4 uppercase">Dopyt bol odoslaný!</h1>
        <p className="text-on-surface-variant max-w-md mb-10 uppercase text-[10px] font-bold tracking-widest leading-loose">
          Vaša požiadavka na materiál bola úspešne odoslaná. Čoskoro vás budeme kontaktovať s cenovou ponukou a možnosťami doručenia.
        </p>
        <Link to="/" className="bg-[#2d2f2b] text-primary px-8 py-4 font-black uppercase text-xs sm:text-sm tracking-widest hover:scale-[1.02] transition-transform">
          Späť na úvod
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-24 sm:pt-36 pb-16 px-4 sm:px-6 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <h1 className="text-2xl sm:text-4xl font-black mb-4 uppercase">Váš dopyt je prázdny</h1>
        <p className="text-on-surface-variant mb-10 font-medium text-sm sm:text-base">Nevybrali ste si zatiaľ žiadny tovar pre nacenenie.</p>
        <Link to="/materialy" className="bg-primary text-on-primary px-8 py-4 font-black uppercase tracking-widest hover:bg-[#daf900] transition-colors text-xs sm:text-sm">
          Prezerať katalóg
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-8 text-[10px] md:text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-semibold uppercase">ODOSLANIE DOPYTU</span>
      </nav>

      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3 sm:mb-4 uppercase">Váš Dopyt</h1>
        <p className="text-sm sm:text-lg text-on-surface-variant border-l-4 border-primary pl-4 font-medium">
          Vyplňte kontaktné údaje a my vám obratom zašleme nezáväznú cenovú ponuku.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Col - Form */}
        <div className="flex-1 space-y-12">
          {/* Kontaktné údaje */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
              <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">1</span>
              Kontaktné údaje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required name="firstName" placeholder="Meno *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
              <input required name="lastName" placeholder="Priezvisko *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
              <input required name="email" type="email" placeholder="E-mail *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
              <input required name="phone" placeholder="Telefón *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
            </div>
          </section>

          {/* Spôsob dopravy / Prevzatia */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
              <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">2</span>
              Požadovaný spôsob dopravy / prevzatia
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Option 1: Pickup */}
              <button
                type="button"
                onClick={() => handleDeliveryChange('pickup')}
                className={`p-5 text-left border rounded-none transition-all flex flex-col justify-between ${
                  orderDetails.deliveryMethod === 'pickup'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-outline/15 bg-surface hover:border-outline/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Store className={orderDetails.deliveryMethod === 'pickup' ? 'text-primary' : 'text-on-surface-variant'} size={24} />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${orderDetails.deliveryMethod === 'pickup' ? 'border-primary bg-primary' : 'border-outline/40'}`}>
                    {orderDetails.deliveryMethod === 'pickup' && <div className="w-1.5 h-1.5 bg-on-primary rounded-full" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">Osobný odber</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Predajňa STAVIVA ĽUBEĽA</p>
                </div>
              </button>

              {/* Option 2: Delivery */}
              <button
                type="button"
                onClick={() => handleDeliveryChange('delivery')}
                className={`p-5 text-left border rounded-none transition-all flex flex-col justify-between ${
                  orderDetails.deliveryMethod === 'delivery'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-outline/15 bg-surface hover:border-outline/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Truck className={orderDetails.deliveryMethod === 'delivery' ? 'text-primary' : 'text-on-surface-variant'} size={24} />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${orderDetails.deliveryMethod === 'delivery' ? 'border-primary bg-primary' : 'border-outline/40'}`}>
                    {orderDetails.deliveryMethod === 'delivery' && <div className="w-1.5 h-1.5 bg-on-primary rounded-full" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">Dovoz na stavbu</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Nákladným autom / HR</p>
                </div>
              </button>

              {/* Option 3: Own Transport */}
              <button
                type="button"
                onClick={() => handleDeliveryChange('own_transport')}
                className={`p-5 text-left border rounded-none transition-all flex flex-col justify-between ${
                  orderDetails.deliveryMethod === 'own_transport'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-outline/15 bg-surface hover:border-outline/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <PackageCheck className={orderDetails.deliveryMethod === 'own_transport' ? 'text-primary' : 'text-on-surface-variant'} size={24} />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${orderDetails.deliveryMethod === 'own_transport' ? 'border-primary bg-primary' : 'border-outline/40'}`}>
                    {orderDetails.deliveryMethod === 'own_transport' && <div className="w-1.5 h-1.5 bg-on-primary rounded-full" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">Vlastná doprava</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Naloženie na vašu dopravu</p>
                </div>
              </button>
            </div>
          </section>

          {/* Doručovacie údaje (ak vybral dovoz) */}
          {orderDetails.deliveryMethod === 'delivery' ? (
            <section className="animate-fadeIn">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
                <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">3</span>
                Adresa stavby / doručenia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required name="address" placeholder="Ulica a popisné číslo *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium md:col-span-2" />
                <input required name="city" placeholder="Mesto / Obec *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
                <input required name="zip" placeholder="PSČ *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
              </div>
            </section>
          ) : (
            <div className="p-4 bg-surface-container-low border border-primary/20 text-xs font-medium text-on-surface-variant flex items-center gap-3">
              <Store size={18} className="text-primary shrink-0" />
              <span>
                {orderDetails.deliveryMethod === 'pickup' 
                  ? 'Miesto odberu: Predajňa STAVIVA ĽUBEĽA, Ľubeľa 228 (otvorené Po-Pi 7:00-16:00, So 7:00-12:00)' 
                  : 'Pri vlastnej doprave vám materiál naložíme na vašu dopravu na predajni v Ľubeli.'}
              </span>
            </div>
          )}

          {/* Doplňujúce informácie */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
              <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">
                {orderDetails.deliveryMethod === 'delivery' ? '4' : '3'}
              </span>
              Doplňujúce požiadavky
            </h2>
            <textarea 
              name="message" 
              placeholder="Potrebujete vykládku hydraulickou rukou? Máte špecifický termín dodania? Napíšte nám..." 
              onChange={handleInputChange} 
              className="w-full p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium h-32 resize-none" 
            />
          </section>
        </div>

        {/* Right Col - Summary */}
        <div className="w-full lg:w-[450px]">
          <div className="bg-surface-container-low border border-outline/10 p-8 sticky top-32">
            <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
              <ClipboardList size={20} /> Zhrnutie dopytu
            </h2>
            
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-outline/5 pb-4 last:border-0">
                  <div className="w-16 h-16 bg-white shrink-0 overflow-hidden border border-outline/10">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-outline font-black uppercase tracking-widest">{item.quantity} {item.unit || 'ks'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 pt-4 border-t border-outline/10 text-xs font-bold text-on-surface-variant flex justify-between">
              <span>Vybraná doprava:</span>
              <span className="text-on-surface font-black">
                {orderDetails.deliveryMethod === 'pickup' && 'Osobný odber (Ľubeľa)'}
                {orderDetails.deliveryMethod === 'delivery' && 'Dovoz na stavbu (HR)'}
                {orderDetails.deliveryMethod === 'own_transport' && 'Vlastná doprava'}
              </span>
            </div>

            <input type="text" name="_honeypot" className="hidden" style={{ display: 'none' }} value={orderDetails._honeypot} onChange={handleInputChange} tabIndex="-1" autoComplete="off" />

            <button 
              onClick={handleSubmit}
              disabled={loading || !orderDetails.firstName || !orderDetails.lastName || !orderDetails.phone || (orderDetails.deliveryMethod === 'delivery' && !orderDetails.city)}
              className="w-full bg-[#2d2f2b] text-primary py-5 font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Odosielam...' : 'Odoslať dopyt'}
            </button>
            <p className="text-[10px] text-center text-outline font-bold uppercase tracking-widest mt-4">
              Nezáväzný dopyt pre cenovú ponuku
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
