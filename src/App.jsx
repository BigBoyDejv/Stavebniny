import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Rental from './pages/Rental'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import Tools from './pages/Tools'
import Paints from './pages/Paints'
import Agriculture from './pages/Agriculture'
import GDPR from './pages/GDPR'
import Terms from './pages/Terms'
import Shipping from './pages/Shipping'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Toaster position="bottom-right" />
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/materialy" element={<Catalog />} />
                  <Route path="/nastroje" element={<Tools />} />
                  <Route path="/naradie" element={<Tools />} />
                  <Route path="/polnohospodarske-produkty" element={<Agriculture />} />
                  <Route path="/farby-laky" element={<Paints />} />
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
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
