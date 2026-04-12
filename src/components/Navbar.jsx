import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f7f7f0]/80 backdrop-blur-md">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#2d2f2b]">
          STAVEBNINY
        </Link>
        <div className="hidden md:flex items-center space-x-12">
          {[
            { name: 'Domov', path: '/' },
            { name: 'Materiály', path: '/katalog' },
            { name: 'Požičovňa', path: '/pozicovna' },
            { name: 'Kontakt', path: '/kontakt' }
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-headline uppercase tracking-widest text-xs font-bold transition-all p-1 
                ${isActive(link.path) 
                  ? 'text-[#546200] border-b-2 border-[#daf900]' 
                  : 'text-[#2d2f2b] hover:bg-[#daf900] hover:text-[#505d00]'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex space-x-4 items-center border-r border-[#e8e9e1] pr-6 mr-2">
            <button className="text-[#2d2f2b] hover:text-[#546200] transition-colors">
              <ShoppingCart size={20} />
            </button>
            <button className="text-[#2d2f2b] hover:text-[#546200] transition-colors">
              <User size={20} />
            </button>
          </div>
          <Link to="/admin" className="bg-[#daf900] text-[#505d00] px-5 py-2.5 font-headline uppercase tracking-widest text-xs font-bold active:scale-95 transition-all">
            Pro Portál
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
