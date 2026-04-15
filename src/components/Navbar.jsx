import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'

const Navbar = () => {
  const location = useLocation()
  const { totalItems, setIsCartOpen } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const links = [
    { name: 'Domov', path: '/' },
    { name: 'Materiály', path: '/materialy' },
    { name: 'Nástroje', path: '/nastroje' },
    { name: 'Požičovňa', path: '/pozicovna' },
    { name: 'Kontakt', path: '/kontakt' }
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f7f7f0]/80 backdrop-blur-md border-b border-outline/5">
      <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 max-w-[1920px] mx-auto">
        <Link to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-opacity">
          <img src="/Logo.png" alt="Logo" className="h-8 md:h-10 w-auto" />
          <span className="text-lg md:text-xl font-black tracking-tighter text-[#2d2f2b] flex items-center gap-2">
            STAVEBNINY <span className="text-primary-strong font-bold hidden xs:inline">ĽUBEĽA</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-10">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "font-headline uppercase tracking-widest text-[10px] font-black transition-all p-1 border-b-2",
                isActive(link.path)
                  ? "text-primary-strong border-primary"
                  : "text-[#2d2f2b] border-transparent hover:text-primary-strong"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-4 md:border-r border-[#e8e9e1] md:pr-6">
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[#2d2f2b] hover:text-primary-strong transition-colors relative p-2"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#f7f7f0]">
                  {totalItems}
                </span>
              )}
            </button>
            <Link to="/admin" className="text-[#2d2f2b] hover:text-primary-strong transition-colors p-2 hidden xs:flex">
              <User size={22} />
            </Link>
          </div>

          <Link to="/admin" className="hidden sm:block bg-primary text-on-primary px-6 py-2.5 font-headline uppercase tracking-widest text-[10px] font-black hover:bg-[#daf900] active:scale-95 transition-all">
            PRO PORTÁL
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-[#2d2f2b]"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 top-[60px] md:top-[72px] bg-white z-[60] transition-all duration-300 lg:hidden",
        isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}>
        <div className="flex flex-col p-8 space-y-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "text-3xl font-black uppercase tracking-tighter transition-colors",
                isActive(link.path) ? "text-primary-strong" : "text-[#2d2f2b] hover:text-primary-strong"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-8 mt-8 border-t border-outline/10 flex flex-col gap-4">
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#2d2f2b] text-primary p-5 font-black uppercase text-center tracking-widest"
            >
              Prihlásiť sa (PRO)
            </Link>
            <div className="flex justify-center gap-8 py-4">
              <span className="text-outline text-xs font-bold uppercase">FB</span>
              <span className="text-outline text-xs font-bold uppercase">IG</span>
              <span className="text-outline text-xs font-bold uppercase">LI</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
