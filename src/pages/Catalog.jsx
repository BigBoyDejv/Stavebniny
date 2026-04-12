import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Grid2x2, List, PlusCircle, ShoppingCart, Star, Loader2, Search, CheckCircle2, Eye, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'

const Catalog = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

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

  const categories = ['Všetko', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  })

  return (
    <div className="pt-28 pb-16 px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-8 text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={16} />
        <span className="text-on-surface font-semibold uppercase">{selectedCategory}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-10">
          <section>
            <div className="relative mb-8">
              <input 
                type="text" 
                placeholder="Hľadať produkt..." 
                className="w-full bg-surface border-b-2 border-outline/20 py-3 pl-10 pr-4 focus:border-primary outline-none transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-3.5 text-outline/50" size={18} />
            </div>

            <span className="block text-xs font-bold tracking-[0.05em] text-outline mb-4 uppercase">Kategórie</span>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 transition-all text-left",
                      selectedCategory === cat 
                        ? "bg-primary text-on-primary font-bold shadow-md" 
                        : "hover:bg-surface-container-low"
                    )}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={18} className={selectedCategory === cat ? "opacity-100" : "opacity-0"} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-surface-container-low p-6 rounded-none border border-outline/5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Star className="text-primary fill-primary" size={16} />
              Doprava zadarmo
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pri objednávke nad 500 € v rámci okresu Liptovský Mikuláš dovezieme tovar zadarmo naším vozidlom.
            </p>
          </section>
        </aside>

        {/* Main Product Area */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-outline/10 pb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{selectedCategory}</h1>
              <p className="text-on-surface-variant text-sm font-medium">Nájdených {filteredProducts.length} produktov</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-surface-container-low h-[450px]"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-surface-container-low border border-dashed border-outline/30">
              <Search className="mx-auto mb-4 text-outline/30" size={48} />
              <p className="text-on-surface-variant text-lg font-bold mb-2">Nič sme nenašli</p>
              <p className="text-on-surface-variant/60 text-sm mb-6">Skúste zmeniť kategóriu alebo hľadaný výraz.</p>
              <button 
                onClick={() => { setSelectedCategory('Všetko'); setSearchQuery(''); }}
                className="text-primary font-bold hover:underline"
              >
                Zobraziť všetky produkty
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white border border-outline/5 hover:border-primary/30 transition-all hover:shadow-xl relative">
                   <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                    <img 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      src={product.image_url || 'https://via.placeholder.com/400'} 
                    />
                    {product.name.toLowerCase().includes('akcia') && (
                      <div className="absolute top-4 left-4 bg-tertiary text-white font-bold text-[10px] px-3 py-1 tracking-widest uppercase">AKCIA</div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-bold text-[10px] text-primary tracking-widest uppercase">{product.category || 'MATERIÁL'}</span>
                       {product.stock_quantity > 0 ? (
                         <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                           <CheckCircle2 size={12} /> Skladom
                         </span>
                       ) : (
                         <span className="text-[10px] text-zinc-400 font-bold uppercase">Na objednávku</span>
                       )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-on-surface-variant flex-1 line-clamp-2 mb-8 leading-relaxed italic">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline/5">
                      <div className="flex flex-col">
                        <span className="text-sm text-on-surface-variant line-through opacity-40 font-bold">
                           {product.name.toLowerCase().includes('akcia') ? (product.price * 1.2).toFixed(2) + ' €' : ''}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black tracking-tight text-[#2d2f2b]">{product.price.toFixed(2)} €</span>
                          <span className="text-xs text-on-surface-variant/60 font-bold">/ ks</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="bg-surface-container-high text-on-surface p-4 hover:bg-surface-container-highest transition-all"
                          title="Viac info"
                        >
                          <Eye size={22} />
                        </button>
                        <button 
                          onClick={() => addToCart(product)}
                          className="bg-primary text-on-primary p-4 hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-primary/20 hover:bg-[#daf900]"
                          title="Pridať do košíka"
                        >
                          <ShoppingCart size={22} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#2d2f2b]/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl shadow-2xl relative flex flex-col md:flex-row max-h-[95vh] overflow-hidden">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 z-10 bg-white/80 p-2 text-on-surface hover:text-primary transition-colors rounded-full"
            ><X size={32}/></button>
            
            <div className="w-full md:w-1/2 bg-surface aspect-square md:aspect-auto overflow-hidden">
              <img 
                src={selectedProduct.image_url || 'https://via.placeholder.com/800'} 
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-16 overflow-y-auto flex flex-col">
              <div className="mb-auto">
                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
                  {selectedProduct.category || 'Materiál'}
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-none">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-center gap-6 mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{selectedProduct.price.toFixed(2)} €</span>
                    <span className="text-sm text-on-surface-variant font-bold leading-none">Vrátane DPH</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2",
                    selectedProduct.stock_quantity > 0 ? "border-emerald-500 text-emerald-600" : "border-zinc-300 text-zinc-400"
                  )}>
                    {selectedProduct.stock_quantity > 0 ? `SKLADOM ${selectedProduct.stock_quantity} KS` : "NA OBJEDNÁVKU"}
                  </div>
                </div>

                <div className="prose prose-sm text-on-surface-variant leading-relaxed mb-12">
                  <p className="text-lg italic mb-6">{selectedProduct.description}</p>
                  <ul className="space-y-3 list-none p-0">
                    <li className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                       <strong>SKU:</strong> {selectedProduct.sku || 'N/A'}
                    </li>
                    <li className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                       <strong>EAN:</strong> {selectedProduct.ean || 'N/A'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full bg-[#2d2f2b] text-primary py-6 font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={24} />
                  PRIDAŤ DO KOŠÍKA
                </button>
                <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest pt-2">
                  Záruka kvality STAVEBNINY ĽUBEĽA
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog
