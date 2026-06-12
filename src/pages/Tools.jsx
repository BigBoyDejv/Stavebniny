import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, Filter, ShoppingBag, X, Plus, Minus, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { cn, getPlaceholderImage } from '../lib/utils'

const Tools = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(['Všetko'])
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalQty, setModalQty] = useState(1)

  useEffect(() => {
    document.title = "Náradie a nástroje | Stavebniny Ľubeľa"
    fetchTools()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('type', 'tool')
      .neq('name', 'Farby a laky')
      .order('name')
    if (data) setCategories(['Všetko', ...data.map(c => c.name)])
  }

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'tool')
        .neq('category', 'Farby a laky')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching tools:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="pt-28 pb-16 px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-8 text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-semibold uppercase">NÁRADIE</span>
      </nav>

      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Náradie</h1>
            <p className="text-lg text-on-surface-variant max-w-xl font-medium border-l-4 border-primary pl-6">
              Profesionálne ručné a elektrické náradie a ochranné pomôcky pre vašu prácu.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full md:w-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Hľadať náradie..."
                className="w-full md:w-80 bg-white p-5 pl-12 text-sm font-bold uppercase tracking-widest border-b-2 border-outline/10 focus:border-primary outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-5 text-outline/40 group-hover:text-primary transition-colors" size={20} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-navigation-height">
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-2">
                <Filter size={14} /> Kategórie
              </h4>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                      selectedCategory === cat
                        ? "bg-primary text-on-primary shadow-md"
                        : "hover:bg-surface text-on-surface-variant"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-6">Zoradiť</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-outline/10 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary"
              >
                <option value="newest">Najnovšie</option>
                <option value="price-asc">Od najlacnejšieho</option>
                <option value="price-desc">Od najdrahšieho</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-outline/10"></div>)
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-dashed border-outline/20">
                <p className="font-bold text-outline">Nenašli sme žiadne náradie.</p>
              </div>
            ) : (
               sortedProducts.map((product) => {
                const priceStr = product.price.toFixed(2).split('.')
                return (
                  <div key={product.id} className="group bg-white border border-outline/10 hover:border-primary/40 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setModalQty(1); }}>
                    <div className="relative aspect-square p-8 bg-[#fafafa] overflow-hidden">
                      <img
                        src={product.image_url || getPlaceholderImage(product.category, 'tool')}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-on-surface px-4 py-2 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 shadow-lg">
                          <Eye size={12} /> Náhľad
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-strong mb-2">{product.category}</span>
                      <h3 className="text-lg font-bold mb-6 line-clamp-2 h-14 group-hover:text-primary transition-colors">{product.name}</h3>

                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex flex-col">
                          <div className="flex items-start">
                            <span className="text-3xl font-black tracking-tighter leading-none">{priceStr[0]}</span>
                            <div className="flex flex-col ml-1">
                              <span className="text-base font-black leading-none">{priceStr[1]}</span>
                              <span className="text-lg font-black leading-none">€</span>
                              <p className="text-[10px] text-outline mt-1 font-medium">{product.price.toFixed(2)} € / {product.unit || 'ks'}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="p-4 bg-surface hover:bg-primary hover:text-on-primary transition-all active:scale-95 shadow-sm"
                        >
                          <ShoppingBag size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#2d2f2b]/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl shadow-2xl relative flex flex-col md:flex-row max-h-[95vh] overflow-hidden">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 bg-white/90 p-1.5 md:p-2 text-on-surface hover:text-primary transition-colors rounded-full shadow-lg"
            ><X size={24} className="md:hidden" /><X size={32} className="hidden md:block" /></button>

            <div className="w-full md:w-1/2 bg-surface aspect-square md:aspect-auto overflow-hidden shrink-0">
              <img
                src={selectedProduct.image_url || getPlaceholderImage(selectedProduct.category, 'tool')}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-16 overflow-y-auto flex flex-col">
              <div className="mb-auto">
                <span className="text-primary-strong font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-2 md:mb-4 block">
                  {selectedProduct.category || 'Náradie'}
                </span>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6 leading-none">
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
                    {selectedProduct.stock_quantity > 0 ? `SKLADOM ${selectedProduct.stock_quantity} ${selectedProduct.unit ? selectedProduct.unit.toUpperCase() : 'KS'}` : "NA OBJEDNÁVKU"}
                  </div>
                </div>

                <div className="prose prose-sm text-on-surface-variant leading-relaxed mb-12 font-medium">
                  {selectedProduct.description ? (
                    <p className="text-lg italic mb-6">{selectedProduct.description}</p>
                  ) : (
                    <p className="text-sm italic mb-6 text-outline">Pre tento produkt nie je k dispozícii žiadny podrobný popis.</p>
                  )}
                  <ul className="space-y-3 list-none p-0">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <strong>SKU:</strong> {selectedProduct.sku || 'N/A'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-2 border-outline/10 bg-surface">
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="p-4 hover:bg-primary/20 transition-colors"
                    ><Minus size={20} /></button>
                    <span className="min-w-[4rem] px-2 text-center font-black text-lg">{modalQty} {selectedProduct.unit || 'ks'}</span>
                    <button
                      onClick={() => setModalQty(modalQty + 1)}
                      className="p-4 hover:bg-primary/20 transition-colors"
                    ><Plus size={20} /></button>
                  </div>
                  <div className="text-[10px] font-bold uppercase text-outline tracking-wider leading-tight">
                    Presné množstvo pre prácu
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, modalQty);
                    setSelectedProduct(null);
                    setModalQty(1);
                  }}
                  className="w-full bg-[#2d2f2b] text-primary py-6 font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <ShoppingBag size={22} />
                  PRIDAŤ DO KOŠÍKA — {(selectedProduct.price * modalQty).toFixed(2)} €
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tools
