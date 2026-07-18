import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { 
  Plus, Edit, Trash2, Package, Truck, MessageSquare, 
  LogOut, LayoutDashboard, Settings, Search, Filter, 
  ChevronRight, AlertCircle, CheckCircle2, X, Eye, Menu, PlusCircle,
  Upload, Image, Loader2, Calendar, Wrench, Sliders, Mail
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
      const file = await compressImage(rawFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 })
      let publicUrl = ''
      try {
        publicUrl = await api.uploadImage(file)
      } catch (uploadErr) {
        console.warn('API upload failed, trying Supabase Storage:', uploadErr)
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`
        const { error: sbUploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: true })
        if (sbUploadError) throw sbUploadError
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        publicUrl = urlData.publicUrl
      }

      if (type === 'rental') {
        setRentalFormData(prev => ({ ...prev, image_url: publicUrl }))
      } else {
        setFormData(prev => ({ ...prev, image_url: publicUrl }))
      }
      toast.success('Fotka úspešne nahratá a skomprimovaná!', { id: uploadToastId })
    } catch (error) {
      console.error('Chyba pri nahrávaní obrázka:', error.message)
      toast.error(`Nepodarilo sa nahrať fotku: ${error.message}`, { id: uploadToastId })
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

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await api.products.update({ ...formData, id: editingItem.id })
        toast.success('Produkt bol úspešne upravený!')
      } else {
        await api.products.create(formData)
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
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            unit
          )
        `)
        .eq('order_id', order.id)
      
      if (error) throw error
      setSelectedOrder({ ...order, items: data })
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
      console.error('Error fetching order items:', error.message)
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
    const searchLower = searchTerm.toLowerCase();
    if (view === 'orders' && item.shipping_info) {
      const fullName = `${item.shipping_info.firstName || ''} ${item.shipping_info.lastName || ''}`;
      return fullName.toLowerCase().includes(searchLower) || item.id.toLowerCase().includes(searchLower);
    }
    if (view === 'bookings') {
      return (item.customer_name || '').toLowerCase().includes(searchLower) || 
             (item.rental_items?.name || '').toLowerCase().includes(searchLower);
    }
    return (item.name || item.id || '').toLowerCase().includes(searchLower);
  });

  if (!session) return <LoginComponent />

  return (
    <div className="flex flex-col md:flex-row pt-20 min-h-screen bg-[#f7f7f0]">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b border-outline/10">
        <span className="font-black tracking-tighter uppercase text-xs">Stavebniny PRO</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-surface">
          {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside className={cn(
        "bg-white border-r border-outline/10 h-screen overflow-y-auto transition-all duration-300 z-40 shrink-0",
        "fixed md:sticky top-0 left-0 pt-20 md:pt-0",
        isSidebarOpen ? "w-64 opacity-100 visible" : "w-0 opacity-0 invisible md:w-64 md:opacity-100 md:visible"
      )}>
        <div className="p-8 hidden md:block">
          <span className="text-xl font-black tracking-tighter">STAVEBNINY PRO</span>
          <p className="text-[10px] uppercase tracking-widest text-[#546200] font-bold mt-1">Admin v2.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={view === 'dashboard'} onClick={() => changeView('dashboard')} />
          <NavItem icon={<Package size={18}/>} label="Produkty & Sklad" active={view === 'products'} onClick={() => changeView('products')} />
          <NavItem icon={<Filter size={18}/>} label="Kategórie" active={view === 'categories'} onClick={() => changeView('categories')} />
          <NavItem icon={<Truck size={18}/>} label="Dopyty z katalógu" active={view === 'orders'} onClick={() => changeView('orders')} />
          <NavItem icon={<MessageSquare size={18}/>} label="Správy z webu" active={view === 'inquiries'} onClick={() => changeView('inquiries')} />
          <NavItem icon={<Calendar size={18}/>} label="Rezervácie techniky" active={view === 'bookings'} onClick={() => changeView('bookings')} />
          <NavItem icon={<Wrench size={18}/>} label="Správa Požičovne" active={view === 'rentals'} onClick={() => changeView('rentals')} />
          <div className="pt-8 pb-4 px-4 text-[10px] font-bold uppercase text-outline tracking-wider">Nastavenia</div>
          <NavItem icon={<Sliders size={18}/>} label="Cenník Dopravy" active={view === 'shipping'} onClick={() => changeView('shipping')} />
          <NavItem icon={<Settings size={18}/>} label="Systém" active={view === 'settings'} onClick={() => changeView('settings')} />
        </nav>

        <div className="p-8 mt-auto border-t border-outline/10">
          <button onClick={logout} className="flex items-center gap-2 text-error text-[10px] font-black uppercase tracking-widest">
            <LogOut size={14} /> Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-12 overflow-x-hidden">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight capitalize">
              {view === 'products' ? 'Správa Inventára' : 
               view === 'orders' ? 'Dopyty z katalógu' : 
               view === 'rentals' ? 'Správa Požičovne' :
               view === 'shipping' ? 'Cenník Dopravy' :
               view === 'categories' ? 'Kategórie' :
               view === 'bookings' ? 'Rezervácie Techniky' :
               view === 'inquiries' ? 'Správy z webu' :
               view === 'settings' ? 'Systémové Nastavenia' :
               view === 'dashboard' ? 'Prehľad' : view}
            </h1>
          </div>
          {view === 'products' && (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const url = prompt('Vložte URL produktu (napr. z OBI):')
                  if (url) handleImportFromUrl(url)
                }}
                className="bg-white border border-outline/20 text-on-surface px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-surface transition-colors"
                disabled={loading}
              >
                <PlusCircle size={16} /> {loading ? 'Spracúvam...' : 'Import z URL'}
              </button>
              <button 
                onClick={() => { setEditingItem(null); setFormData({name:'', description:'', price:0, sku:'', stock_quantity:0, category:'', image_url:'', type: 'material', unit: 'ks'}); setShowModal(true); }}
                className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#daf900] transition-colors"
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
              className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#daf900] transition-colors"
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
              className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#daf900] transition-colors"
            >
              <Plus size={16} /> Pridať rezerváciu
            </button>
          )}
          {view === 'categories' && (
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-primary text-on-primary px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#daf900] transition-colors"
            >
              <Plus size={16} /> Nová kategória
            </button>
          )}
        </header>

        {view === 'dashboard' && <DashboardStats stats={stats} changeView={changeView} />}
        
        {view !== 'dashboard' && view !== 'shipping' && view !== 'settings' && (
          <div className="bg-white border border-outline/10 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline/10 flex gap-4">
               <div className="relative flex-1">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                 <input 
                   placeholder="Hľadať..." 
                   className="pl-10 pr-4 py-2 bg-surface text-sm w-full border-none focus:ring-1 focus:ring-primary"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               <button className="flex items-center gap-2 px-4 py-2 border border-outline/20 text-xs font-bold uppercase"><Filter size={14}/> Filtre</button>
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
                            <p className="font-bold text-sm">{item.shipping_info?.firstName} {item.shipping_info?.lastName}</p>
                            <p className="text-[10px] text-outline font-mono">Dopyt #{item.id.slice(0,8)}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <p className="font-medium">{item.shipping_info?.phone}</p>
                            <a href={`mailto:${item.shipping_info?.email}`} className="text-primary-strong hover:underline font-bold block mt-0.5">{item.shipping_info?.email}</a>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 items-center">
                              <span className="text-[10px] bg-primary/20 text-[#546200] px-2 py-1 uppercase font-bold">{item.status || 'Prijatá'}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                  href={`mailto:${item.shipping_info?.email}?subject=Odpoveď na dopyt #${item.id.slice(0,8)}`}
                                  className="p-2 hover:bg-primary/20 text-primary-strong transition-colors"
                                  title="Odpovedať na e-mail"
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
                            <p className="font-bold text-sm">{item.name}</p>
                            <p className="text-[10px] text-outline font-mono">{new Date(item.created_at).toLocaleString('sk-SK')}</p>
                          </td>
                          <td className="px-6 py-5 text-xs">
                            <a href={`mailto:${item.email}`} className="text-primary-strong hover:underline font-bold block">{item.email}</a>
                          </td>
                          <td className="px-6 py-5 text-xs text-on-surface-variant font-medium whitespace-pre-wrap max-w-sm">
                            {item.message}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href={`mailto:${item.email}?subject=Odpoveď na dopyt z webu`}
                                className="p-2 hover:bg-primary/20 text-primary-strong transition-colors"
                                title="Odpovedať na e-mail"
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
                            <a href={`mailto:${item.customer_email}`} className="text-primary-strong hover:underline font-bold block mt-0.5">{item.customer_email}</a>
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
                                href={`mailto:${item.customer_email}?subject=Odpoveď na rezerváciu: ${item.rental_items?.name || 'Technika'}`}
                                className="bg-primary/10 text-primary-strong px-3 py-1.5 text-[9px] font-black uppercase tracking-wider hover:bg-primary/20 transition-colors flex items-center gap-1"
                                title="Odpovedať na e-mail"
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
                            <span className="block font-black text-sm text-primary-strong">24h: {item.price24h?.toFixed(2)} €</span>
                            <span className="block text-xs text-outline mt-0.5">4h: {item.price4h?.toFixed(2)} €</span>
                          </div>
                        </div>
                        <div className="bg-surface p-3 text-[10px] font-semibold space-y-1">
                          <p><strong className="uppercase text-outline text-[9px]">Záloha:</strong> {item.deposit?.toFixed(2)} €</p>
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
                            <span className={cn(
                              "inline-block text-[9px] font-black px-2 py-0.5 uppercase mt-1",
                              item.stock_quantity < 5 ? "bg-error/10 text-error" : "bg-emerald-100 text-emerald-700"
                            )}>{item.stock_quantity} {item.unit || 'ks'}</span>
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
                            <p className="font-bold text-base text-on-surface leading-tight">{item.shipping_info?.firstName} {item.shipping_info?.lastName}</p>
                            <p className="text-[10px] text-outline font-mono mt-1">Dopyt #{item.id.slice(0,8)}</p>
                          </div>
                          <span className="text-[9px] bg-primary/20 text-[#546200] px-2 py-1 uppercase font-black tracking-wider shrink-0">
                            {item.status || 'Prijatá'}
                          </span>
                        </div>
                        <div className="bg-surface p-3 text-xs border border-outline/5 space-y-1">
                          <p><strong>Tel:</strong> <a href={`tel:${item.shipping_info?.phone}`} className="text-primary hover:underline font-bold">{item.shipping_info?.phone}</a></p>
                          <p><strong>E-mail:</strong> <a href={`mailto:${item.shipping_info?.email}`} className="text-primary-strong hover:underline font-bold">{item.shipping_info?.email}</a></p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <a 
                            href={`mailto:${item.shipping_info?.email}?subject=Odpoveď na dopyt #${item.id.slice(0,8)}`}
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
                            <p className="font-bold text-base text-on-surface leading-tight">{item.name}</p>
                            <p className="text-[10px] text-outline font-mono mt-1">{new Date(item.created_at).toLocaleString('sk-SK')}</p>
                          </div>
                          <a href={`mailto:${item.email}`} className="text-[9px] bg-primary/10 text-primary-strong px-2 py-1 uppercase font-black tracking-wider shrink-0 hover:underline">
                            E-mail
                          </a>
                        </div>
                        <div className="bg-surface p-3 text-xs border border-outline/5 space-y-2 whitespace-pre-wrap font-medium">
                          {item.message}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <a 
                            href={`mailto:${item.email}?subject=Odpoveď na dopyt z webu`}
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
                    <option value="agriculture">Poľnohospodársky produkt</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Kategória</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Vyberte kategóriu</option>
                      {categories.filter(c => c.type === formData.type).map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <button 
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="bg-surface px-4 text-primary hover:bg-primary hover:text-on-primary transition-colors"
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
                      {selectedOrder.shipping_info?.firstName || ''} {selectedOrder.shipping_info?.lastName || ''}
                    </p>
                    <p className="text-on-surface-variant">
                      <a href={`mailto:${selectedOrder.shipping_info?.email}`} className="text-primary-strong hover:underline font-bold">
                        {selectedOrder.shipping_info?.email || ''}
                      </a>
                    </p>
                    <p className="text-on-surface-variant">
                      <a href={`tel:${selectedOrder.shipping_info?.phone}`} className="text-on-surface hover:text-primary transition-colors">
                        {selectedOrder.shipping_info?.phone || ''}
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-3 tracking-widest">Doručovacia adresa</h4>
                    <p className="text-on-surface-variant whitespace-pre-wrap">
                      {selectedOrder.shipping_info?.address || ''}{'\n'}
                      {selectedOrder.shipping_info?.zip || ''} {selectedOrder.shipping_info?.city || ''}
                    </p>
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
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-4 border-b border-outline/5 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface flex items-center justify-center font-bold text-outline border border-outline/10 text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold">{item.products?.name || 'Neznámy produkt'}</p>
                          <p className="text-xs text-outline">{item.quantity} {item.products?.unit || 'ks'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <p className="font-bold text-lg">{selectedInquiry.name}</p>
                    <p className="text-on-surface-variant font-medium">
                      <a href={`mailto:${selectedInquiry.email}`} className="text-primary-strong hover:underline font-bold">
                        {selectedInquiry.email}
                      </a>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-outline uppercase mb-2 tracking-widest">Text správy</h4>
                    <div className="bg-surface p-4 border border-outline/5 text-sm font-medium text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.message}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=Re: Správa z webu (Stavebniny Lubeľa)&body=Dobrý deň ${selectedInquiry.name},%0D%0A%0D%0AOdovedáme na vašu správu:%0D%0A"${selectedInquiry.message}"%0D%0A%0D%0A`}
                    className="w-full bg-[#2d2f2b] text-primary py-5 flex items-center justify-center font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-transform text-center"
                  >
                    Odpovedať e-mailom
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
            <div className="bg-white w-full max-w-md p-10 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setShowCategoryModal(false)} 
                className="absolute top-6 right-6 text-outline hover:text-on-surface"
              ><X size={20}/></button>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Nová kategória</h3>
              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Názov</label>
                  <input 
                    className="w-full bg-surface p-4 outline-none border-b-2 border-transparent focus:border-primary text-sm font-bold"
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    required
                    placeholder="Napr. Farby a laky"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Typ kategórie</label>
                  <select 
                    className="w-full bg-surface p-4 outline-none text-sm font-bold"
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
                  className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest hover:bg-[#daf900] disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {loading ? 'VYTVÁRAM...' : 'VYTVORIŤ KATEGÓRIU'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3 transition-all",
      active ? "bg-primary font-bold text-on-primary" : "text-outline hover:bg-surface-container-low"
    )}
  >
    {icon}
    <span className="text-sm font-headline">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto" />}
  </button>
)

const DashboardStats = ({ stats, changeView }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard label="Produkty Celkom" value={stats.products} onClick={() => changeView('products')} />
    <StatCard label="Katalógové Dopyty" value={stats.orders} highlight onClick={() => changeView('orders')} />
    <StatCard label="Nízky Stav Skladu" value={stats.stock} danger onClick={() => changeView('products')} />
    <StatCard label="Správy z webu" value={stats.inquiries} onClick={() => changeView('inquiries')} />
  </div>
)

const StatCard = ({ label, value, change, highlight, danger, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "p-6 bg-white border-l-4 shadow-sm cursor-pointer hover:bg-surface transition-colors",
      highlight ? "border-primary" : danger ? "border-error" : "border-outline/20"
    )}
  >
    <p className="text-[10px] uppercase font-black tracking-widest text-outline mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-black">{value}</p>
      {change && <span className="text-[10px] font-bold text-emerald-600">{change}</span>}
    </div>
  </div>
)

const LoginComponent = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-surface pt-20">
      <div className="bg-white p-12 border border-outline/10 shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-10 tracking-tighter">ADMIN PRÍSTUP</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
             <label className="text-xs uppercase font-bold text-outline">Pracovný Email</label>
             <input className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
             <label className="text-xs uppercase font-bold text-outline">Heslo</label>
             <input className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-primary text-on-primary py-4 font-black uppercase tracking-widest mt-4">Prihlásiť sa</button>
        </form>
      </div>
    </div>
  )
}

export default Admin
