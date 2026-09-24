import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { CartProvider } from './context/CartContext'

const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Rental = lazy(() => import('./pages/Rental'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin = lazy(() => import('./pages/Admin'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Tools = lazy(() => import('./pages/Tools'))
const Paints = lazy(() => import('./pages/Paints'))
const Agriculture = lazy(() => import('./pages/Agriculture'))
const GDPR = lazy(() => import('./pages/GDPR'))
const Terms = lazy(() => import('./pages/Terms'))
const Shipping = lazy(() => import('./pages/Shipping'))
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import { Toaster } from 'react-hot-toast'
import { Agentation } from 'agentation'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname])

  return null
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Toaster position="bottom-right" />
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">
                <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
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
                </Suspense>
              </main>
              <Footer />
              {(import.meta.env.DEV || process.env.NODE_ENV === 'development') && <Agentation />}
            </div>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
