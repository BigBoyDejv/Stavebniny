import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
        aria-label="Zatvoriť dopyt"
      />
      
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="p-4 sm:p-6 border-b border-outline/10 flex justify-between items-center bg-[#f7f7f0]">
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 text-[#2d2f2b]">
            <ShoppingBag size={22} className="text-primary-strong" /> VÁŠ DOPYT
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="p-2 text-[#2d2f2b] hover:bg-black/5 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Zatvoriť"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-on-surface-variant mb-6 text-xs sm:text-sm uppercase font-bold tracking-widest">Zoznam je prázdny</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-primary text-on-primary px-8 py-4 font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#daf900] active:scale-95 transition-all"
              >
                Prezerať katalóg
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 sm:gap-4 p-3 border border-outline/10 rounded-lg bg-surface/50 items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-container-low shrink-0 overflow-hidden rounded">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-xs sm:text-sm font-bold leading-tight truncate">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-outline hover:text-error transition-colors p-2 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                      aria-label="Odstrániť"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center border border-outline/20 bg-white rounded overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)} 
                        className="p-2 hover:bg-primary/20 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="Znížiť počet"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 text-xs font-bold min-w-[3rem] text-center">{item.quantity} {item.unit || 'ks'}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        className="p-2 hover:bg-primary/20 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="Zvýšiť počet"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer className="p-4 sm:p-6 border-t border-outline/10 bg-surface pb-8 sm:pb-6">
            <Link 
              to="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-[#2d2f2b] text-primary py-4 sm:py-5 flex items-center justify-center font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-black active:scale-[0.98] transition-all rounded-none"
            >
              Odoslať dopyt
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
