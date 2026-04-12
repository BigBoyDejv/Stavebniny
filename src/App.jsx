import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Rental from './pages/Rental'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import GDPR from './pages/GDPR'
import Terms from './pages/Terms'
import Shipping from './pages/Shipping'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <CartDrawer />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/katalog" element={<Catalog />} />
              <Route path="/pozicovna" element={<Rental />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/gdpr" element={<GDPR />} />
              <Route path="/obchodne-podmienky" element={<Terms />} />
              <Route path="/doprava-a-platba" element={<Shipping />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
