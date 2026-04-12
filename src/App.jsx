import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Rental from './pages/Rental'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
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
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
