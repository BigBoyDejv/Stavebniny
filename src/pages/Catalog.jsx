import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Grid2x2, List, PlusCircle, ShoppingCart, Star, Loader2, Search, CheckCircle2, Eye, X, Plus, Minus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useCart } from '../context/CartContext'
import { cn, getPlaceholderImage } from '../lib/utils'

const Catalog = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(['Všetko'])
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // newest, price-asc, price-desc, name-asc
  const [modalQty, setModalQty] = useState(1)

  useEffect(() => {
    document.title = "Stavebné materiály | Stavebniny Ľubeľa"
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll('material')
      if (data && Array.isArray(data)) {
        setCategories(['Všetko', ...data.map(c => c.name)])
        return
      }
    } catch (err) {}
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('type', 'material')
      .order('name')
    if (data) setCategories(['Všetko', ...data.map(c => c.name)])
  }

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll({ type: 'material' })
      if (data && Array.isArray(data)) {
        setProducts(data)
        setLoading(false)
        return
      }
    } catch (err) {}
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'material')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error.message)
    } finally {
      setLoading(false)
    }
  }


  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    return new Date(b.created_at) - new Date(a.created_at) // newest
  })

  return (
    <div className="pt-28 pb-16 px-8 max-w-[1440px] mx-auto min-h-screen">
      <nav className="flex items-center gap-2 mb-8 text-[10px] md:text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-semibold uppercase">{selectedCategory}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 bg-white border border-outline/10 p-4 font-black uppercase tracking-widest text-xs"
        >
          <List size={18} /> {showFilters ? 'Zatvoriť filtre' : 'Filtre a Kategórie'}
        </button>

        {/* Sidebar Filters */}
        <aside className={cn(
          "w-full lg:w-64 flex-shrink-0 space-y-10 lg:block",
          showFilters ? "block" : "hidden"
        )}>
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
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => { setSelectedCategory(cat); setShowFilters(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 transition-all text-left",
                      selectedCategory === cat
                        ? "bg-primary text-on-primary font-bold shadow-md"
                        : "hover:bg-surface-container-low"
                    )}
                  >
                    <span className="text-xs md:text-sm">{cat}</span>
                    <ChevronRight size={18} className={cn("hidden lg:block", selectedCategory === cat ? "opacity-100" : "opacity-0")} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="hidden lg:block bg-surface-container-low p-6 rounded-none border border-outline/5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Star className="text-primary-strong fill-primary-strong" size={16} />
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
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase">{selectedCategory}</h1>
              <p className="text-on-surface-variant text-xs md:text-sm font-medium">Nájdených {filteredProducts.length} produktov</p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-outline hidden sm:block">Zoradiť podľa:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none bg-white border border-outline/10 p-3 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="newest">Najnovšie</option>
                <option value="name-asc">Názov (A-Z)</option>
              </select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="group bg-white border border-outline/10 hover:border-primary/40 transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => { setSelectedProduct(product); setModalQty(1); }}
                  >
                    {/* Image container */}
                    <div className="relative aspect-square overflow-hidden p-6 bg-[#fcfcfc]">
                      <img
                        src={product.image_url || getPlaceholderImage(product.category, 'material')}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getPlaceholderImage(product.category, 'material');
                        }}
                      />
                      {product.stock_quantity <= 0 && (
                        <div className="absolute top-4 left-4 bg-error text-white text-[8px] font-black uppercase px-2 py-1">Vypredané</div>
                      )}
                      {product.category && (
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-on-surface text-[8px] font-bold uppercase px-2 py-1 border border-outline/10">
                          {product.category}
                        </div>
                      )}
                    </div>

                    {/* Info container */}
                    <div className="p-6 flex flex-col flex-grow bg-white">
                      <h3 className="text-sm font-medium text-on-surface leading-snug mb-4 line-clamp-2 h-10 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-4 flex justify-between items-center border-t border-outline/5">
                        <span className="text-[10px] uppercase font-bold text-outline">
                          {product.sku || 'SKU'}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="px-4 py-3 bg-surface hover:bg-primary hover:text-on-primary transition-all active:scale-95 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                          <ShoppingCart size={16} /> Pridať do dopytu
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 bg-white/90 p-1.5 md:p-2 text-on-surface hover:text-primary transition-colors rounded-full shadow-lg"
            ><X size={24} className="md:hidden" /><X size={32} className="hidden md:block" /></button>

            <div className="w-full md:w-1/2 bg-surface aspect-square md:aspect-auto overflow-hidden shrink-0">
              <img
                src={selectedProduct.image_url || getPlaceholderImage(selectedProduct.category, 'material')}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-16 overflow-y-auto flex flex-col">
              <div className="mb-auto">
                <span className="text-primary-strong font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-2 md:mb-4 block">
                  {selectedProduct.category || 'Materiál'}
                </span>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6 leading-none">
                  {selectedProduct.name}
                </h2>

                <div className="flex items-center gap-6 mb-10">
                  <div className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2",
                    selectedProduct.stock_quantity > 0 ? "border-emerald-500 text-emerald-600" : "border-zinc-300 text-zinc-400"
                  )}>
                    {selectedProduct.stock_quantity > 0 ? `SKLADOM ${selectedProduct.stock_quantity} ${selectedProduct.unit ? selectedProduct.unit.toUpperCase() : 'KS'}` : "NA OBJEDNÁVKU"}
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
                    Presné množstvo<br />pre váš projekt
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
                  <ShoppingCart size={22} />
                  PRIDAŤ DO DOPYTU
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
