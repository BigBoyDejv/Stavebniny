import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { ChevronRight, ClipboardList, CheckCircle } from 'lucide-react';
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
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: '', message: ''
  });

  useEffect(() => {
    document.title = "Odoslanie dopytu | Stavebniny Ľubeľa"
  }, [])

  const handleInputChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderPayload = {
      customer_name: `${orderDetails.firstName} ${orderDetails.lastName}`.trim(),
      customer_email: orderDetails.email,
      customer_phone: orderDetails.phone,
      delivery_address: orderDetails.address,
      delivery_city: orderDetails.city,
      delivery_zip: orderDetails.zip,
      total_price: 0,
      status: 'dopyt',
      note: orderDetails.message,
      items: cart
    }

    try {
      try {
        await api.orders.create(orderPayload)
      } catch (phpErr) {
        console.warn('PHP order submission failed, falling back to Supabase:', phpErr)
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            total_price: 0,
            status: 'dopyt',
            shipping_info: {
              ...orderDetails,
              shippingMethod: 'inquiry',
              message: orderDetails.message
            }
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        const itemsToInsert = cart.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: 0
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      if (itemsError) throw itemsError;

      // Odoslanie e-mailovej notifikácie
      try {
        const itemsList = cart.map(item => `- ${item.name} (${item.quantity} ${item.unit || 'ks'})`).join('\n');
        const detailsSummary = `NOVÝ DOPYT ZO STAVEBNÍN

Meno zákazníka: ${orderDetails.firstName} ${orderDetails.lastName}
E-mail: ${orderDetails.email}
Telefón: ${orderDetails.phone}
Adresa: ${orderDetails.address}, ${orderDetails.zip} ${orderDetails.city}

Správa od zákazníka:
${orderDetails.message || 'Žiadna správa'}

POLOŽKY DOPYTU:
${itemsList}`;

        const emailTo = settings.contact_email || 'kubik@stavivalubela.sk';
        await sendEmailNotification({
          type: 'Dopyt',
          emailTo,
          customerName: `${orderDetails.firstName} ${orderDetails.lastName}`,
          customerEmail: orderDetails.email,
          customerPhone: orderDetails.phone,
          subject: `Nový dopyt materiálu - ${orderDetails.firstName} ${orderDetails.lastName}`,
          details: detailsSummary
        });
      } catch (emailErr) {
        console.error('Failed to dispatch email notification:', emailErr);
      }

      // 3. Success
      setSuccess(true);
      clearCart();
    } catch (err) {
      toast.error('Chyba pri odosielaní dopytu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-20 px-8 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="bg-emerald-100 text-emerald-600 p-6 rounded-full mb-8">
           <CheckCircle size={64} />
        </div>
        <h1 className="text-4xl font-black mb-4 uppercase">Dopyt bol odoslaný!</h1>
        <p className="text-on-surface-variant max-w-md mb-12 uppercase text-[10px] font-bold tracking-widest leading-loose">
          Vaša požiadavka na materiál bola úspešne odoslaná. Čoskoro vás budeme kontaktovať s cenovou ponukou a možnosťami doručenia.
        </p>
        <Link to="/" className="bg-[#2d2f2b] text-primary px-10 py-5 font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-transform">
          Späť na úvod
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-20 px-8 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <h1 className="text-4xl font-black mb-4 uppercase">Váš dopyt je prázdny</h1>
        <p className="text-on-surface-variant mb-12 font-medium">Nevybrali ste si zatiaľ žiadny tovar pre nacenenie.</p>
        <Link to="/katalog" className="bg-primary text-on-primary px-10 py-5 font-black uppercase tracking-widest hover:bg-[#daf900] transition-colors">
          Prezerať katalóg
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-12 text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-semibold uppercase">ODOSLANIE DOPYTU</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">Váš Dopyt</h1>
        <p className="text-lg text-on-surface-variant border-l-4 border-primary pl-4 font-medium">
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

          {/* Doručovacie údaje */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
              <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">2</span>
              Adresa doručenia / stavby
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required name="address" placeholder="Ulica a popisné číslo *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium md:col-span-2" />
              <input required name="city" placeholder="Mesto / Obec *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
              <input required name="zip" placeholder="PSČ *" onChange={handleInputChange} className="p-4 bg-surface border border-outline/10 focus:border-primary outline-none font-medium" />
            </div>
          </section>

          {/* Doplňujúce informácie */}
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-3">
              <span className="bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full">3</span>
              Doplňujúce požiadavky
            </h2>
            <textarea 
              name="message" 
              placeholder="Potrebujete zabezpečiť dovoz s hydraulickou rukou? Máte iné špecifické požiadavky? Napíšte nám ich sem..." 
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

            <button 
              onClick={handleSubmit}
              disabled={loading || !orderDetails.firstName || !orderDetails.lastName || !orderDetails.phone || !orderDetails.city}
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
