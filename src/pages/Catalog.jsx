import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Grid2x2, List, PlusCircle, ShoppingCart, Star, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

const Catalog = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-28 pb-16 px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-8 text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={16} />
        <span className="text-on-surface font-semibold">STAVEBNÉ MATERIÁLY</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-10">
          <section>
            <span className="block text-xs font-bold tracking-[0.05em] text-outline mb-4 uppercase">Kategórie</span>
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center justify-between p-3 bg-primary text-on-primary font-bold">
                  <span>Murovací materiál</span>
                  <ChevronRight size={18} />
                </button>
              </li>
              {['Izolácie', 'Strešné systémy', 'Náradie'].map(cat => (
                <li key={cat}>
                  <button className="w-full flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors">
                    <span>{cat}</span>
                    <ChevronRight size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main Product Area */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-1">Murovací materiál</h1>
              <p className="text-on-surface-variant text-sm">Zobrazených {products.length} produktov</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="bg-surface-container-low h-96"></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low">
              <p className="text-on-surface-variant mb-4">Zatiaľ neboli pridané žiadne produkty.</p>
              <Link to="/admin" className="text-primary font-bold underline">Pridajte prvý produkt v Admin paneli</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-surface-container-lowest flex flex-col transition-all hover:bg-white border border-transparent hover:border-outline-variant">
                  <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                    <img 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={product.image_url || 'https://via.placeholder.com/400'} 
                    />
                    {product.name.toLowerCase().includes('akcia') && (
                      <div className="absolute top-3 left-3 bg-tertiary text-white font-label text-[10px] px-2 py-1 tracking-wide font-bold uppercase">AKCIA</div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="font-label text-[10px] text-outline tracking-wider uppercase mb-1">{product.category || 'MATERIÁL'}</span>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors hover:cursor-pointer">{product.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-6 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black tracking-tight">{product.price.toFixed(2)} €</span>
                        <span className="text-[10px] text-on-surface-variant ml-1">/ ks</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-primary text-on-primary w-12 h-12 flex items-center justify-center scale-95 active:scale-90 transition-transform hover:bg-[#daf900]"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Catalog
