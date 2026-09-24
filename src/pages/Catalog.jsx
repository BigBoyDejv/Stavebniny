import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingCart, Search, Eye, X, Plus, Minus, Filter } from 'lucide-react'
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
  const [sortBy, setSortBy] = useState('newest') // newest, name-asc
  const [modalQty, setModalQty] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  useEffect(() => {
    document.title = "Stavebné materiály | Stavebniny Ľubeľa"
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll()
      if (data && Array.isArray(data)) {
        const nonMaterialNames = ['Ručné náradie', 'Elektrické náradie', 'Vrtačky', 'Pomocky', 'Farby a laky', 'Krmivá', 'Hnojivá', 'Substráty', 'Osivá a semená', 'Postreky', 'Hrable a náradie']
        setCategories(['Všetko', ...data.filter(c => c.type === 'material' || (!c.type && !nonMaterialNames.includes(c.name))).map(c => c.name)])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll()
      if (data && Array.isArray(data)) {
        const nonMaterialNames = ['Ručné náradie', 'Elektrické náradie', 'Vrtačky', 'Pomocky', 'Farby a laky', 'Krmivá', 'Hnojivá', 'Substráty', 'Osivá a semená', 'Postreky', 'Hrable a náradie']
        setProducts(data.filter(p => p.type === 'material' || (!p.type && !nonMaterialNames.includes(p.category))))
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, sortBy])

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-[10px] md:text-sm font-label tracking-wide text-on-surface-variant">
        <Link className="hover:text-primary transition-colors" to="/">DOMOV</Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-semibold uppercase">STAVEBNÉ MATERIÁLY</span>
      </nav>

      {/* Hero Section */}
      <section className="mb-12 sm:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 sm:mb-6 uppercase break-words">Materiály</h1>
            <p className="text-sm sm:text-lg text-on-surface-variant max-w-xl font-medium border-l-4 border-primary pl-4 sm:pl-6">
              Kompletný sortiment stavebného materiálu pre hrubú stavbu, zateplenie, strechy aj suchú výstavbu.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full md:w-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Hľadať materiál..."
                className="w-full md:w-80 bg-white py-5 pr-5 !pl-14 text-sm font-bold uppercase tracking-widest border-b-2 border-outline/10 focus:border-primary outline-none transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/40 group-hover:text-primary transition-colors pointer-events-none" size={20} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 bg-white border border-outline/15 p-3.5 font-black uppercase tracking-widest text-xs rounded-lg active:bg-surface shadow-sm mb-4"
        >
          <Filter size={18} /> {showFilters ? 'Zatvoriť filtre' : 'Filtre a Kategórie'}
        </button>

        {/* Sidebar Filters */}
        <aside className={cn("w-full lg:w-64 shrink-0", showFilters ? "block" : "hidden lg:block")}>
          <div className="sticky top-28">
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-6 flex items-center gap-2">
                <Filter size={14} /> Kategórie
              </h4>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setShowFilters(false); }}
                    className={cn(
                      "text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                      selectedCategory === cat
                        ? "bg-primary text-on-primary shadow-md font-bold"
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
                <option value="name-asc">Názov (A-Z)</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-outline/10"></div>)
            ) : currentProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-dashed border-outline/20">
                <p className="font-bold text-outline">Nenašli sme žiadny stavebný materiál.</p>
              </div>
            ) : (
              currentProducts.map((product) => {
                return (
                  <div 
                    key={product.id} 
                    className="group bg-white border border-outline/10 hover:border-primary/40 transition-all duration-300 flex flex-col cursor-pointer" 
                    onClick={() => { setSelectedProduct(product); setModalQty(1); }}
                  >
                    <div className="relative aspect-square p-8 bg-[#fafafa] overflow-hidden">
                      <img
                        src={product.image_url || getPlaceholderImage(product.category, 'material')}
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-strong mb-2">{product.category || 'Materiál'}</span>
                      <h3 className="text-lg font-bold mb-6 line-clamp-2 h-14 group-hover:text-primary transition-colors">{product.name}</h3>

                      <div className="mt-auto flex justify-end items-end">
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
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-outline/10 bg-white font-bold text-xs uppercase hover:bg-surface disabled:opacity-50 transition-colors"
              >
                Predchádz.
              </button>
              <span className="text-xs font-black uppercase text-on-surface-variant">
                Strana {currentPage} z {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-outline/10 bg-white font-bold text-xs uppercase hover:bg-surface disabled:opacity-50 transition-colors"
              >
                Nasledujúca
              </button>
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

                <div className="prose prose-sm text-on-surface-variant leading-relaxed mb-12 font-medium">
                  {selectedProduct.description ? (
                    <p className="text-lg italic mb-6">{selectedProduct.description}</p>
                  ) : (
                    <p className="text-sm italic mb-6 text-outline">Pre tento produkt nie je k dispozícii žiadny podrobný popis.</p>
                  )}
                  <ul className="space-y-2 list-none p-0 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <strong>SKU:</strong> {selectedProduct.sku || 'N/A'}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-outline/10">
                <div className="flex items-center border border-outline/20 bg-surface">
                  <button
                    onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                    className="p-3 hover:bg-surface-container transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center font-bold"
                  ><Minus size={16} /></button>
                  <span className="px-4 font-bold text-sm min-w-[3rem] text-center">{modalQty}</span>
                  <button
                    onClick={() => setModalQty(modalQty + 1)}
                    className="p-3 hover:bg-surface-container transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center font-bold"
                  ><Plus size={16} /></button>
                </div>

                <button
                  onClick={() => {
                    for (let i = 0; i < modalQty; i++) {
                      addToCart(selectedProduct);
                    }
                    setSelectedProduct(null);
                  }}
                  className="flex-1 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs py-4 px-6 hover:bg-[#daf900] transition-colors flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
                >
                  <ShoppingCart size={18} /> Pridať do dopytu ({modalQty} {selectedProduct.unit || 'ks'})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog
