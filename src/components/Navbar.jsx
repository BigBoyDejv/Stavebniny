import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Phone, ChevronRight, Search, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { api } from '../lib/api'
import { cn } from '../lib/utils'

const Navbar = () => {
  const location = useLocation()
  const { totalItems, setIsCartOpen, addToCart } = useCart()
  const { settings } = useSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const isActive = (path) => location.pathname === path

  // Lock body scroll when mobile menu or search is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen, isSearchOpen])

  // Close menu & search on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  // Fetch all products when search is opened
  useEffect(() => {
    if (isSearchOpen && allProducts.length === 0) {
      setSearchLoading(true)
      api.products.getAll()
        .then(data => {
          if (Array.isArray(data)) setAllProducts(data)
        })
        .catch(err => console.error('Global search fetch error:', err))
        .finally(() => setSearchLoading(false))
    }
  }, [isSearchOpen])

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredSearchResults = searchQuery.trim() === '' ? [] : allProducts.filter(product => {
    const q = searchQuery.toLowerCase()
    return (
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.category && product.category.toLowerCase().includes(q)) ||
      (product.sku && product.sku.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q))
    )
  })

  const getProductRoute = (product) => {
    if (product.type === 'tool' || ['Ručné náradie', 'Elektrické náradie', 'Vrtačky', 'Pomocky', 'Ochranné pomôcky'].includes(product.category)) {
      return '/naradie'
    }
    if (product.type === 'paint' || product.category === 'Farby a laky') {
      return '/farby-laky'
    }
    if (product.type === 'agriculture' || ['Krmivá', 'Hnojivá', 'Substráty', 'Osivá a semená', 'Postreky', 'Hrable a náradie'].includes(product.category)) {
      return '/polnohospodarske-produkty'
    }
    return '/materialy'
  }

  const links = [
    { name: 'Domov', path: '/' },
    { name: 'Materiály', path: '/materialy' },
    { name: 'Náradie', path: '/naradie' },
    { name: 'Poľnohospodárske produkty', path: '/polnohospodarske-produkty' },
    { name: 'Farby/Laky', path: '/farby-laky' },
    { name: 'Požičovňa', path: '/pozicovna' },
    { name: 'Kontakt', path: '/kontakt' }
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f7f7f0]/95 backdrop-blur-md border-b border-outline/10">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 max-w-[1920px] mx-auto">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity shrink-0">
            <img src="/Logo.png" alt="Logo" className="h-8 sm:h-9 md:h-10 w-auto" />
            <span className="text-base sm:text-lg md:text-xl font-black tracking-tighter text-[#2d2f2b] flex items-center gap-1.5">
              STAVEBNINY <span className="text-primary-strong font-bold">ĽUBEĽA</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-body uppercase tracking-wider text-[11px] font-bold transition-all p-1 border-b-2",
                  isActive(link.path)
                    ? "text-primary-strong border-primary"
                    : "text-[#2d2f2b] border-transparent hover:text-primary-strong"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Global Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[#2d2f2b] hover:text-primary-strong transition-colors p-2 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center rounded-lg hover:bg-black/5 active:scale-95"
              aria-label="Vyhľadať produkt"
              title="Vyhľadať produkt..."
            >
              <Search size={22} />
              <span className="text-xs font-bold uppercase hidden xl:inline">Hľadať</span>
            </button>

            <div className="flex items-center gap-2 md:border-r border-[#e8e9e1] md:pr-3">
              {/* Cart / Inquiry button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-[#2d2f2b] hover:text-primary-strong transition-colors relative p-2 flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center"
                aria-label="Váš dopyt"
              >
                <span className="font-bold text-xs uppercase hidden md:block">Dopyt</span>
                <div className="relative">
                  <ShoppingCart size={22} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#f7f7f0] shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>

              {/* Admin User Link */}
              <Link to="/admin" className="text-[#2d2f2b] hover:text-primary-strong transition-colors p-2 hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center" aria-label="Admin profil">
                <User size={22} />
              </Link>
            </div>

            {/* PRO Portál Button Desktop */}
            <Link to="/admin" className="hidden sm:block bg-primary text-on-primary px-4 py-2.5 font-headline uppercase tracking-widest text-[10px] font-black hover:bg-[#daf900] active:scale-95 transition-all">
              PRO PORTÁL
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-[#2d2f2b] hover:bg-black/5 active:bg-black/10 rounded-lg transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label={isMenuOpen ? "Zatvoriť menu" : "Otvoriť menu"}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 top-[53px] sm:top-[61px] bg-[#f7f7f0] z-40 lg:hidden flex flex-col justify-between transition-all duration-300 ease-in-out overflow-y-auto",
          isMenuOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="px-6 py-6 flex flex-col space-y-2">
          {/* Mobile search quick trigger */}
          <button
            onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
            className="flex items-center justify-between p-3.5 bg-white border border-outline/15 rounded-xl text-sm font-bold text-outline/80 mb-2 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Search size={18} className="text-primary-strong" />
              <span>Vyhľadať produkt...</span>
            </div>
            <span className="text-[10px] uppercase font-black bg-primary/20 text-primary-strong px-2 py-0.5 rounded">Hľadať</span>
          </button>

          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center justify-between py-3.5 px-4 rounded-xl text-lg font-bold uppercase tracking-tight transition-all active:scale-[0.99]",
                isActive(link.path) 
                  ? "bg-primary/20 text-primary-strong font-black" 
                  : "text-[#2d2f2b] hover:bg-white/80"
              )}
            >
              <span>{link.name}</span>
              <ChevronRight size={18} className={isActive(link.path) ? "text-primary-strong" : "text-outline/40"} />
            </Link>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-outline/10 space-y-4 mt-auto">
          {/* Quick Cart button inside mobile menu */}
          <button
            onClick={() => { setIsMenuOpen(false); setIsCartOpen(true); }}
            className="w-full bg-[#f7f7f0] border border-outline/20 text-[#2d2f2b] p-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-primary-strong" />
              <span>Zobraziť dopyt</span>
            </div>
            {totalItems > 0 && (
              <span className="bg-primary text-on-primary text-xs font-black px-2.5 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'položka' : 'položiek'}
              </span>
            )}
          </button>

          {/* Quick PRO portal link */}
          <Link
            to="/admin"
            onClick={() => setIsMenuOpen(false)}
            className="w-full bg-[#2d2f2b] text-primary p-4 rounded-xl font-black uppercase text-center tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <User size={18} />
            <span>Prihlásiť sa (PRO Portál)</span>
          </Link>

          {/* Contact quick phone link if setting available */}
          {settings?.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="flex items-center justify-center gap-2 text-xs font-bold text-[#2d2f2b]/70 py-2 hover:text-primary-strong transition-colors"
            >
              <Phone size={14} />
              <span>Infolinka: {settings.contact_phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Global Product Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#f7f7f0] rounded-2xl shadow-2xl overflow-hidden my-4 border border-white/40">
            {/* Search Header */}
            <div className="p-4 sm:p-6 bg-white border-b border-outline/10 flex items-center gap-3 relative">
              <Search size={22} className="text-primary-strong shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Hľadať produkt (napr. cement, vŕtačka, bofix, farba...)"
                className="w-full bg-transparent text-base sm:text-lg font-bold placeholder:text-outline/50 focus:outline-none border-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-black uppercase bg-surface px-2.5 py-1 text-outline hover:text-on-surface rounded"
                >
                  Vymazať
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-on-surface hover:text-primary transition-colors rounded-full shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Zatvoriť vyhľadávanie"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Content */}
            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
              {searchLoading ? (
                <div className="p-12 text-center font-bold text-outline animate-pulse text-sm uppercase">
                  Načítavam produkty...
                </div>
              ) : searchQuery.trim() === '' ? (
                <div className="p-8 text-center text-outline text-xs uppercase font-bold tracking-wider space-y-2">
                  <p>Zadajte názov produktu, kategóriu alebo kód pre vyhľadávanie.</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-3">
                    {['Cement', 'Vŕtačka', 'Farba', 'Bofix', 'Pena', 'Sadrokartón'].map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => setSearchQuery(keyword)}
                        className="bg-white border border-outline/15 text-[#2d2f2b] px-3 py-1.5 rounded-full text-xs hover:border-primary transition-colors"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs uppercase font-bold">
                  Nenašli sa žiadne produkty pre výraz "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase text-outline px-1 mb-2">
                    <span>Nájdené produkty ({filteredSearchResults.length})</span>
                  </div>
                  {filteredSearchResults.map(product => {
                    const route = getProductRoute(product)
                    return (
                      <div
                        key={product.id}
                        className="bg-white p-3.5 sm:p-4 rounded-xl border border-outline/10 hover:border-primary transition-all flex items-center justify-between gap-4 group shadow-xs"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-surface p-1 rounded-lg shrink-0 border border-outline/10"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-surface rounded-lg shrink-0 flex items-center justify-center text-outline border border-outline/10 text-xs font-bold">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary-strong block truncate">
                              {product.category || 'Materiál'}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-on-surface truncate group-hover:text-primary-strong transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-outline truncate mt-0.5">
                              {product.price > 0 ? `${Number(product.price).toFixed(2)} € / ${product.unit || 'ks'}` : 'Cena na dopyt'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              addToCart(product)
                              setIsSearchOpen(false)
                            }}
                            className="bg-surface hover:bg-primary hover:text-on-primary text-on-surface px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-outline/10 transition-all flex items-center gap-1 active:scale-95"
                          >
                            <ShoppingCart size={13} />
                            <span className="hidden sm:inline">Do dopytu</span>
                          </button>
                          <Link
                            to={route}
                            onClick={() => setIsSearchOpen(false)}
                            className="bg-primary/10 text-primary-strong hover:bg-primary hover:text-on-primary p-2 rounded-lg transition-all flex items-center justify-center min-h-[36px] min-w-[36px]"
                            title="Prejsť na sekciu"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
