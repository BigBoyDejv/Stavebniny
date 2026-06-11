import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="p-6 border-b border-outline/10 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ShoppingBag size={20} /> NÁKUPNÝ KOŠÍK
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-surface transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-on-surface-variant mb-6 text-sm uppercase font-bold tracking-widest">Košík je prázdny</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-primary text-on-primary px-8 py-4 font-black text-xs uppercase tracking-widest"
              >
                Pokračovať v nákupe
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-20 bg-surface-container-low shrink-0 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold leading-tight">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-outline hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-on-surface-variant text-xs mb-3">{item.price.toFixed(2)} € / {item.unit || 'ks'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-outline/20 bg-surface">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-primary/20 transition-colors"><Minus size={12} /></button>
                      <span className="px-2 text-xs font-bold min-w-[3.5rem] text-center">{item.quantity} {item.unit || 'ks'}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-primary/20 transition-colors"><Plus size={12} /></button>
                    </div>
                    <span className="font-black">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer className="p-6 border-t border-outline/10 bg-surface">
            <div className="flex justify-between items-end mb-6">
              <span className="text-xs font-bold uppercase text-outline tracking-wider">Celkom k úhrade</span>
              <span className="text-3xl font-black tracking-tight">{totalPrice.toFixed(2)} €</span>
            </div>
            <Link 
              to="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-[#2d2f2b] text-primary py-5 flex items-center justify-center font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-transform"
            >
              Prejsť k objednávke
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
