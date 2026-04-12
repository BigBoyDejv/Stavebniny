import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { ChevronRight, CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', zip: ''
  });

  const handleInputChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          total_price: totalPrice,
          status: 'prijatá', // In slovak
          shipping_info: orderDetails
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
      alert('Chyba pri vytváraní objednávky: ' + err.message);
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
        <h1 className="text-4xl font-black mb-4">OBJEDNÁVKA PRIJATÁ!</h1>
        <p className="text-on-surface-variant max-w-md mb-12">
          Ďakujeme za váš nákup. Vaša objednávka bola úspešne spracovaná a budeme vás informovať o jej stave.
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
    <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
      <h1 className="text-4xl font-black tracking-tight mb-12">DOKONČENIE OBJEDNÁVKY</h1>
      
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
                Doprava a platba
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="border border-primary bg-primary/5 p-4 flex justify-between items-center group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <Truck className="text-[#546200]" />
                      <span className="font-bold text-sm">Kurier DPD / Packeta</span>
                   </div>
                   <span className="font-black">GRÁTIS</span>
                </div>
                <div className="border border-outline/10 p-4 flex justify-between items-center bg-white">
                   <div className="flex items-center gap-4">
                      <CreditCard className="text-outline" />
                      <span className="font-bold text-sm">Prevodom na účet / Dobierka</span>
                   </div>
                   <span className="font-black">0,00 €</span>
                </div>
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
                         <span className="font-bold text-xs bg-surface min-w-[30px] h-[30px] flex items-center justify-center">x{item.quantity}</span>
                         <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)} €</span>
                   </div>
                 ))}
              </div>
              
              <div className="border-t border-outline/10 pt-6 space-y-2 mb-8">
                 <div className="flex justify-between text-on-surface-variant text-sm">
                    <span>Doprava</span>
                    <span className="font-bold text-emerald-600 uppercase">Zdarma</span>
                 </div>
                 <div className="flex justify-between text-2xl font-black pt-2">
                    <span>Celkom</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  form="checkout-form"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 font-black uppercase text-sm tracking-widest hover:bg-[#daf900] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {loading ? 'SPRACOVÁVAM...' : 'Potvrdiť objednávku'}
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
