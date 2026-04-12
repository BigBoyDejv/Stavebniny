import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingCart, Star, Search, Filter, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'

const Tools = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'tool')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching tools:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Všetko', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch;
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
        <span className="text-on-surface font-semibold uppercase">NÁSTROJE A FARBY</span>
      </nav>

      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Nástroje</h1>
            <p className="text-lg text-on-surface-variant max-w-xl font-medium border-l-4 border-primary pl-6">
              Profesionálne náradie, farby a ochranné pomôcky pre vašu prácu. Kvalita, na ktorú sa môžete spoľahnúť.
            </p>
          </div>
          
          <div className="flex flex-col gap-6 w-full md:w-auto">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Hľadať nástroj..." 
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
              [1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-outline/10"></div>)
            ) : sortedProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-dashed border-outline/20">
                <p className="font-bold text-outline">Nenašli sme žiadne nástroje.</p>
              </div>
            ) : (
              sortedProducts.map((product) => {
                const priceStr = product.price.toFixed(2).split('.')
                return (
                  <div key={product.id} className="group bg-white border border-outline/10 hover:border-primary/40 transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square p-8 bg-[#fafafa] overflow-hidden">
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/400'} 
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-strong mb-2">{product.category}</span>
                      <h3 className="text-lg font-bold mb-6 line-clamp-2 h-14 group-hover:text-primary transition-colors">{product.name}</h3>
                      
                      <div className="flex gap-0.5 mb-8">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={14} className={cn("fill-current", star <= 4 ? "text-orange-500" : "text-gray-200")} />
                        ))}
                      </div>

                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex items-start">
                           <span className="text-3xl font-black tracking-tighter leading-none">{priceStr[0]}</span>
                           <div className="flex flex-col ml-1">
                              <span className="text-base font-black leading-none">{priceStr[1]}</span>
                              <span className="text-lg font-black leading-none">€</span>
                           </div>
                        </div>
                        <button 
                           onClick={() => addToCart(product)}
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
    </div>
  )
}

export default Tools
