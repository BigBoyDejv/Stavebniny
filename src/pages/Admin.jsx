import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { 
  Plus, Edit, Trash2, Package, Truck, MessageSquare, 
  LogOut, LayoutDashboard, Settings, Search, Filter, 
  ChevronRight, AlertCircle, CheckCircle2, X, Eye, Menu, PlusCircle,
  Upload, Image, Loader2, Calendar, Wrench, Sliders, Mail, Bell
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cn, compressImage } from '../lib/utils'
import { toast } from 'react-hot-toast'
import { calculateShopShipping, MUNICIPALITIES, KM_RATES, ADDITIONAL_FEES } from '../lib/shipping'

const Admin = () => {
  const { session, logout } = useAuth()
  const { settings, refreshSettings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ products: 0, orders: 0, inquiries: 0, stock: 0 })

  // Shipping calculator states for admin
  const [calcVehicle, setCalcVehicle] = useState('car35')
  const [calcMunicipality, setCalcMunicipality] = useState('')
  const [calcDistance, setCalcDistance] = useState(0)
  const [calcCrane, setCalcCrane] = useState(false)
  const [calcPallets, setCalcPallets] = useState(1)
  const [calcWait, setCalcWait] = useState(false)
  const [calcWaitHalfHours, setCalcWaitHalfHours] = useState(1)
  const [categories, setCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', type: 'material' })
  const [showModal, setShowModal] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInquiryDetails, setShowInquiryDetails] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [shippingConfig, setShippingConfig] = useState(null)
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [rentalItemsList, setRentalItemsList] = useState([])
  const [bookingFormData, setBookingFormData] = useState({
    rental_item_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    start_time: '08:00',
    end_time: '08:00',
    status: 'approved',
    note: ''
  })
  const [editingRental, setEditingRental] = useState(null)
  const [rentalFormData, setRentalFormData] = useState({
    name: '',
    category: 'Vibračná a hutniaca technika',
    price4h: 0,
    price24h: 0,
    deposit: 100,
    description: '',
    note: '',
    image_url: '',
    accessories: [],
    availability: true,
    quantity: 1
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock_quantity: 0,
    category: '',
    image_url: '',
    type: 'material',
    unit: 'ks'
  })

  const [settingsForm, setSettingsForm] = useState({
    hours_weekday: '',
    hours_saturday: '',
    hours_sunday: '',
    contact_phone: '',
    contact_address: '',
    contact_email: '',
    billing_name: '',
    billing_ico: '',
    billing_icdph: '',
    hours_alert_enabled: 'false',
    hours_alert_message: '',
    hours_alert_type: 'info'
  })

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        hours_weekday: settings.hours_weekday || '',
        hours_saturday: settings.hours_saturday || '',
        hours_sunday: settings.hours_sunday || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        contact_email: settings.contact_email || '',
        billing_name: settings.billing_name || '',
        billing_ico: settings.billing_ico || '',
        billing_icdph: settings.billing_icdph || '',
        hours_alert_enabled: settings.hours_alert_enabled || 'false',
        hours_alert_message: settings.hours_alert_message || '',
        hours_alert_type: settings.hours_alert_type || 'info'
      })
    }
  }, [settings, view])

  const changeView = (newView) => {
    setView(newView)
    setData([])
    setSearchTerm('')
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    document.title = "Administrácia | Stavebniny PRO"
  }, [])

  useEffect(() => {
    if (session) {
       fetchData()
       if (view === 'dashboard') fetchStats()
    }
  }, [session, view])

  useEffect(() => {
    if (view === 'shipping' && settings.shipping_config) {
      try {
        const parsed = typeof settings.shipping_config === 'string'
          ? JSON.parse(settings.shipping_config)
          : settings.shipping_config
        setShippingConfig(parsed)
      } catch (e) {
        console.error('Failed to parse shipping config:', e)
      }
    }
  }, [view, settings.shipping_config])

  const fetchStats = async () => {
    try {
      const products = await api.products.getAll()
      const orders = await api.orders.getAll()
      const inquiries = await api.inquiries.getAll()
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        inquiries: Array.isArray(inquiries) ? inquiries.length : 0
      })
    } catch (e) {
      console.error('Fetch stats error:', e)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Fetch categories error:', e)
      setCategories([])
    }
  }

  const fetchData = async () => {
    setLoading(true)
    if (view === 'dashboard' || view === 'shipping') {
      setLoading(false)
      return
    }

    try {
      let data = []
      if (view === 'products') {
        data = await api.products.getAll()
        fetchCategories()
      } else if (view === 'categories') {
        data = await api.categories.getAll()
      } else if (view === 'orders') {
        data = await api.orders.getAll()
      } else if (view === 'inquiries') {
        data = await api.inquiries.getAll()
      } else if (view === 'rentals') {
        data = await api.rental.getItems()
      } else if (view === 'bookings') {
        data = await api.rental.getBookings()
        const items = await api.rental.getItems()
        if (Array.isArray(items)) setRentalItemsList(items)
      }
      setData(Array.isArray(data) ? data : [])
    } catch (apiErr) {
      console.error('API fetch failed:', apiErr)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e, type = 'product') => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setImageUploading(true)
    const uploadToastId = toast.loading('Komprimujem a nahrávam fotku...')

    try {
      const file = await compressImage(rawFile, { maxWidth: 1920, maxHeight: 1920, quality: 0.90 })
      const publicUrl = await api.uploadImage(file)

      if (type === 'rental') {
        setRentalFormData(prev => ({ ...prev, image_url: publicUrl }))
      } else {
        setFormData(prev => ({ ...prev, image_url: publicUrl }))
      }
      toast.success('Fotka úspešne nahratá a skomprimovaná!', { id: uploadToastId })
    } catch (error) {
      console.error('Chyba pri nahrávaní obrázka:', error)
      toast.error(`Nepodarilo sa nahrať fotku: ${error.message || 'Neznáma chyba'}`, { id: uploadToastId })
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = (type = 'product') => {
    if (type === 'rental') {
      setRentalFormData(prev => ({ ...prev, image_url: '' }))
    } else {
      setFormData(prev => ({ ...prev, image_url: '' }))
    }
    toast.success('Fotka bola odstránená.')
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api.categories.create(categoryFormData)
      if (data) {
        setFormData(prev => ({ ...prev, category: data.name || categoryFormData.name }))
        toast.success('Kategória bola úspešne vytvorená!')
      }
      setShowCategoryModal(false)
      await fetchCategories()
      if (view === 'categories') fetchData()
    } catch (err) {
      toast.error('Chyba: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryName) => {
    const paintCategories = ['Farby a laky', 'Farby', 'Laky', 'Riedidlá', 'Maliarske potreby']
    const toolCategories = ['Ručné náradie', 'Elektrické náradie', 'Vrtačky', 'Pomocky', 'Ochranné pomôcky']
    const agriCategories = ['Krmivá', 'Hnojivá', 'Substráty', 'Osivá a semená', 'Postreky', 'Hrable a náradie']
    
    let targetType = formData.type || 'material'
    if (paintCategories.includes(categoryName) || categoryName === 'Farby a laky') targetType = 'paint'
    else if (toolCategories.includes(categoryName)) targetType = 'tool'
    else if (agriCategories.includes(categoryName)) targetType = 'agriculture'
    else if (categories.find(c => c.name === categoryName)?.type) {
      targetType = categories.find(c => c.name === categoryName).type
    }

    setFormData(prev => ({
      ...prev,
      category: categoryName,
      type: targetType
    }))
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const paintCategories = ['Farby a laky', 'Farby', 'Laky', 'Riedidlá', 'Maliarske potreby']
      const toolCategories = ['Ručné náradie', 'Elektrické náradie', 'Vrtačky', 'Pomocky', 'Ochranné pomôcky']
      const agriCategories = ['Krmivá', 'Hnojivá', 'Substráty', 'Osivá a semená', 'Postreky', 'Hrable a náradie']
      
      let inferredType = formData.type || 'material'
      if (paintCategories.includes(formData.category) || formData.category === 'Farby a laky') inferredType = 'paint'
      else if (toolCategories.includes(formData.category)) inferredType = 'tool'
      else if (agriCategories.includes(formData.category)) inferredType = 'agriculture'
      else if (categories.find(c => c.name === formData.category)?.type) {
        inferredType = categories.find(c => c.name === formData.category).type
      }

      const payload = {
        ...formData,
        type: inferredType,
        stock_quantity: Number(formData.stock_quantity || 999)
      }

      if (editingItem) {
        await api.products.update({ ...payload, id: editingItem.id })
        toast.success('Produkt bol úspešne upravený!')
      } else {
        await api.products.create(payload)
        toast.success('Produkt bol úspešne pridaný!')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      console.error('Save product error:', err)
      toast.error('Chyba pri ukladaní: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRental = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingRental) {
        await api.rental.updateItem({ ...rentalFormData, id: editingRental.id })
        toast.success('Položka požičovne bola úspešne upravená!')
      } else {
        await api.rental.createItem(rentalFormData)
        toast.success('Položka požičovne bola úspešne pridaná!')
      }
      setShowRentalModal(false)
      fetchData()
    } catch (err) {
      toast.error('Chyba: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBooking = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!bookingFormData.rental_item_id) {
        throw new Error('Musíte vybrať techniku.')
      }
      if (!bookingFormData.start_date || !bookingFormData.end_date) {
        throw new Error('Musíte vybrať začiatok a koniec rezervácie.')
      }
      if (bookingFormData.start_date > bookingFormData.end_date) {
        throw new Error('Začiatok rezervácie nemôže byť po jej skončení.')
      }

      await api.rental.createBooking({
        rental_item_id: bookingFormData.rental_item_id,
        customer_name: bookingFormData.customer_name,
        customer_email: bookingFormData.customer_email || 'obchod@stavivalubela.sk',
        customer_phone: bookingFormData.customer_phone || 'N/A',
        start_date: bookingFormData.start_date,
        end_date: bookingFormData.end_date,
        notes: `MANUÁLNA REZERVÁCIA (Zadaná z administrácie)\n\n${bookingFormData.note || ''}`,
        status: bookingFormData.status || 'approved'
      })

      toast.success('Rezervácia bola úspešne pridaná!')
      setShowBookingModal(false)
      fetchData()
    } catch (err) {
      toast.error('Chyba: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveShippingConfig = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.settings.update({ shipping_config: JSON.stringify(shippingConfig) })
      toast.success('Cenník dopravy bol úspešne uložený!')
      await refreshSettings()
    } catch (err) {
      toast.error('Chyba pri ukladaní cenníka: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.settings.update(settingsForm)
      toast.success('Systémové nastavenia boli úspešne uložené!')
      await refreshSettings()
    } catch (err) {
      toast.error('Chyba pri ukladaní nastavení: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const getActiveShippingConfig = () => {
    let activeMunicipalities = MUNICIPALITIES
    let activeKmRates = KM_RATES
    let activeFees = ADDITIONAL_FEES

    if (settings?.shipping_config) {
      try {
        const parsed = typeof settings.shipping_config === 'string'
          ? JSON.parse(settings.shipping_config)
          : settings.shipping_config
        
        if (parsed.municipalities) activeMunicipalities = parsed.municipalities
        if (parsed.rates) activeKmRates = parsed.rates
        if (parsed.fees) {
          activeFees = {
            craneUnloadPerPallet: parsed.fees.crane,
            waitTimePerHalfHour: {
              car35: parsed.fees.wait_car35,
              hr8: parsed.fees.wait_hr8
            }
          }
        }
      } catch (e) {
        console.error('Error parsing shipping_config:', e)
      }
    }
    return { activeMunicipalities, activeKmRates, activeFees }
  }

  const getCalcResults = () => {
    const config = getActiveShippingConfig()
    return calculateShopShipping({
      municipalityName: calcMunicipality,
      vehicleType: calcVehicle,
      customDistance: Number(calcDistance),
      craneUnloading: calcVehicle === 'hr8' ? calcCrane : false,
      palletsCount: Number(calcPallets),
      waitTime: calcWait,
      waitHalfHours: Number(calcWaitHalfHours),
      customMunicipalities: config.activeMunicipalities,
      customKmRates: config.activeKmRates,
      customFees: config.activeFees
    })
  }

  const handleViewOrder = async (order) => {
    try {
      const items = Array.isArray(order.items) ? order.items : []
      setSelectedOrder({ ...order, items })
      setShowOrderDetails(true)

      // Initialize calculator defaults
      const config = getActiveShippingConfig()
      const customerCity = order.shipping_info?.city || ''
      const matched = config.activeMunicipalities.find(m => 
        customerCity.toLowerCase().trim().includes(m.name.toLowerCase().trim()) ||
        m.name.toLowerCase().trim().includes(customerCity.toLowerCase().trim())
      )

      if (matched) {
        setCalcMunicipality(matched.name)
        setCalcDistance(0)
      } else {
        setCalcMunicipality('other')
        setCalcDistance(10) // default 10km if not matched
      }
      setCalcVehicle('car35')
      setCalcCrane(false)
      setCalcPallets(1)
      setCalcWait(false)
      setCalcWaitHalfHours(1)
    } catch (error) {
      console.error('Error viewing order:', error.message)
    }
  }

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowInquiryDetails(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Naozaj vymazať?')) return
    try {
      if (view === 'products') {
        await api.products.delete(id)
      } else if (view === 'categories') {
        await api.categories.delete(id)
      } else if (view === 'rentals') {
        await api.rental.deleteItem(id)
      } else if (view === 'inquiries') {
        await api.inquiries.delete(id)
      } else if (view === 'orders') {
        await api.orders.delete(id)
      } else if (view === 'bookings') {
        await api.rental.deleteBooking(id)
      }
      toast.success('Položka bola úspešne vymazaná.')
      fetchData()
    } catch (error) {
      toast.error('Chyba pri mazaní: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleUpdateBookingStatus = async (id, status) => {
    setLoading(true)
    try {
      await api.rental.updateBookingStatus(id, status)
      toast.success(status === 'approved' ? 'Rezervácia bola schválená!' : 'Rezervácia bola zamietnutá.')
      fetchData()
    } catch (err) {
      toast.error('Chyba: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleImportFromUrl = async (url) => {
    setLoading(true)
    try {
      // Use a CORS proxy to fetch the page content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      
      // Extract data using Meta tags (most common)
      const title = doc.querySelector('meta[property="og:title"]')?.content || doc.title
      const description = doc.querySelector('meta[property="og:description"]')?.content || ''
      const image = doc.querySelector('meta[property="og:image"]')?.content || ''
      
      // Site specific extraction (Example for common patterns)
      let price = 0
      const priceText = doc.body.innerText.match(/(\d+[,.]\d+)\s*€/)
      if (priceText) price = parseFloat(priceText[1].replace(',', '.'))

      setFormData({
        ...formData,
        name: title.split('|')[0].trim(),
        description: description,
        image_url: image,
        price: price,
        category: view === 'products' ? formData.category : ''
      })
      
      setShowModal(true)
    } catch (err) {
      alert('Nepodarilo sa načítať dáta automaticky. Skúste manuálne zadanie alebo iný link.')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter(item => {
    if (!item) return false;
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return true;
    if (view === 'orders') {
      const name = (item.customer_name || `${item.shipping_info?.firstName || ''} ${item.shipping_info?.lastName || ''}` || item.name || '').toLowerCase();
      const email = (item.customer_email || item.shipping_info?.email || item.email || '').toLowerCase();
      const phone = (item.customer_phone || item.shipping_info?.phone || item.phone || '').toLowerCase();
      const id = String(item.id || '').toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower) || id.includes(searchLower);
    }
    if (view === 'bookings') {
      return (item.customer_name || '').toLowerCase().includes(searchLower) || 
             (item.rental_items?.name || '').toLowerCase().includes(searchLower);
    }
    return (item.name || item.customer_name || String(item.id || '')).toLowerCase().includes(searchLower);
  });

  if (!session) return <LoginComponent />

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Top Bar (Enterprise Header) */}
      <header className="sticky top-0 z-50 bg-[#18181b] text-white border-b border-zinc-800 shadow-md">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: Brand & Sidebar Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title={isSidebarCollapsed ? "Rozbaliť menu" : "Zbaliť menu"}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-3">
              <span className="font-black text-lg sm:text-xl tracking-tight uppercase text-white flex items-center gap-2">
                <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full inline-block animate-pulse"></span>
                STAVEBNINY ĽUBEĽA
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                PRO PORTÁL
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Global Cmd+K Search trigger */}
            <div className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 rounded-lg text-xs text-zinc-400 cursor-pointer hover:border-zinc-500 transition-colors w-64">
                <Search size={14} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Hľadať v portáli..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-zinc-500"
                />
                <kbd className="bg-zinc-800 text-[10px] text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">⌘K</kbd>
              </div>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative"
                title="Notifikácie"
              >
                <Bell size={18} />
                {(stats.inquiries + stats.orders) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#18181b]"></span>
                )}
              </button>

              {/* Notifications Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl p-4 text-xs text-zinc-300 z-50">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">Notifikácie & Správy</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {stats.inquiries + stats.orders} nové
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div 
                      onClick={() => { setView('orders'); setShowNotifications(false); }}
                      className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors border border-zinc-800 flex items-start gap-2.5"
                    >
                      <Truck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-xs">Dopyty z katalógu ({stats.orders})</p>
                        <p className="text-[10px] text-zinc-400">Kliknite pre zobrazenie dopytov materiálov</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => { setView('inquiries'); setShowNotifications(false); }}
                      className="p-2.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors border border-zinc-800 flex items-start gap-2.5"
                    >
                      <MessageSquare size={16} className="text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white text-xs">Správy z webu ({stats.inquiries})</p>
                        <p className="text-[10px] text-zinc-400">Nové formuláre a poradenstvo z /kontakt</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800/80"
              >
                <div className="w-7 h-7 bg-emerald-500 text-zinc-950 font-black rounded-full flex items-center justify-center text-xs">
                  K
                </div>
                <span className="text-xs font-bold text-zinc-200 hidden md:inline-block">kubik@stavivalubela.sk</span>
                <ChevronRight size={14} className={cn("text-zinc-400 transition-transform", showProfileMenu && "rotate-90")} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl py-2 text-xs z-50">
                  <div className="px-4 py-2.5 border-b border-zinc-800">
                    <p className="font-bold text-white">Stavebniny Ľubeľa Admin</p>
                    <p className="text-[10px] text-zinc-400 truncate">kubik@stavivalubela.sk</p>
                  </div>
                  <button
                    onClick={() => { setView('settings'); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                  >
                    <Settings size={14} /> Nastavenia webu
                  </button>
                  <a
                    href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                  >
                    <Mail size={14} /> Roundcube Webmail
                  </a>
                  <div className="my-1 border-t border-zinc-800" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 font-bold"
                  >
                    <LogOut size={14} /> Odhlásiť sa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Modular Collapsible Sidebar */}
        <aside className={cn(
          "bg-[#18181b] text-zinc-300 border-r border-zinc-800 min-h-[calc(100vh-57px)] transition-all duration-300 z-40 shrink-0 flex flex-col justify-between",
          isSidebarCollapsed ? "w-16" : "w-64",
          isSidebarOpen ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl" : "hidden md:flex"
        )}>
          <div className="p-3 space-y-6">
            {/* Section 1 */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  HLAVNÝ PREHĽAD
                </div>
              )}
              <NavItem 
                icon={<LayoutDashboard size={18}/>} 
                label="Prehľad" 
                collapsed={isSidebarCollapsed}
                active={view === 'dashboard'} 
                onClick={() => changeView('dashboard')} 
              />
            </div>

            {/* Section 2 */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  SPRÁVA OBSAHU & SKLADU
                </div>
              )}
              <div className="space-y-1">
                <NavItem icon={<Package size={18}/>} label="Produkty & Sklad" collapsed={isSidebarCollapsed} active={view === 'products'} onClick={() => changeView('products')} />
                <NavItem icon={<Sliders size={18}/>} label="Kategórie" collapsed={isSidebarCollapsed} active={view === 'categories'} onClick={() => changeView('categories')} />
                <NavItem icon={<Truck size={18}/>} label="Dopyty z katalógu" collapsed={isSidebarCollapsed} active={view === 'orders'} onClick={() => changeView('orders')} badge={stats.orders} />
                <NavItem icon={<MessageSquare size={18}/>} label="Správy z webu" collapsed={isSidebarCollapsed} active={view === 'inquiries'} onClick={() => changeView('inquiries')} badge={stats.inquiries} dangerBadge={stats.inquiries > 0} />
              </div>
            </div>

            {/* Section 3 */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  POŽIČOVŇA NÁRADIA
                </div>
              )}
              <div className="space-y-1">
                <NavItem icon={<Calendar size={18}/>} label="Rezervácie techniky" collapsed={isSidebarCollapsed} active={view === 'bookings'} onClick={() => changeView('bookings')} />
                <NavItem icon={<Wrench size={18}/>} label="Technika v požičovni" collapsed={isSidebarCollapsed} active={view === 'rentals'} onClick={() => changeView('rentals')} />
              </div>
            </div>

            {/* Section 4 */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  KONFIGURÁCIA
                </div>
              )}
              <div className="space-y-1">
                <NavItem icon={<Truck size={18}/>} label="Cenník Dopravy" collapsed={isSidebarCollapsed} active={view === 'shipping'} onClick={() => changeView('shipping')} />
                <NavItem icon={<Settings size={18}/>} label="Systémové Nastavenia" collapsed={isSidebarCollapsed} active={view === 'settings'} onClick={() => changeView('settings')} />
              </div>
            </div>
          </div>

          {/* Sidebar Footer collapse button */}
          <div className="p-3 border-t border-zinc-800">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors text-xs gap-2"
            >
              <ChevronRight size={16} className={cn("transition-transform", !isSidebarCollapsed && "rotate-180")} />
              {!isSidebarCollapsed && <span className="font-medium text-xs">Zbaliť menu</span>}
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-x-hidden">
          {/* Header Action Bar */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 capitalize">
                {view === 'products' ? 'Správa Inventára & Skladu' : 
                 view === 'orders' ? 'Dopyty z katalógu' : 
                 view === 'rentals' ? 'Správa Požičovne' :
                 view === 'shipping' ? 'Cenník Dopravy' :
                 view === 'categories' ? 'Kategórie Produktov' :
                 view === 'bookings' ? 'Rezervácie Techniky' :
                 view === 'inquiries' ? 'Správy z webu' :
                 view === 'settings' ? 'Systémové Nastavenia Web' :
                 view === 'dashboard' ? 'Prehľad' : view}
              </h1>
              {view === 'dashboard' && (
                <p className="text-xs text-zinc-500 mt-1 font-medium">Dnešné kľúčové metriky a správa pre firmu Stavebniny Ľubeľa s.r.o.</p>
              )}
            </div>

            {view === 'products' && (
              <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto items-center">
                <button 
                  onClick={() => {
                    const url = prompt('Vložte URL produktu (napr. z OBI):')
                    if (url) handleImportFromUrl(url)
                  }}
                  className="flex-1 sm:flex-none justify-center bg-white border border-zinc-200 text-zinc-800 px-4 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all rounded-lg shadow-2xs"
                  disabled={loading}
                >
                  <PlusCircle size={16} /> {loading ? 'Spracúvam...' : 'Import z URL'}
                </button>
                <button 
                  onClick={() => { setEditingItem(null); setFormData({name:'', description:'', price:0, sku:'', stock_quantity:0, category:'', image_url:'', type: 'material', unit: 'ks'}); setShowModal(true); }}
                  className="flex-1 sm:flex-none justify-center bg-zinc-900 text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all rounded-lg shadow-sm"
                >
                  <Plus size={16} /> Pridať produkt
                </button>
              </div>
            )}
            {view === 'rentals' && (
              <button 
                onClick={() => {
                  setEditingRental(null);
                  setRentalFormData({
                    name: '',
                    category: 'Vibračná a hutniaca technika',
                    price4h: 0,
                    price24h: 0,
                    deposit: 100,
                    description: '',
                    note: '',
                    image_url: '',
                    accessories: [],
                    availability: true,
                    quantity: 1
                  });
                  setShowRentalModal(true);
                }}
                className="w-full sm:w-auto justify-center bg-zinc-900 text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all rounded-lg shadow-sm"
              >
                <Plus size={16} /> Pridať techniku
              </button>
            )}
            {view === 'bookings' && (
              <button 
                onClick={() => {
                  setBookingFormData({
                    rental_item_id: rentalItemsList[0]?.id || '',
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0],
                    start_time: '08:00',
                    end_time: '16:00',
                    status: 'approved',
                    note: ''
                  });
                  setShowBookingModal(true);
                }}
                className="w-full sm:w-auto justify-center bg-zinc-900 text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all rounded-lg shadow-sm"
              >
                <Plus size={16} /> Pridať rezerváciu
              </button>
            )}
            {view === 'categories' && (
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="w-full sm:w-auto justify-center bg-zinc-900 text-white px-5 py-2.5 font-bold uppercase text-xs flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all rounded-lg shadow-sm"
              >
                <Plus size={16} /> Nová kategória
              </button>
            )}
          </header>

          {view === 'dashboard' && <DashboardStats stats={stats} changeView={changeView} />}
          
          {view !== 'dashboard' && view !== 'shipping' && view !== 'settings' && (
            <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-100 flex gap-4">
                 <div className="relative flex-1">
                   <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input 
                     placeholder="Hľadať..." 
                     className="pl-10 pr-4 py-2 bg-zinc-50 text-sm w-full border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-xs font-bold uppercase rounded-lg hover:bg-zinc-50"><Filter size={14}/> Filtre</button>
              </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f0eded]">
                  {view === 'products' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Položka</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Kategória</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                    </tr>
                  )}
                  {view === 'categories' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Názov kategórie</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Typ kategórie</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Dátum vytvorenia</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                    </tr>
                  )}
                  {view === 'orders' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Zákazník</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Kontaktné údaje</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Stav / Akcie</th>
                    </tr>
                  )}
                  {view === 'inquiries' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Odosielateľ</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Kontakt</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Správa / Otázka</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                    </tr>
                  )}
                  {view === 'bookings' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Zákazník</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Kontakt</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Prenajatá technika</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Obdobie prenájmu</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Stav</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                    </tr>
                  )}
                  {view === 'rentals' && (
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Technika</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Kategória</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Ceny (4h / 24h)</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline">Záloha</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-outline text-right">Akcie</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {loading ? (
                    <tr><td colSpan={view === 'bookings' ? 6 : view === 'rentals' ? 5 : 4} className="p-20 text-center font-bold text-outline animate-pulse">NAČÍTAVAM...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={view === 'bookings' ? 6 : view === 'rentals' ? 5 : 4} className="p-12 text-center text-outline text-xs uppercase font-bold">
                        Žiadne výsledky sa nenašli
                        {view === 'bookings' && (
                          <p className="text-[10px] text-amber-600 mt-2 normal-case font-medium">
                            Tip: Ak sa zoznam rezervácií nezobrazuje, uistite sa, že ste v Supabase spustili SQL skript "rental_setup.sql".
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-surface transition-colors group">
                      {/* Products View */}
                      {view === 'products' && (
                        <>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {item.image_url && <img src={item.image_url} className="w-10 h-10 object-cover bg-surface" />}
                              <div>
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-[10px] text-outline font-mono uppercase">{item.sku || 'Bez SKU'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] bg-surface-container px-2 py-1 uppercase font-bold text-outline">{item.category || 'Materiál'}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }}
                                className="p-2 hover:bg-primary/20 text-on-surface transition-colors"
                              ><Edit size={16}/></button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-error/10 text-error transition-colors"
                              ><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Categories View */}
                      {view === 'categories' && (
                        <>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">{item.name}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] bg-surface-container px-2 py-1 uppercase font-bold text-outline">
                              {item.type === 'material' ? 'Materiál' : item.type === 'tool' ? 'Náradie' : 'Požičovňa'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-outline font-mono">
                            {new Date(item.created_at).toLocaleDateString('sk-SK')}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-error/10 text-error transition-colors"
                              ><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Orders View */}
                      {view === 'orders' && (
                        <>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">
                              {item.customer_name || `${item.shipping_info?.firstName || ''} ${item.shipping_info?.lastName || ''}`.trim() || 'Zákazník'}
                            </p>
                            <p className="text-[10px] text-outline font-mono">Dopyt #{item.id ? item.id.slice(0,8) : ''}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <p className="font-medium">{item.customer_phone || item.shipping_info?.phone || ''}</p>
                            <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold block mt-0.5">
                              {item.customer_email || item.shipping_info?.email || ''}
                            </a>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 items-center">
                              <span className="text-[10px] bg-primary/20 text-[#546200] px-2 py-1 uppercase font-bold">{item.status || 'Prijatá'}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                  href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-primary/20 text-primary-strong transition-colors"
                                  title="Odpovedať v Roundcube Webmaile"
                                ><Mail size={16}/></a>
                                <button 
                                  onClick={() => handleViewOrder(item)}
                                  className="p-2 hover:bg-primary/20 text-on-surface transition-colors"
                                  title="Zobraziť detaily"
                                ><Eye size={16}/></button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 hover:bg-error/10 text-error transition-colors"
                                ><Trash2 size={16}/></button>
                              </div>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Inquiries View */}
                      {view === 'inquiries' && (
                        <>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">{item.customer_name || item.name || 'Zákazník'}</p>
                            <p className="text-[10px] text-outline font-mono">{new Date(item.created_at).toLocaleString('sk-SK')}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold block">
                              {item.customer_email || item.email || ''}
                            </a>
                            {item.customer_phone && <p className="text-outline text-[11px] mt-0.5">{item.customer_phone}</p>}
                          </td>
                          <td className="px-6 py-5 text-xs text-on-surface-variant font-medium whitespace-pre-wrap max-w-sm">
                            {item.details || item.message}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-primary/20 text-primary-strong transition-colors"
                                title="Odpovedať v Roundcube Webmaile"
                              ><Mail size={16}/></a>
                              <button 
                                onClick={() => handleViewInquiry(item)}
                                className="p-2 hover:bg-primary/20 text-on-surface transition-colors"
                                title="Zobraziť správu"
                              ><Eye size={16}/></button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-error/10 text-error transition-colors"
                              ><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Bookings View */}
                      {view === 'bookings' && (
                        <>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm">{item.customer_name}</p>
                            <p className="text-[10px] text-outline font-mono mt-0.5">Vytvorené: {new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <p className="font-medium">{item.customer_phone}</p>
                            <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold block mt-0.5">{item.customer_email}</a>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-sm text-primary-strong">{item.rental_items?.name || 'Neznáma technika'}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <p className="font-bold text-sm">
                              {new Date(item.start_date).toLocaleDateString('sk-SK')} {item.start_time ? `o ${item.start_time}` : ''} - {new Date(item.end_date).toLocaleDateString('sk-SK')} {item.end_time ? `o ${item.end_time}` : ''}
                            </p>
                            {item.delivery_method === 'delivery' && (
                              <p className="text-[10px] text-primary-strong font-black uppercase mt-1">
                                Dovoz: {item.delivery_municipality} (+{Number(item.delivery_price || 0).toFixed(2)} €)
                              </p>
                            )}
                            {item.note && <p className="text-[10px] italic text-outline mt-1.5 font-medium whitespace-pre-wrap max-w-[200px]">Poznámka: {item.note}</p>}
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "text-[10px] px-2 py-1 uppercase font-black tracking-wider",
                              item.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                              item.status === 'rejected' ? "bg-error/10 text-error" : "bg-amber-100 text-amber-700"
                            )}>
                              {item.status === 'approved' ? 'Schválená' :
                               item.status === 'rejected' ? 'Zamietnutá' : 'Čaká'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <a 
                                href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary/10 text-primary-strong px-3 py-1.5 text-[9px] font-black uppercase tracking-wider hover:bg-primary/20 transition-colors flex items-center gap-1"
                                title="Odpovedať v Roundcube Webmaile"
                              ><Mail size={12}/> Odpovedať</a>
                              {item.status !== 'approved' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(item.id, 'approved')}
                                  className="bg-emerald-600 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                                >Schváliť</button>
                              )}
                              {item.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleUpdateBookingStatus(item.id, 'rejected')}
                                  className="bg-amber-600 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider hover:bg-amber-700 transition-colors"
                                >Zamietnuť</button>
                              )}
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-error hover:bg-error/10 p-1.5 transition-colors"
                              ><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Rentals View */}
                      {view === 'rentals' && (
                        <>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {(item.image_url || item.imageUrl) && (
                                <img src={item.image_url || item.imageUrl} className="w-10 h-10 object-cover bg-surface" />
                              )}
                              <div>
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-[10px] text-outline font-mono truncate max-w-[200px]">
                                  {item.description ? item.description.slice(0, 50) + '...' : 'Bez popisu'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] bg-surface-container px-2 py-1 uppercase font-bold text-outline">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">4h: {Number(item.price4h || 0).toFixed(2)} €</span>
                              <span className="font-black text-sm text-primary-strong">24h: {Number(item.price24h || 0).toFixed(2)} €</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-xs text-outline">{Number(item.deposit || 0).toFixed(2)} €</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingRental(item);
                                  setRentalFormData({
                                    name: item.name || '',
                                    category: item.category || 'Vibračná a hutniaca technika',
                                    price4h: item.price4h || 0,
                                    price24h: item.price24h || 0,
                                    deposit: item.deposit || 100,
                                    description: item.description || '',
                                    note: item.note || '',
                                    image_url: item.image_url || item.imageUrl || '',
                                    accessories: Array.isArray(item.accessories) ? item.accessories : [],
                                    availability: item.availability !== false,
                                    quantity: item.quantity || 1
                                  });
                                  setShowRentalModal(true);
                                }}
                                className="p-2 hover:bg-primary/20 text-on-surface transition-colors"
                              ><Edit size={16}/></button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-error/10 text-error transition-colors"
                              ><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-outline/10 bg-white">
              {loading ? (
                <div className="p-20 text-center font-bold text-outline animate-pulse">NAČÍTAVAM...</div>
              ) : filteredData.length === 0 ? (
                <div className="p-12 text-center text-outline text-xs uppercase font-bold">
                  Žiadne výsledky sa nenašli
                  {view === 'bookings' && (
                    <p className="text-[10px] text-amber-600 mt-2 normal-case font-medium">
                      Tip: Uistite sa, že ste v Supabase spustili skript "rental_setup.sql".
                    </p>
                  )}
                </div>
              ) : (
                filteredData.map((item) => (
                  <div key={item.id} className="p-5 space-y-4 hover:bg-surface transition-colors">
                    {/* Bookings mobile card */}
                    {view === 'bookings' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base text-on-surface leading-tight">{item.customer_name}</p>
                            <p className="text-[10px] text-outline font-mono mt-0.5">Rezervácia vytvorená: {new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 uppercase font-black tracking-wider shrink-0",
                            item.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                            item.status === 'rejected' ? "bg-error/10 text-error" : "bg-amber-100 text-amber-700"
                          )}>
                            {item.status === 'approved' ? 'Schválená' :
                             item.status === 'rejected' ? 'Zamietnutá' : 'Čaká'}
                          </span>
                        </div>

                        <div className="bg-surface p-3 text-xs border border-outline/5 space-y-2">
                          <p className="font-bold text-primary-strong text-sm">{item.rental_items?.name || 'Neznáma technika'}</p>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider">
                            Obdobie: {new Date(item.start_date).toLocaleDateString('sk-SK')} {item.start_time ? `o ${item.start_time}` : ''} - {new Date(item.end_date).toLocaleDateString('sk-SK')} {item.end_time ? `o ${item.end_time}` : ''}
                          </p>
                          {item.delivery_method === 'delivery' && (
                             <p className="text-[10px] font-bold text-primary-strong uppercase tracking-wider">
                               Dovoz: {item.delivery_address || ''}, {item.delivery_city || ''} ({item.delivery_municipality || ''}) (+{Number(item.delivery_price || 0).toFixed(2)} €)
                             </p>
                           )}
                          <div className="pt-1 border-t border-outline/5 space-y-0.5">
                            <p><strong>Tel:</strong> <a href={`tel:${item.customer_phone}`} className="text-primary hover:underline font-bold">{item.customer_phone}</a></p>
                            <p><strong>E-mail:</strong> <a href={`mailto:${item.customer_email}`} className="text-primary-strong hover:underline font-bold">{item.customer_email}</a></p>
                          </div>
                          {item.note && <p className="text-[10px] italic text-outline mt-1 font-medium whitespace-pre-wrap">Poznámka: {item.note}</p>}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <a 
                            href={`mailto:${item.customer_email}?subject=Odpoveď na rezerváciu: ${item.rental_items?.name || 'Technika'}`}
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform text-center"
                          ><Mail size={16}/> Odpovedať</a>
                          {item.status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateBookingStatus(item.id, 'approved')}
                              className="flex-1 bg-emerald-600 text-white py-3 font-bold uppercase text-xs active:scale-95 transition-transform"
                            >Schváliť</button>
                          )}
                          {item.status !== 'rejected' && (
                            <button 
                              onClick={() => handleUpdateBookingStatus(item.id, 'rejected')}
                              className="flex-1 bg-amber-600 text-white py-3 font-bold uppercase text-xs active:scale-95 transition-transform"
                            >Zamietnuť</button>
                          )}
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="bg-error/10 text-error p-3 font-bold uppercase text-xs active:scale-95 transition-transform"
                          ><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )}

                    {/* Rentals mobile card */}
                    {view === 'rentals' && (
                      <>
                        <div className="flex items-start gap-4">
                          {(item.image_url || item.imageUrl) && (
                            <img src={item.image_url || item.imageUrl} className="w-16 h-16 object-cover border border-outline/10 bg-surface shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base text-on-surface leading-tight break-words">{item.name}</p>
                            <span className="inline-block text-[9px] bg-surface-container px-2 py-0.5 font-black text-outline uppercase mt-1">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block font-black text-sm text-primary-strong">24h: {Number(item.price24h || 0).toFixed(2)} €</span>
                            <span className="block text-xs text-outline mt-0.5">4h: {Number(item.price4h || 0).toFixed(2)} €</span>
                          </div>
                        </div>
                        <div className="bg-surface p-3 text-[10px] font-semibold space-y-1">
                          <p><strong className="uppercase text-outline text-[9px]">Záloha:</strong> {Number(item.deposit || 0).toFixed(2)} €</p>
                          {item.accessories?.length > 0 && (
                            <p><strong className="uppercase text-outline text-[9px]">Príslušenstvo:</strong> {item.accessories.length} ks</p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => {
                              setEditingRental(item);
                              setRentalFormData({
                                name: item.name || '',
                                category: item.category || 'Vibračná a hutniaca technika',
                                price4h: item.price4h || 0,
                                price24h: item.price24h || 0,
                                deposit: item.deposit || 100,
                                description: item.description || '',
                                note: item.note || '',
                                image_url: item.image_url || item.imageUrl || '',
                                accessories: Array.isArray(item.accessories) ? item.accessories : [],
                                availability: item.availability !== false,
                                quantity: item.quantity || 1
                              });
                              setShowRentalModal(true);
                            }}
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Edit size={16}/> Upraviť</button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 bg-error/10 text-error py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Trash2 size={16}/> Odstrániť</button>
                        </div>
                      </>
                    )}

                    {/* Products mobile card */}
                    {view === 'products' && (
                      <>
                        <div className="flex items-start gap-4">
                          {item.image_url && (
                            <img src={item.image_url} className="w-16 h-16 object-cover border border-outline/10 bg-surface shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base text-on-surface leading-tight break-words">{item.name}</p>
                            <p className="text-[10px] text-outline font-mono uppercase mt-1">{item.sku || 'Bez SKU'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block font-black text-base text-on-surface">{Number(item.price || 0).toFixed(2)} € / {item.unit || 'ks'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-surface p-3 text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-outline">Kategória:</span>
                          <span className="bg-surface-container px-2 py-0.5 font-black text-outline">{item.category || 'Materiál'}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }}
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Edit size={16}/> Upraviť</button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="bg-error/10 text-error py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Trash2 size={16}/> Odstrániť</button>
                        </div>
                      </>
                    )}

                    {/* Categories mobile card */}
                    {view === 'categories' && (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base text-on-surface leading-tight">{item.name}</p>
                            <p className="text-[10px] text-outline font-mono mt-1">Vytvorené: {new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                          </div>
                          <span className="text-[9px] bg-surface-container px-2 py-1 uppercase font-black tracking-wider text-outline shrink-0">
                            {item.type === 'material' ? 'Materiál' : item.type === 'tool' ? 'Náradie' : 'Požičovňa'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-outline/5">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-full bg-error/10 text-error py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Trash2 size={16}/> Odstrániť</button>
                        </div>
                      </>
                    )}

                    {/* Orders mobile card */}
                    {view === 'orders' && (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base text-on-surface leading-tight">
                              {item.customer_name || `${item.shipping_info?.firstName || ''} ${item.shipping_info?.lastName || ''}`.trim() || 'Zákazník'}
                            </p>
                            <p className="text-[10px] text-outline font-mono mt-1">Dopyt #{item.id ? item.id.slice(0,8) : ''}</p>
                          </div>
                          <span className="text-[9px] bg-primary/20 text-[#546200] px-2 py-1 uppercase font-black tracking-wider shrink-0">
                            {item.status || 'Prijatá'}
                          </span>
                        </div>
                        <div className="bg-surface p-3 text-xs border border-outline/5 space-y-1">
                          <p><strong>Tel:</strong> <a href={`tel:${item.customer_phone || item.shipping_info?.phone || ''}`} className="text-primary hover:underline font-bold">{item.customer_phone || item.shipping_info?.phone || '-'}</a></p>
                          <p><strong>E-mail:</strong> <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold">{item.customer_email || item.shipping_info?.email || '-'}</a></p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <a 
                            href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform text-center"
                          ><Mail size={16}/> Odpovedať</a>
                          <button 
                            onClick={() => handleViewOrder(item)}
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Eye size={16}/> Detaily</button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 bg-error/10 text-error py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Trash2 size={16}/> Odstrániť</button>
                        </div>
                      </>
                    )}

                    {/* Inquiries mobile card */}
                    {view === 'inquiries' && (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base text-on-surface leading-tight">{item.customer_name || item.name || 'Zákazník'}</p>
                            <p className="text-[10px] text-outline font-mono mt-1">{new Date(item.created_at).toLocaleString('sk-SK')}</p>
                          </div>
                          <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-[9px] bg-primary/10 text-primary-strong px-2 py-1 uppercase font-black tracking-wider shrink-0 hover:underline">
                            E-mail
                          </a>
                        </div>
                        <div className="bg-surface p-3 text-xs border border-outline/5 space-y-2 whitespace-pre-wrap font-medium">
                          {item.details || item.message}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <a 
                            href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform text-center"
                          ><Mail size={16}/> Odpovedať</a>
                          <button 
                            onClick={() => handleViewInquiry(item)}
                            className="flex-1 bg-surface border border-outline/25 text-on-surface py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform text-center"
                          ><Eye size={16}/> Zobraziť</button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 bg-error/10 text-error py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          ><Trash2 size={16}/> Odstrániť</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm overflow-hidden">
            <div className="bg-white w-full max-w-xl p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors z-10 bg-white rounded-full p-1 shadow-sm border border-outline/10"
              ><X size={24}/></button>
              
              <div className="overflow-y-auto pr-2 -mr-2">
              
              <h2 className="text-3xl font-black tracking-tight mb-8">
                {editingItem ? 'Upraviť produkt' : 'Nový produkt'}
              </h2>
              
              <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Názov produktu</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">SKU Kód</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Typ produktu</label>
                  <select 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value, category: ''})}
                  >
                    <option value="material">Materiál (Stavba)</option>
                    <option value="tool">Náradie (Nástroje)</option>
                    <option value="paint">Farby a laky</option>
                    <option value="agriculture">Poľnohospodársky produkt</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Kategória</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                      value={formData.category}
                      onChange={e => handleCategorySelect(e.target.value)}
                      required
                    >
                      <option value="">Vyberte kategóriu</option>
                      <optgroup label="Materiál & Stavba">
                        {categories.filter(c => !c.type || c.type === 'material').map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Náradie & Nástroje">
                        {categories.filter(c => c.type === 'tool').map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Farby & Laky">
                        {categories.filter(c => c.type === 'paint' || c.name === 'Farby a laky').map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Poľnohospodárstvo & Záhrada">
                        {categories.filter(c => c.type === 'agriculture').map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    <button 
                      type="button"
                      onClick={() => {
                        setCategoryFormData({ name: '', type: formData.type || 'material' });
                        setShowCategoryModal(true);
                      }}
                      className="bg-surface px-4 text-primary hover:bg-primary hover:text-on-primary transition-colors rounded-md"
                      title="Pridať novú kategóriu"
                    ><Plus size={18}/></button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Jednotka predaja</label>
                  <select 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                    value={formData.unit || 'ks'}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    required
                  >
                    <option value="ks">ks (kus)</option>
                    <option value="balenie">balenie (balenie)</option>
                    <option value="kg">kg (kilogram)</option>
                    <option value="m²">m² (štvorcový meter)</option>
                    <option value="100 ks">100 ks (balenie 100 ks)</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Popis produktu</label>
                  <textarea 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary min-h-[100px] resize-none text-sm font-medium"
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Napíšte krátky popis, technické parametre alebo informácie o výrobku..."
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-outline block">Obrázok produktu</label>
                  
                  {formData.image_url ? (
                    <div className="relative border border-outline/10 p-4 bg-surface flex flex-col sm:flex-row items-center gap-4">
                      <img 
                        src={formData.image_url} 
                        alt="Náhľad produktu" 
                        className="w-24 h-24 object-cover border border-outline/10 bg-white"
                      />
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <p className="text-xs text-outline font-mono truncate max-w-xs sm:max-w-md">
                          {formData.image_url}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <label className="bg-white border border-outline/20 text-on-surface px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-surface-container-low transition-colors flex items-center gap-1.5">
                            <Upload size={12} /> Zmeniť fotku
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageUpload} 
                              disabled={imageUploading}
                            />
                          </label>
                          <button 
                            type="button"
                            onClick={handleRemoveImage}
                            className="bg-error/10 text-error px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-error/20 transition-colors"
                          >
                            Odstrániť
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className={cn(
                      "border-2 border-dashed border-outline/20 p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center",
                      imageUploading && "pointer-events-none opacity-60"
                    )}>
                      {imageUploading ? (
                        <>
                          <Loader2 size={32} className="text-primary animate-spin" />
                          <span className="text-xs font-bold uppercase text-outline font-sans">Nahrávam fotku na server...</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-surface p-4 rounded-full text-outline/60">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-bold uppercase text-on-surface font-sans">Kliknite pre výber fotky</span>
                          <span className="text-[10px] text-outline font-sans">PNG, JPG, WEBP (max. 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                        disabled={imageUploading}
                      />
                    </label>
                  )}
                </div>
                <div className="col-span-2 pt-4">
                  <button 
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest hover:bg-[#daf900] disabled:opacity-50"
                  >
                    {loading ? 'UKLADÁM...' : 'ULOŽIŤ PRODUKT'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#2d2f2b]/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh]">
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
              ><X size={24}/></button>
              
              <div className="p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Dopyt #{selectedOrder.id.slice(0,8)}</h2>
                    <p className="text-sm text-outline font-medium uppercase tracking-widest">
                      {new Date(selectedOrder.created_at).toLocaleString('sk-SK')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-outline uppercase mb-1">Stav dopytu</span>
                    <span className="bg-primary/20 text-[#546200] px-3 py-1 uppercase font-black text-xs tracking-wider">
                      {selectedOrder.status || 'PRIJATÁ'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10 border-y border-outline/5 py-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-3 tracking-widest">Zákazník</h4>
                    <p className="font-bold text-lg">
                      {selectedOrder.customer_name || `${selectedOrder.shipping_info?.firstName || ''} ${selectedOrder.shipping_info?.lastName || ''}`.trim() || 'Neznámy zákazník'}
                    </p>
                    <p className="text-on-surface-variant font-medium">
                      <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold">
                        {selectedOrder.customer_email || selectedOrder.shipping_info?.email || 'Nezadaný e-mail'}
                      </a>
                    </p>
                    <p className="text-on-surface-variant font-medium">
                      <a href={`tel:${selectedOrder.customer_phone || selectedOrder.shipping_info?.phone || ''}`} className="text-on-surface hover:text-primary transition-colors font-bold">
                        {selectedOrder.customer_phone || selectedOrder.shipping_info?.phone || 'Nezadaný telefón'}
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-3 tracking-widest">Doručovacia adresa & Spôsob dopravy</h4>
                    <p className="text-on-surface-variant font-bold text-sm mb-1">
                      {selectedOrder.delivery_method === 'pickup' && 'Osobný odber na predajni (Ľubeľa)'}
                      {selectedOrder.delivery_method === 'delivery' && 'Dovoz na stavbu (Nákladné auto / HR)'}
                      {selectedOrder.delivery_method === 'own_transport' && 'Vlastná doprava zákazníka'}
                      {(!selectedOrder.delivery_method || selectedOrder.delivery_method === 'inquiry') && 'Špecifikované v dopyte'}
                    </p>
                    <p className="text-on-surface-variant whitespace-pre-wrap">
                      {selectedOrder.delivery_address || selectedOrder.shipping_info?.address || ''}{'\n'}
                      {selectedOrder.delivery_zip || selectedOrder.shipping_info?.zip || ''} {selectedOrder.delivery_city || selectedOrder.shipping_info?.city || ''}
                    </p>
                    {(selectedOrder.note || selectedOrder.shipping_info?.message) && (
                      <div className="mt-3 bg-surface p-3 border-l-2 border-primary text-xs whitespace-pre-wrap font-medium">
                        <strong>Poznámka / Dopyt:</strong>{'\n'}{selectedOrder.note || selectedOrder.shipping_info?.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Calculator for Admin */}
                <div className="mb-10 bg-surface p-6 border-l-4 border-primary shadow-sm animate-in fade-in duration-300">
                  <h4 className="text-[10px] font-black tracking-wider text-outline uppercase mb-4">
                    Kalkulačka dopravy (Nacenenie dopravy)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-outline uppercase block mb-1">Typ vozidla</label>
                        <select 
                          className="w-full p-2 bg-white border border-outline/25 font-bold"
                          value={calcVehicle}
                          onChange={e => setCalcVehicle(e.target.value)}
                        >
                          <option value="car35">Dodávka do 3.5t</option>
                          <option value="hr8">Auto s hydraulickou rukou (HR 8t)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-outline uppercase block mb-1">Obec doručenia</label>
                        <select 
                          className="w-full p-2 bg-white border border-outline/25 font-bold"
                          value={calcMunicipality}
                          onChange={e => setCalcMunicipality(e.target.value)}
                        >
                          {getActiveShippingConfig().activeMunicipalities.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                          <option value="other">Iná obec (podľa km)</option>
                        </select>
                      </div>

                      {calcMunicipality === 'other' && (
                        <div>
                          <label className="text-[9px] font-bold text-outline uppercase block mb-1">Vzdialenosť (km tam aj späť)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-outline/25 font-bold text-center"
                            value={calcDistance}
                            onChange={e => setCalcDistance(parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                      )}

                      {calcVehicle === 'hr8' && (
                        <div className="space-y-2 border-t border-outline/5 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                            <input 
                              type="checkbox"
                              checked={calcCrane}
                              onChange={e => setCalcCrane(e.target.checked)}
                              className="w-4 h-4 text-primary rounded-none focus:ring-0"
                            />
                            Vykládka hydraulickou rukou
                          </label>

                          {calcCrane && (
                            <div>
                              <label className="text-[9px] font-bold text-outline uppercase block mb-1">Počet paliet</label>
                              <input 
                                type="number" 
                                className="w-full p-2 bg-white border border-outline/25 font-bold text-center"
                                value={calcPallets}
                                onChange={e => setCalcPallets(parseInt(e.target.value) || 1)}
                                min="1"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 border-t border-outline/5 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                          <input 
                            type="checkbox"
                            checked={calcWait}
                            onChange={e => setCalcWait(e.target.checked)}
                            className="w-4 h-4 text-primary rounded-none focus:ring-0"
                          />
                          Čakanie šoféra / prestoj
                        </label>

                        {calcWait && (
                          <div>
                            <label className="text-[9px] font-bold text-outline uppercase block mb-1">Počet polhodín (prestoju)</label>
                            <input 
                              type="number" 
                              className="w-full p-2 bg-white border border-outline/25 font-bold text-center"
                              value={calcWaitHalfHours}
                              onChange={e => setCalcWaitHalfHours(parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Results display */}
                    <div className="bg-white p-4 border border-outline/10 flex flex-col justify-between">
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider mb-3 text-primary-strong">Výpočet dopravy:</h5>
                        <div className="space-y-2 font-medium">
                          <div className="flex justify-between border-b border-outline/5 pb-1">
                            <span>Základná preprava:</span>
                            <span className="font-bold">{getCalcResults().basePrice.toFixed(2)} €</span>
                          </div>
                          {calcVehicle === 'hr8' && calcCrane && (
                            <div className="flex justify-between border-b border-outline/5 pb-1 text-emerald-700">
                              <span>Vykládka HR ({calcPallets} ks):</span>
                              <span className="font-bold">+{getCalcResults().cranePrice.toFixed(2)} €</span>
                            </div>
                          )}
                          {calcWait && (
                            <div className="flex justify-between border-b border-outline/5 pb-1 text-amber-700">
                              <span>Prestoj ({calcWaitHalfHours * 30} min):</span>
                              <span className="font-bold">+{getCalcResults().waitPrice.toFixed(2)} €</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t-2 border-primary/45 pt-3 mt-4 flex justify-between items-center text-base font-black uppercase">
                        <span>Cena dopravy celkom:</span>
                        <span className="bg-[#2d2f2b] text-primary px-3 py-1.5 font-mono">
                          {getCalcResults().totalShipping.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="text-[10px] font-bold text-outline uppercase mb-4 tracking-widest">Položky dopytu</h4>
                <div className="space-y-4">
                  {(() => {
                    const parsedItems = Array.isArray(selectedOrder.items)
                      ? selectedOrder.items
                      : (typeof selectedOrder.items === 'string' ? (JSON.parse(selectedOrder.items || '[]')) : []);
                    
                    if (!parsedItems || parsedItems.length === 0) {
                      return <p className="text-xs text-outline italic">Žiadne špecifické položky dopytu</p>;
                    }

                    return parsedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-4 border-b border-outline/5 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white shrink-0 flex items-center justify-center font-bold text-outline border border-outline/10 text-xs overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name || ''} className="w-full h-full object-cover" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{item.name || item.products?.name || item.product_name || 'Materiál'}</p>
                            <p className="text-xs text-outline font-medium">{item.quantity || 1} {item.unit || item.products?.unit || 'ks'}</p>
                          </div>
                        </div>
                        {item.price > 0 && (
                          <div className="text-right font-bold text-sm">
                            {(Number(item.price) * Number(item.quantity || 1)).toFixed(2)} €
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>

                <div className="mt-8 pt-6 border-t border-outline/10">
                  <a 
                    href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#2d2f2b] text-primary py-5 flex items-center justify-center font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-transform text-center gap-2"
                  >
                    <Mail size={18} /> Odpovedať v e-maile (ExoHosting Roundcube)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inquiry Details Modal */}
        {showInquiryDetails && selectedInquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#2d2f2b]/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
              <button 
                onClick={() => setShowInquiryDetails(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
              ><X size={24}/></button>
              
              <div className="p-10 overflow-y-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-black tracking-tight mb-2">Správa z webu</h2>
                  <p className="text-xs text-outline font-medium uppercase tracking-widest">
                    Prijaté: {new Date(selectedInquiry.created_at).toLocaleString('sk-SK')}
                  </p>
                </div>

                <div className="space-y-6 border-y border-outline/5 py-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-2 tracking-widest">Odosielateľ</h4>
                    <p className="font-bold text-lg">{selectedInquiry.customer_name || selectedInquiry.name || 'Zákazník'}</p>
                    <p className="text-on-surface-variant font-medium">
                      <a href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX" target="_blank" rel="noopener noreferrer" className="text-primary-strong hover:underline font-bold">
                        {selectedInquiry.customer_email || selectedInquiry.email || 'Nezadaný e-mail'}
                      </a>
                    </p>
                    {(selectedInquiry.customer_phone || selectedInquiry.phone) && (
                      <p className="text-on-surface-variant font-medium text-xs mt-1">
                        Tel: <a href={`tel:${selectedInquiry.customer_phone || selectedInquiry.phone}`} className="text-on-surface hover:text-primary font-bold">{selectedInquiry.customer_phone || selectedInquiry.phone}</a>
                      </p>
                    )}
                  </div>

                  {selectedInquiry.subject && (
                    <div>
                      <h4 className="text-[10px] font-bold text-outline uppercase mb-2 tracking-widest">Predmet dopytu</h4>
                      <p className="font-bold text-sm text-primary-strong">{selectedInquiry.subject}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-2 tracking-widest">Text správy / Špecifikácia</h4>
                    <div className="bg-surface p-4 border border-outline/5 text-sm font-medium text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.details || selectedInquiry.message}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#2d2f2b] text-primary py-5 flex items-center justify-center font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-transform text-center gap-2"
                  >
                    <Mail size={18} /> Odpovedať v e-maile (ExoHosting Roundcube)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tariff Editor */}
        {view === 'shipping' && shippingConfig && (
          <div className="bg-white border border-outline/10 shadow-sm p-8 max-w-4xl">
            <h2 className="text-2xl font-black mb-8 pb-4 border-b border-outline/10 tracking-tight">
              NASTAVENIA SADZIEB PREPRAVY
            </h2>
            <form onSubmit={handleSaveShippingConfig} className="space-y-8">
              {/* Kilometer Rates */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong">1. Kilometer sadzby (tam aj späť)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Auto do 3,5t (€ / km)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={shippingConfig.rates?.car35 || 0}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        rates: { ...shippingConfig.rates, car35: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Auto s hydraulickou rukou 8t (€ / km)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={shippingConfig.rates?.hr8 || 0}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        rates: { ...shippingConfig.rates, hr8: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Extra fees */}
              <div className="space-y-4 pt-4 border-t border-outline/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong">2. Príplatky a doplnkové poplatky</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Vykládka HR (€ / paleta)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={shippingConfig.fees?.crane || 0}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        fees: { ...shippingConfig.fees, crane: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Prestoj 3,5t (€ / 1/2 hod)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={shippingConfig.fees?.wait_car35 || 0}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        fees: { ...shippingConfig.fees, wait_car35: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Prestoj HR 8t (€ / 1/2 hod)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={shippingConfig.fees?.wait_hr8 || 0}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        fees: { ...shippingConfig.fees, wait_hr8: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Municipalities List */}
              <div className="space-y-4 pt-4 border-t border-outline/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong">3. Paušálne ceny dovozu pre obce</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f0eded]">
                        <th className="px-4 py-3 font-bold uppercase text-outline">Obec</th>
                        <th className="px-4 py-3 font-bold uppercase text-outline">Auto do 3,5t (€)</th>
                        <th className="px-4 py-3 font-bold uppercase text-outline">Auto s HR 8t (€)</th>
                        <th className="px-4 py-3 font-bold uppercase text-outline text-right">Akcia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/5">
                      {shippingConfig.municipalities?.map((m, index) => (
                        <tr key={m.name || index} className="hover:bg-surface">
                          <td className="px-4 py-3 font-bold">{m.name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number" step="0.01" min="0"
                              className="bg-surface p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary w-24"
                              value={m.car35}
                              onChange={(e) => {
                                const updated = [...shippingConfig.municipalities];
                                updated[index] = { ...m, car35: parseFloat(e.target.value) || 0 };
                                setShippingConfig({ ...shippingConfig, municipalities: updated });
                              }}
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number" step="0.01" min="0"
                              className="bg-surface p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary w-24"
                              value={m.hr8}
                              onChange={(e) => {
                                const updated = [...shippingConfig.municipalities];
                                updated[index] = { ...m, hr8: parseFloat(e.target.value) || 0 };
                                setShippingConfig({ ...shippingConfig, municipalities: updated });
                              }}
                              required
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = shippingConfig.municipalities.filter((_, idx) => idx !== index);
                                setShippingConfig({ ...shippingConfig, municipalities: updated });
                              }}
                              className="text-error hover:bg-error/10 p-1.5"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add new municipality form */}
                <div className="bg-surface p-4 border border-outline/10 space-y-3 mt-4">
                  <span className="block text-[10px] font-black uppercase text-outline tracking-wider">Pridať novú obec do cenníka</span>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-1 w-full">
                      <label className="text-[9px] font-bold uppercase text-outline block">Názov obce</label>
                      <input
                        id="new-mun-name"
                        type="text"
                        placeholder="Napr. Lazisko"
                        className="w-full bg-white p-3 text-xs font-semibold outline-none border border-outline/20"
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-auto">
                      <label className="text-[9px] font-bold uppercase text-outline block">Auto do 3,5t (€)</label>
                      <input
                        id="new-mun-car35"
                        type="number" step="0.01" min="0" placeholder="0.00"
                        className="w-full sm:w-28 bg-white p-3 text-xs font-bold outline-none border border-outline/20 text-center"
                      />
                    </div>
                    <div className="space-y-1 w-full sm:w-auto">
                      <label className="text-[9px] font-bold uppercase text-outline block">Auto s HR 8t (€)</label>
                      <input
                        id="new-mun-hr8"
                        type="number" step="0.01" min="0" placeholder="0.00"
                        className="w-full sm:w-28 bg-white p-3 text-xs font-bold outline-none border border-outline/20 text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nameEl = document.getElementById('new-mun-name');
                        const carEl = document.getElementById('new-mun-car35');
                        const hrEl = document.getElementById('new-mun-hr8');
                        const name = nameEl?.value?.trim();
                        const car35 = parseFloat(carEl?.value) || 0;
                        const hr8 = parseFloat(hrEl?.value) || 0;
                        
                        if (!name) {
                          toast.error('Zadajte názov obce.');
                          return;
                        }
                        if (shippingConfig.municipalities?.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                          toast.error('Táto obec už v zozname existuje.');
                          return;
                        }

                        const newMun = { name, car35, hr8 };
                        setShippingConfig({
                          ...shippingConfig,
                          municipalities: [...(shippingConfig.municipalities || []), newMun]
                        });

                        // Clear inputs
                        if (nameEl) nameEl.value = '';
                        if (carEl) carEl.value = '';
                        if (hrEl) hrEl.value = '';
                        toast.success(`Obec ${name} bola pridaná do zoznamu.`);
                      }}
                      className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs hover:bg-[#daf900] tracking-wider shrink-0 w-full sm:w-auto text-center"
                    >
                      Pridať
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-outline/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2d2f2b] text-primary py-4 font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                >
                  {loading ? 'UKLADÁM...' : 'ULOŽIŤ NASTAVENIA CENNÍKA'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* System Settings Editor */}
        {view === 'settings' && (
          <div className="bg-white border border-outline/10 shadow-sm p-8 max-w-4xl space-y-8">
            <h2 className="text-2xl font-black mb-8 pb-4 border-b border-outline/10 tracking-tight">
              SYSTÉMOVÉ NASTAVENIA WEBU
            </h2>
            <form onSubmit={handleSaveSystemSettings} className="space-y-8">
              {/* Alert Banner / Announcement Section */}
              <div className="space-y-6 bg-primary/5 p-6 border border-primary/20">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">campaign</span>
                  Oznamovací banner (Úvodná stránka)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-outline block">Zobraziť banner na webe</label>
                    <select
                      className="w-full bg-white border border-outline/20 p-4 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                      value={settingsForm.hours_alert_enabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hours_alert_enabled: e.target.value })}
                    >
                      <option value="false">Vypnutý (Skrytý)</option>
                      <option value="true">Zapnutý (Viditeľný)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-outline block">Farba / Typ hlásenia</label>
                    <select
                      className="w-full bg-white border border-outline/20 p-4 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                      value={settingsForm.hours_alert_type}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hours_alert_type: e.target.value })}
                    >
                      <option value="info">Info (Zelená / Svetlá)</option>
                      <option value="warning">Upozornenie (Žltá / Oranžová)</option>
                      <option value="error">Dôležité (Červená)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-outline block">Text hlásenia</label>
                  <textarea
                    className="w-full bg-white border border-outline/20 p-4 text-sm font-medium outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none"
                    placeholder="Napr. Upozornenie: Dňa 5.7. bude predajňa z dôvodu sviatku zatvorená."
                    value={settingsForm.hours_alert_message}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hours_alert_message: e.target.value })}
                  />
                </div>
              </div>

              {/* Opening Hours Section */}
              <div className="space-y-6 pt-4 border-t border-outline/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  Otváracie hodiny
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Pondelok - Piatok</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.hours_weekday}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hours_weekday: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Sobota</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.hours_saturday}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hours_saturday: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Nedeľa</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.hours_sunday}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hours_sunday: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-6 pt-4 border-t border-outline/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">contact_mail</span>
                  Kontaktné údaje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Telefón</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.contact_phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">E-mail</label>
                    <input
                      type="email"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.contact_email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Adresa predajne</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.contact_address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Billing Info Section */}
              <div className="space-y-6 pt-4 border-t border-outline/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary-strong flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  Fakturačné údaje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">Obchodné meno</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.billing_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, billing_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">IČO</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.billing_ico}
                      onChange={(e) => setSettingsForm({ ...settingsForm, billing_ico: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-outline">IČ DPH</label>
                    <input
                      type="text"
                      className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                      value={settingsForm.billing_icdph}
                      onChange={(e) => setSettingsForm({ ...settingsForm, billing_icdph: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-outline/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2d2f2b] text-primary py-4 font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                >
                  {loading ? 'UKLADÁM...' : 'ULOŽIŤ SYSTÉMOVÉ NASTAVENIA'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rental Modal */}
        {showRentalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowRentalModal(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
              ><X size={24}/></button>
              
              <h2 className="text-3xl font-black tracking-tight mb-8">
                {editingRental ? 'Upraviť techniku' : 'Nová technika'}
              </h2>
              
              <form onSubmit={handleSaveRental} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Názov techniky</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={rentalFormData.name}
                    onChange={e => setRentalFormData({...rentalFormData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Kategória</label>
                  <select 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold animate-none"
                    value={rentalFormData.category}
                    onChange={e => setRentalFormData({...rentalFormData, category: e.target.value})}
                    required
                  >
                    <option value="Vibračná a hutniaca technika">Vibračná a hutniaca technika</option>
                    <option value="Sekanie a vŕtanie">Sekanie a vŕtanie</option>
                    <option value="Pílenie a rezanie">Pílenie a rezanie</option>
                    <option value="Odvlhčovanie a iné">Odvlhčovanie a iné</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Vratná záloha (kaucia v €)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={rentalFormData.deposit}
                    onChange={e => setRentalFormData({...rentalFormData, deposit: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Celkový počet kusov (na sklade)</label>
                  <input 
                    type="number" min="1" step="1"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={rentalFormData.quantity || 1}
                    onChange={e => setRentalFormData({...rentalFormData, quantity: parseInt(e.target.value) || 1})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Cena do 4 hodín (€)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={rentalFormData.price4h}
                    onChange={e => setRentalFormData({...rentalFormData, price4h: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Cena do 24 hodín (€)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary"
                    value={rentalFormData.price24h}
                    onChange={e => setRentalFormData({...rentalFormData, price24h: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Poznámka (napr. zľava nad 3 dni)</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-medium"
                    value={rentalFormData.note || ''}
                    onChange={e => setRentalFormData({...rentalFormData, note: e.target.value})}
                    placeholder="Napr. Zľava 10% nad 3 dni"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Popis techniky</label>
                  <textarea 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none text-sm font-medium"
                    value={rentalFormData.description || ''}
                    onChange={e => setRentalFormData({...rentalFormData, description: e.target.value})}
                    placeholder="Technické parametre, výkon, využitie..."
                  />
                </div>

                {/* Accessories Editor inside Modal */}
                <div className="col-span-2 space-y-4 border-t border-outline/10 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-outline tracking-wider">Odporúčané príslušenstvo / spotrebný materiál</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newAcc = { id: `acc_${Date.now()}`, name: '', price: 0, flat: true };
                        setRentalFormData({
                          ...rentalFormData,
                          accessories: [...(rentalFormData.accessories || []), newAcc]
                        });
                      }}
                      className="text-primary hover:text-on-surface font-bold text-xs uppercase flex items-center gap-1"
                    >
                      <PlusCircle size={14}/> Pridať položku
                    </button>
                  </div>

                  {(rentalFormData.accessories || []).length === 0 ? (
                    <p className="text-xs italic text-outline">K tejto technike zatiaľ nie je priradené žiadne príslušenstvo.</p>
                  ) : (
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                      {(rentalFormData.accessories || []).map((acc, index) => (
                        <div key={acc.id || index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-surface p-3 border border-outline/5">
                          <input 
                            placeholder="Názov (napr. Opotrebenie sekáča)"
                            className="flex-1 bg-white p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary w-full"
                            value={acc.name}
                            onChange={(e) => {
                              const updated = [...rentalFormData.accessories];
                              updated[index].name = e.target.value;
                              setRentalFormData({ ...rentalFormData, accessories: updated });
                            }}
                            required
                          />
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input 
                              type="number" step="0.01" placeholder="Cena"
                              className="w-20 bg-white p-2 text-xs font-black outline-none focus:ring-1 focus:ring-primary text-center"
                              value={acc.price}
                              onChange={(e) => {
                                const updated = [...rentalFormData.accessories];
                                updated[index].price = parseFloat(e.target.value) || 0;
                                setRentalFormData({ ...rentalFormData, accessories: updated });
                              }}
                              required
                            />
                            <span className="text-xs font-bold text-outline">€</span>
                          </div>
                          <div className="flex items-center gap-2 select-none w-full sm:w-auto shrink-0">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                              <input 
                                type="checkbox"
                                checked={acc.flat !== false}
                                onChange={(e) => {
                                  const updated = [...rentalFormData.accessories];
                                  updated[index].flat = e.target.checked;
                                  setRentalFormData({ ...rentalFormData, accessories: updated });
                                }}
                                className="w-3.5 h-3.5 text-primary focus:ring-primary rounded-none"
                              />
                              Jednorazová
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (rentalFormData.accessories || []).filter((_, idx) => idx !== index);
                              setRentalFormData({ ...rentalFormData, accessories: updated });
                            }}
                            className="text-error hover:bg-error/10 p-1.5 self-end sm:self-center"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-2 space-y-2 border-t border-outline/10 pt-4">
                  <label className="text-[10px] font-bold uppercase text-outline block">Obrázok techniky</label>
                  
                  {rentalFormData.image_url ? (
                    <div className="relative border border-outline/10 p-4 bg-surface flex flex-col sm:flex-row items-center gap-4">
                      <img 
                        src={rentalFormData.image_url} 
                        alt="Náhľad techniky" 
                        className="w-24 h-24 object-cover border border-outline/10 bg-white"
                      />
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <p className="text-xs text-outline font-mono truncate max-w-xs sm:max-w-md">
                          {rentalFormData.image_url}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <label className="bg-white border border-outline/20 text-on-surface px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-surface-container-low transition-colors flex items-center gap-1.5">
                            <Upload size={12} /> Zmeniť fotku
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'rental')} 
                              disabled={imageUploading}
                            />
                          </label>
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage('rental')}
                            className="bg-error/10 text-error px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-error/20 transition-colors"
                          >
                            Odstrániť
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className={cn(
                      "border-2 border-dashed border-outline/20 p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center",
                      imageUploading && "pointer-events-none opacity-60"
                    )}>
                      {imageUploading ? (
                        <>
                          <Loader2 size={32} className="text-primary animate-spin" />
                          <span className="text-xs font-bold uppercase text-outline">Nahrávam fotku na server...</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-surface p-4 rounded-full text-outline/60">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-bold uppercase text-on-surface">Kliknite pre výber fotky</span>
                          <span className="text-[10px] text-outline font-sans">PNG, JPG, WEBP (max. 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'rental')} 
                        disabled={imageUploading}
                      />
                    </label>
                  )}
                </div>
                
                <div className="col-span-2 pt-4 border-t border-outline/10">
                  <button 
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest hover:bg-[#daf900] disabled:opacity-50"
                  >
                    {loading ? 'UKLADÁM...' : 'ULOŽIŤ POLOŽKU'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
              ><X size={24}/></button>
              
              <h2 className="text-3xl font-black tracking-tight mb-8">
                Pridať rezerváciu
              </h2>
              
              <form onSubmit={handleSaveBooking} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Technika na prenájom</label>
                  <select 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                    value={bookingFormData.rental_item_id}
                    onChange={e => setBookingFormData({...bookingFormData, rental_item_id: e.target.value})}
                    required
                  >
                    <option value="" disabled>Vyberte techniku...</option>
                    {rentalItemsList.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Meno zákazníka</label>
                  <input 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.customer_name}
                    onChange={e => setBookingFormData({...bookingFormData, customer_name: e.target.value})}
                    placeholder="Meno a priezvisko / Názov firmy"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Telefónne číslo</label>
                  <input 
                    type="tel"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.customer_phone}
                    onChange={e => setBookingFormData({...bookingFormData, customer_phone: e.target.value})}
                    placeholder="+421 ..."
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">E-mail</label>
                  <input 
                    type="email"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.customer_email}
                    onChange={e => setBookingFormData({...bookingFormData, customer_email: e.target.value})}
                    placeholder="email@priklad.sk"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Začiatok rezervácie</label>
                  <input 
                    type="date"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.start_date}
                    onChange={e => setBookingFormData({...bookingFormData, start_date: e.target.value})}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Čas vyzdvihnutia</label>
                  <input 
                    type="time"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.start_time}
                    onChange={e => setBookingFormData({...bookingFormData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Koniec rezervácie</label>
                  <input 
                    type="date"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    min={bookingFormData.start_date}
                    value={bookingFormData.end_date}
                    onChange={e => setBookingFormData({...bookingFormData, end_date: e.target.value})}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Čas vrátenia</label>
                  <input 
                    type="time"
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary font-bold"
                    value={bookingFormData.end_time}
                    onChange={e => setBookingFormData({...bookingFormData, end_time: e.target.value})}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Stav rezervácie</label>
                  <select 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                    value={bookingFormData.status}
                    onChange={e => setBookingFormData({...bookingFormData, status: e.target.value})}
                    required
                  >
                    <option value="approved">Schválená (Termín sa zablokuje)</option>
                    <option value="pending">Čakajúca</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Interná poznámka / Detaily</label>
                  <textarea 
                    className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm min-h-[80px]"
                    value={bookingFormData.note}
                    onChange={e => setBookingFormData({...bookingFormData, note: e.target.value})}
                    placeholder="Napr. Zákazník zaplatil zálohu v hotovosti, osobné vyzdvihnutie..."
                  />
                </div>

                <div className="col-span-2 pt-4 border-t border-outline/10">
                  <button 
                    disabled={loading}
                    className="w-full bg-[#2d2f2b] text-primary hover:bg-primary hover:text-on-primary py-4 font-black uppercase tracking-widest disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'UKLADÁM...' : 'ULOŽIŤ REZERVÁCIU'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

          {/* Category Add Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative border border-zinc-200">
              <button 
                type="button"
                onClick={() => setShowCategoryModal(false)} 
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900"
              ><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6 tracking-tight text-zinc-900">Nová Kategória</h3>
              <form onSubmit={handleSaveCategory} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 block">Názov Kategórie</label>
                  <input 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-semibold"
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    required
                    placeholder="Napr. Farby a laky"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 block">Typ Sekcie</label>
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 outline-none text-sm font-semibold"
                    value={categoryFormData.type}
                    onChange={e => setCategoryFormData({...categoryFormData, type: e.target.value})}
                  >
                    <option value="material">Materiály (V sekcii Materiály)</option>
                    <option value="tool">Náradie / Farby (V sekcii Náradie/Farby)</option>
                    <option value="rental">Požičovňa (V sekcii Požičovňa)</option>
                    <option value="agriculture">Poľnohospodárstvo (V sekcii Poľno)</option>
                  </select>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white rounded-lg py-3 font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md mt-2"
                >
                  {loading ? 'VYTVÁRAM...' : 'VYTVORIŤ KATEGÓRIU'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Helpdesk Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <a
            href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:bg-zinc-800 transition-all hover:scale-105 border border-zinc-700/60 group"
            title="Otvoriť Roundcube Webmail"
          >
            <Mail size={18} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold pr-1 hidden sm:inline-block">Webmail (Roundcube)</span>
          </a>
        </div>
      </main>
    </div>
  </div>
)
}

const NavItem = ({ icon, label, active, collapsed, onClick, badge, dangerBadge }) => (
  <button 
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-medium relative group",
      active 
        ? "bg-zinc-800 text-white font-semibold shadow-xs border-l-2 border-emerald-500" 
        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
    )}
  >
    <span className={cn("shrink-0", active ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200")}>{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && badge !== undefined && badge > 0 && (
      <span className={cn(
        "ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
        dangerBadge ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "bg-zinc-700 text-zinc-300"
      )}>
        {badge}
      </span>
    )}
  </button>
);

const DashboardStats = ({ stats, changeView }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard 
        label="Produkty Celkom" 
        value={stats.products} 
        trend="+4.2% tento mesiac" 
        trendPositive={true}
        icon={<Package size={20} className="text-emerald-600" />}
        onClick={() => changeView('products')} 
      />
      <StatCard 
        label="Katalógové Dopyty" 
        value={stats.orders} 
        trend="+12.5% tento týždeň" 
        trendPositive={true}
        icon={<Truck size={20} className="text-sky-600" />}
        onClick={() => changeView('orders')} 
      />
      <StatCard 
        label="Nízky Stav Skladu" 
        value={stats.stock || 0} 
        trend="Vyžaduje kontrolu" 
        danger={stats.stock > 0}
        icon={<AlertCircle size={20} className="text-amber-600" />}
        onClick={() => changeView('products')} 
      />
      <StatCard 
        label="Správy z Webu" 
        value={stats.inquiries} 
        trend={stats.inquiries > 0 ? "Vyžaduje odpoveď" : "Všetky zodpovedané"} 
        highlight={stats.inquiries > 0}
        icon={<MessageSquare size={20} className="text-indigo-600" />}
        onClick={() => changeView('inquiries')} 
      />
    </div>

    {/* Analytics & Quick Action Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Action Shortcuts */}
      <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900">Rýchle Akcie & Správa</h3>
            <p className="text-xs text-zinc-500">Často používané úlohy na jeden klik</p>
          </div>
          <span className="text-[11px] font-mono bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-semibold">Admin v2.4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => changeView('products')}
            className="p-4 rounded-xl border border-zinc-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform">
              <Package size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700">Správa Produktov</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Pridať nový materiál, skontrolovať zásoby a ceny</p>
            </div>
          </div>

          <div 
            onClick={() => changeView('bookings')}
            className="p-4 rounded-xl border border-zinc-200/80 hover:border-sky-500/50 hover:bg-sky-50/30 transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="p-3 bg-sky-100 text-sky-700 rounded-lg group-hover:scale-105 transition-transform">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 group-hover:text-sky-700">Rezervácie Požičovne</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Schvaľovanie termínov náradia a dovozov</p>
            </div>
          </div>

          <a 
            href="https://roundcube.exohosting.sk/?_task=mail&_mbox=INBOX"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border border-zinc-200/80 hover:border-indigo-500/50 hover:bg-indigo-50/30 transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg group-hover:scale-105 transition-transform">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 group-hover:text-indigo-700">ExoHosting Roundcube</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Otvoriť webmail a odpovedať na e-maily</p>
            </div>
          </a>

          <div 
            onClick={() => changeView('shipping')}
            className="p-4 rounded-xl border border-zinc-200/80 hover:border-amber-500/50 hover:bg-amber-50/30 transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-105 transition-transform">
              <Sliders size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 group-hover:text-amber-700">Cenník Dopravy</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Úprava sadzieb za km a vykládku s HR</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health / Overview Card */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
            <h3 className="font-bold text-base text-zinc-900">Stav Systému</h3>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>

          <div className="space-y-4 text-xs text-zinc-600">
            <div className="flex justify-between items-center py-2 border-b border-zinc-50">
              <span className="font-medium">E-mailové notifikácie:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Aktívne (PHP Mailer)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-50">
              <span className="font-medium">Cieľový mail admina:</span>
              <span className="font-mono text-zinc-900">kubik@stavivalubela.sk</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-50">
              <span className="font-medium">Webmail server:</span>
              <span className="font-mono text-zinc-900">smtp.exohosting.sk</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Verzia portálu:</span>
              <span className="font-bold text-zinc-900">PRO v2.4 (React + Vite)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 mt-6">
          <button 
            onClick={() => changeView('settings')}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
          >
            Spravovať Nastavenia
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, trend, trendPositive, highlight, danger, icon, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "p-5 bg-white border rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-md relative overflow-hidden group",
      highlight ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : danger ? "border-red-500/40 ring-1 ring-red-500/20" : "border-zinc-200/80 hover:border-zinc-300"
    )}
  >
    {danger && <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>}
    {highlight && <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>}
    
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
      <div className="p-2 bg-zinc-50 rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>

    <div className="flex items-baseline justify-between">
      <p className="text-3xl font-black text-zinc-900 tracking-tight">{value}</p>
      {trend && (
        <span className={cn(
          "text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
          danger ? "bg-red-50 text-red-600 font-bold" :
          highlight ? "bg-indigo-50 text-indigo-600 font-bold" :
          trendPositive ? "bg-emerald-50 text-emerald-600 font-bold" : "bg-zinc-100 text-zinc-600"
        )}>
          {trend}
        </span>
      )}
    </div>
  </div>
);

function LoginComponent() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    if (res && res.error) {
      toast.error('Chyba prihlásenia: ' + (res.error.message || res.error))
    } else {
      toast.success('Prihlásenie úspešné!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <div className="bg-[#18181b] p-8 sm:p-12 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            PRO PORTÁL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">ADMIN PRÍSTUP</h1>
          <p className="text-xs text-zinc-400">Prihláste sa do administrácie Stavebniny Ľubeľa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase font-bold text-zinc-400 block">Pracovný Email</label>
             <input className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white p-3.5 rounded-lg text-sm outline-none transition-colors" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kubik@stavivalubela.sk" required />
          </div>
          <div className="space-y-1.5">
             <label className="text-[11px] uppercase font-bold text-zinc-400 block">Heslo</label>
             <input className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white p-3.5 rounded-lg text-sm outline-none transition-colors" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 font-bold uppercase text-xs tracking-wider rounded-lg transition-colors mt-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50">
            {loading ? 'PRIHLASUJEM...' : 'PRIHLÁSIŤ SA'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Admin

