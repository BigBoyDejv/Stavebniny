import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, Info, Search, X, Calendar, ShieldCheck, 
  HelpCircle, ChevronRight, CheckCircle2, AlertTriangle, Plus, Minus,
  Clock, Truck
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, getPlaceholderImage } from '../lib/utils'
import { toast } from 'react-hot-toast'
import { RENTAL_ITEMS, RENTAL_CATEGORIES, GENERAL_RENTAL_TERMS } from '../lib/rentalData'
import { useSettings } from '../context/SettingsContext'
import { MUNICIPALITIES, KM_RATES, ADDITIONAL_FEES, calculateShopShipping } from '../lib/shipping'
import { sendEmailNotification } from '../lib/email'

const Rental = () => {
  const { settings } = useSettings()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(RENTAL_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookings, setBookings] = useState([])

  // Parse shipping config from settings if available
  let activeMunicipalities = MUNICIPALITIES;
  let activeKmRates = KM_RATES;
  let activeFees = ADDITIONAL_FEES;

  if (settings && settings.shipping_config) {
    try {
      const parsed = typeof settings.shipping_config === 'string'
        ? JSON.parse(settings.shipping_config)
        : settings.shipping_config;
      
      if (parsed.municipalities) activeMunicipalities = parsed.municipalities;
      if (parsed.rates) activeKmRates = parsed.rates;
      if (parsed.fees) {
        activeFees = {
          craneUnloadPerPallet: parsed.fees.crane,
          waitTimePerHalfHour: {
            car35: parsed.fees.wait_car35,
            hr8: parsed.fees.wait_hr8
          }
        };
      }
    } catch (e) {
      console.error('Error parsing shipping_config:', e);
    }
  }

  // Modal & Selection States
  const [selectedForBooking, setSelectedForBooking] = useState(null)
  const [durationMode, setDurationMode] = useState('24h') // '4h' | '24h'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('08:00')
  
  // Calendar states
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [hoveredDate, setHoveredDate] = useState(null)

  // Helper to check if shop is closed
  const isShopClosed = () => {
    if (settings.hours_alert_enabled !== 'true') return false
    const msg = (settings.hours_alert_message || '').toLowerCase()
    return settings.hours_alert_type === 'error' || 
           msg.includes('zatvorené') || 
           msg.includes('zatvorene') || 
           msg.includes('dovolenka') || 
           msg.includes('neotvorené') || 
           msg.includes('neotvorene')
  }

  // Calendar Helpers
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getStartDayOfWeek = (month, year) => {
    let day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert to Mon-Sun (0-6)
  }

  const isDateBooked = (itemId, dateStr) => {
    return false
  }

  const hasDateConflict = () => {
    return false
  }

  const handleDateClick = (dateStr) => {
    if (durationMode === '4h') {
      if (isDateBooked(selectedForBooking?.id, dateStr)) {
        toast.error('Tento deň je už obsadený.')
        return
      }
      setStartDate(dateStr)
      setEndDate(dateStr)
      return
    }

    if (!startDate || (startDate && endDate)) {
      if (isDateBooked(selectedForBooking?.id, dateStr)) {
        toast.error('Tento deň je už obsadený.')
        return
      }
      setStartDate(dateStr)
      setEndDate('')
    } else {
      if (dateStr < startDate) {
        if (isDateBooked(selectedForBooking?.id, dateStr)) {
          toast.error('Tento deň je už obsadený.')
          return
        }
        setStartDate(dateStr)
        setEndDate('')
      } else if (dateStr === startDate) {
        setEndDate(dateStr)
      } else {
        let current = new Date(startDate)
        const target = new Date(dateStr)
        let hasBookingOverlap = false

        while (current <= target) {
          const checkStr = current.toISOString().split('T')[0]
          if (isDateBooked(selectedForBooking?.id, checkStr)) {
            hasBookingOverlap = true
            break
          }
          current.setDate(current.getDate() + 1)
        }

        if (hasBookingOverlap) {
          toast.error('Zvolené obdobie prekrýva existujúcu rezerváciu!')
          return
        }

        setEndDate(dateStr)
      }
    }
  }

  // Delivery States for Rental
  const [deliveryMethod, setDeliveryMethod] = useState('pickup') // 'pickup' | 'delivery'
  const [deliveryMunicipality, setDeliveryMunicipality] = useState(activeMunicipalities[0]?.name || 'Ľubeľa')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [deliveryZip, setDeliveryZip] = useState('')
  const [deliveryVehicle, setDeliveryVehicle] = useState('car35') // 'car35' | 'hr8'
  const [deliveryDistance, setDeliveryDistance] = useState(10)

  const [selectedAccIds, setSelectedAccIds] = useState([]) // list of accessory ids selected
  
  const [inquiryData, setInquiryData] = useState({
    name: '', email: '', phone: '', message: ''
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    document.title = "Požičovňa náradia a techniky | Stavebniny Ľubeľa"
    fetchRentals()
    fetchBookings()
  }, [])

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        setItems(data)
      } else {
        setItems(RENTAL_ITEMS)
      }
    } catch (error) {
      console.error('Error fetching rentals:', error.message)
      setItems(RENTAL_ITEMS)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_bookings')
        .select('*')
        .eq('status', 'approved')
      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Error fetching approved bookings:', err.message)
    }
  }

  // Verify if a tool is reserved for today
  const isItemReservedToday = (itemId) => {
    return false
  }

  // Calculate rental cost details based on selection
  const calculateCost = (item) => {
    if (!item) return { rentCost: 0, accCost: 0, daysCount: 0, discount: 0, deliveryCost: 0, total: 0 }

    let rentCost = 0
    let daysCount = 1
    let discount = 0

    if (durationMode === '4h') {
      rentCost = item.price4h
      daysCount = 0.5
    } else {
      // Parse dates to get days difference
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        daysCount = diffDays > 0 ? diffDays : 1
      } else {
        daysCount = durationMode === '3days' ? 3 : 1
      }

      const baseDailyRate = item.price24h
      if (daysCount >= 3) {
        discount = 10 // 10% discount
        rentCost = baseDailyRate * daysCount * 0.90
      } else {
        rentCost = baseDailyRate * daysCount
      }
    }

    // Accessory pricing
    let accCost = 0
    if (item.accessories) {
      item.accessories.forEach(acc => {
        if (selectedAccIds.includes(acc.id)) {
          accCost += acc.price
        }
      })
    }

    // Delivery pricing
    const deliveryResult = deliveryMethod === 'delivery'
      ? calculateShopShipping({
          municipalityName: deliveryMunicipality,
          vehicleType: deliveryVehicle,
          customDistance: Number(deliveryDistance),
          craneUnloading: false,
          palletsCount: 0,
          waitTime: false,
          waitHalfHours: 0,
          customMunicipalities: activeMunicipalities,
          customKmRates: activeKmRates,
          customFees: activeFees
        })
      : { basePrice: 0, cranePrice: 0, waitPrice: 0, totalShipping: 0 };
    
    const delCost = deliveryResult.totalShipping;

    return {
      rentCost,
      accCost,
      daysCount,
      discount,
      deliveryCost: delCost,
      total: rentCost + accCost + delCost
    }
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (durationMode !== '4h' && (!startDate || !endDate)) {
      toast.error('Prosím zvoľte termín prenájmu (dátum od a do).')
      return
    }
    if (durationMode === '4h' && !startDate) {
      toast.error('Prosím zvoľte dátum prenájmu.')
      return
    }

    setSending(true)
    const costDetails = calculateCost(selectedForBooking)
    const chosenAccs = selectedForBooking.accessories
      ? selectedForBooking.accessories
        .filter(a => selectedAccIds.includes(a.id))
        .map(a => `${a.name} (${a.price.toFixed(2)} €)`)
        .join(', ') || 'Žiadne'
      : 'Žiadne'

    // Format dates for DB
    const finalStartDate = startDate
    const finalEndDate = durationMode === '4h' ? startDate : endDate

    const detailSummary = `PRENAJATÁ TECHNIKA: ${selectedForBooking.name}
DOBA: ${durationMode === '4h' ? `Do 4 hodín (${startDate} o ${startTime})` : `${costDetails.daysCount} dní (${startDate} ${startTime} až ${endDate} ${endTime})`}
VYBRANÉ DOPLNKY: ${chosenAccs}
SPÔSOB PREVZATIA: ${deliveryMethod === 'delivery' ? `Dovoz na adresu: ${deliveryAddress}, ${deliveryZip} ${deliveryCity} (${deliveryMunicipality === 'other' ? 'Iná obec' : deliveryMunicipality})` : 'Osobný odber v Ľubeli'}
KAVCIE (VRATNÁ ZÁLOHA): ${selectedForBooking.deposit} €
NÁJOMNÉ: ${costDetails.rentCost.toFixed(2)} €
PRÍSLUŠENSTVO: ${costDetails.accCost.toFixed(2)} €
${deliveryMethod === 'delivery' ? `CENA ZA DOVOZ: ${costDetails.deliveryCost.toFixed(2)} €\n` : ''}CELKOVÁ CENA: ${costDetails.total.toFixed(2)} € (Vratná kaucia sa hradí v hotovosti pri prevzatí)`

    try {
      // 1. Insert into rental bookings via API
      await api.rental.createBooking({
        rental_item_id: selectedItem.id,
        customer_name: inquiryData.name,
        customer_email: inquiryData.email,
        customer_phone: inquiryData.phone,
        start_date: finalStartDate,
        end_date: finalEndDate,
        start_time: startTime,
        end_time: durationMode === '4h' ? null : endTime,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? deliveryAddress : null,
        delivery_city: deliveryMethod === 'delivery' ? deliveryCity : null,
        delivery_zip: deliveryMethod === 'delivery' ? deliveryZip : null,
        delivery_municipality: deliveryMethod === 'delivery' ? (deliveryMunicipality === 'other' ? 'Iná obec' : deliveryMunicipality) : null,
        delivery_price: deliveryMethod === 'delivery' ? costDetails.deliveryCost : 0,
        notes: detailSummary + (inquiryData.message ? `\n\nPOZNÁMKA ZÁKAZNÍKA: ${inquiryData.message}` : ''),
        status: 'pending'
      })

      // 2. Insert inquiry copy via API
      try {
        await api.inquiries.create({
          name: inquiryData.name,
          email: inquiryData.email,
          message: detailSummary + (inquiryData.message ? `\n\nPOZNÁMKA ZÁKAZNÍKA: ${inquiryData.message}` : ''),
        })
      } catch (inqErr) {}

      // 3. Send email notification (if flag enabled)
      const emailTo = settings.contact_email || 'kubik@stavivalubela.sk';
      await sendEmailNotification({
        type: 'Rezervácia',
        emailTo: emailTo,
        customerName: inquiryData.name,
        customerEmail: inquiryData.email,
        customerPhone: inquiryData.phone,
        subject: `Nová rezervácia techniky: ${selectedForBooking.name}`,
        details: detailSummary + (inquiryData.message ? `\n\nPOZNÁMKA ZÁKAZNÍKA: ${inquiryData.message}` : '')
      });

      toast.success('Rezervačná požiadavka bola úspešne odoslaná! Budeme vás kontaktovať.')
      setSelectedForBooking(null)
      setInquiryData({ name: '', email: '', phone: '', message: '' })
      setSelectedAccIds([])
      setStartDate('')
      setEndDate('')
      setStartTime('08:00')
      setEndTime('08:00')
      setDeliveryMethod('pickup')
      setDeliveryAddress('')
      setDeliveryCity('')
      setDeliveryZip('')
      fetchBookings()
    } catch (err) {
      toast.error('Nepodarilo sa odoslať rezerváciu: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'Všetko' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Autofill start and end date helper when choosing duration preset
  const handleDurationTabChange = (mode) => {
    setDurationMode(mode)
    if (mode === '4h') {
      setEndDate('')
    } else if (mode === '24h') {
      const today = new Date().toISOString().split('T')[0]
      setStartDate(today)
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      setEndDate(tomorrow)
    } else if (mode === '3days') {
      const today = new Date().toISOString().split('T')[0]
      setStartDate(today)
      const thirdDay = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
      setEndDate(thirdDay)
    }
  }

  const triggerOpenBookingModal = (item) => {
    setSelectedForBooking(item)
    // Initial preset dates
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    setEndDate(tomorrow)
    setDurationMode('24h')
    setSelectedAccIds([])
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#fcfcf8]">
      {/* Header Info Section */}
      <section className="bg-white border-b border-outline/5 py-16 px-8 mb-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <span className="text-primary-strong font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Areál Stavebnín Ľubeľa</span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">POŽIČOVŇA NÁRADIA</h1>
              <p className="text-lg text-on-surface-variant font-medium max-w-xl border-l-4 border-primary pl-6">
                Hutniaca technika, búracie kladivá, píly a odvlhčovače. Nájdite správne náradie pre svoj projekt a zarezervujte si ho online.
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Hľadať náradie..."
                  className="w-full lg:w-80 bg-surface p-5 pl-12 text-sm font-bold uppercase tracking-widest border-b-2 border-outline/10 focus:border-primary outline-none transition-all group-hover:bg-white"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-5 text-outline/40 group-hover:text-primary transition-colors" size={20} />
              </div>
            </div>
          </div>

          {/* Categories Horizontal Filter */}
          <div className="flex flex-wrap gap-2 mt-8 border-t border-outline/5 pt-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat 
                    ? "bg-primary text-on-primary shadow-md" 
                    : "bg-surface text-on-surface hover:bg-white border border-outline/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-white border border-outline/5 animate-pulse"></div>)
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white border border-dashed border-outline/20">
              <Info size={48} className="mx-auto mb-4 text-outline/30" />
              <p className="font-black uppercase tracking-widest text-outline">Nenašli sme žiadne zodpovedajúce náradie</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const reserved = isItemReservedToday(item.id)
              return (
                <div 
                  key={item.id} 
                  className="group bg-white border border-outline/10 hover:border-primary/40 transition-all duration-300 flex flex-col h-full cursor-pointer shadow-sm"
                  onClick={() => triggerOpenBookingModal(item)}
                >
                  <div className="relative aspect-[4/3] bg-surface overflow-hidden">
                    <img
                      src={item.imageUrl || item.image_url || getPlaceholderImage(item.category, 'rental')}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-white/95 text-on-surface border border-outline/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick Pricing Ribbon */}
                    <div className="absolute bottom-4 right-4 bg-primary text-on-primary px-3 py-2 shadow-lg font-black text-xs uppercase tracking-wider">
                      do 24h: {Number(item.price24h || 0).toFixed(2)} €
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-on-surface mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium line-clamp-3 mb-6">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-outline/5 space-y-3">
                      <div className="flex justify-between text-[11px] font-bold text-outline uppercase tracking-wider">
                        <span>Do 4 hod:</span>
                        <span className="text-on-surface">{Number(item.price4h || 0).toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-outline uppercase tracking-wider">
                        <span>Do 24 hod:</span>
                        <span className="text-on-surface">{Number(item.price24h || 0).toFixed(2)} €</span>
                      </div>
                      {item.note && (
                        <div className="text-[10px] text-primary-strong font-black uppercase tracking-widest bg-primary/10 px-2 py-1 inline-block">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Booking Form Dialog Modal */}
      {selectedForBooking && (() => {
        const cost = calculateCost(selectedForBooking)
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#2d2f2b]/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-5xl shadow-2xl relative flex flex-col md:flex-row max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Close */}
              <button
                onClick={() => setSelectedForBooking(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-10 bg-white p-1.5 hover:text-primary transition-colors rounded-full shadow-lg"
              ><X size={24} /></button>

              {/* Left Column - Image & Terms info */}
              <div className="w-full md:w-1/2 bg-surface flex flex-col">
                <div className="aspect-[16/10] md:flex-grow relative overflow-hidden">
                  <img src={selectedForBooking.imageUrl || selectedForBooking.image_url || getPlaceholderImage(selectedForBooking.category, 'rental')} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">
                      {selectedForBooking.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                      {selectedForBooking.name}
                    </h2>
                  </div>
                </div>
                <div className="p-6 bg-[#1d1f1c] text-white space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Podmienky zapožičania</h4>
                  <ul className="text-[11px] text-zinc-300 space-y-2 list-none p-0 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-black">•</span>
                      <span><strong>Vratná kaucia:</strong> Vyžaduje sa záloha vo výške <strong>{selectedForBooking.deposit} €</strong>, ktorá sa skladá v hotovosti pri prevzatí stroja.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-black">•</span>
                      <span><strong>Znečistenie:</strong> V prípade vrátenia silne znečisteného stroja alebo kufra účtujeme poplatok <strong>10.00 €</strong> za čistenie.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-black">•</span>
                      <span><strong>Dlhodobý prenájom:</strong> Nad 3 dni automaticky uplatňujeme <strong>zľavu 10%</strong> na cenu denného nájmu.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Booking Details Form */}
              <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto flex flex-col">
                <h3 className="text-lg font-black uppercase tracking-wider mb-6 pb-2 border-b-2 border-primary inline-block self-start">
                  Dopyt na prenájom
                </h3>

                <form onSubmit={handleInquirySubmit} className="space-y-6 flex-grow flex flex-col justify-between">
                  {isShopClosed() ? (
                    <div className="bg-error/10 border-l-4 border-error p-6 text-xs font-bold uppercase tracking-wider text-error leading-relaxed my-auto">
                      ⚠️ REZERVÁCIA TECHNIKY JE DOČASNE POZASTAVENÁ
                      <p className="mt-2 text-on-surface normal-case font-medium">{settings.hours_alert_message}</p>
                    </div>
                  ) : (
                    <>
                      {/* Step 1: Duration settings */}
                      <div className="space-y-4 font-sans">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-outline block">Doba prenájmu</label>
                          <div className="grid grid-cols-2 bg-surface p-1 border border-outline/10">
                            <button
                              type="button"
                              onClick={() => handleDurationTabChange('4h')}
                              className={cn(
                                "py-2 text-[10px] font-black uppercase transition-all text-center",
                                durationMode === '4h' ? "bg-[#2d2f2b] text-primary" : "text-outline hover:text-on-surface"
                              )}
                            >
                              Do 4 hodín
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDurationTabChange('24h')}
                              className={cn(
                                "py-2 text-[10px] font-black uppercase transition-all text-center",
                                durationMode === '24h' ? "bg-[#2d2f2b] text-primary" : "text-outline hover:text-on-surface"
                              )}
                            >
                              Celý deň / Viac dní
                            </button>
                          </div>
                        </div>

                        {/* Calendar Date Picker */}
                        <div className="space-y-3 bg-surface p-4 border border-outline/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase text-outline">
                              Výber dátumu:
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (calMonth === 0) {
                                    setCalMonth(11)
                                    setCalYear(calYear - 1)
                                  } else {
                                    setCalMonth(calMonth - 1)
                                  }
                                }}
                                className="p-1 hover:bg-outline/10 text-on-surface transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                              </button>
                              <span className="text-xs font-black uppercase tracking-wider">
                                {new Date(calYear, calMonth).toLocaleString('sk-SK', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (calMonth === 11) {
                                    setCalMonth(0)
                                    setCalYear(calYear + 1)
                                  } else {
                                    setCalMonth(calMonth + 1)
                                  }
                                }}
                                className="p-1 hover:bg-outline/10 text-on-surface transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                              </button>
                            </div>
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold mb-1 border-b border-outline/5 pb-1">
                            <div>Po</div><div>Ut</div><div>St</div><div>Št</div><div>Pi</div><div>So</div><div>Ne</div>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {/* Empty padding days */}
                            {Array.from({ length: getStartDayOfWeek(calMonth, calYear) }).map((_, idx) => (
                              <div key={`empty-${idx}`} className="p-2"></div>
                            ))}

                            {/* Month Days */}
                            {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, idx) => {
                              const dayNum = idx + 1
                              const dateObj = new Date(calYear, calMonth, dayNum)
                              const year = dateObj.getFullYear()
                              const month = String(dateObj.getMonth() + 1).padStart(2, '0')
                              const day = String(dateObj.getDate()).padStart(2, '0')
                              const dateStr = `${year}-${month}-${day}`
                              
                              const todayStr = new Date().toISOString().split('T')[0]
                              const isPast = dateStr < todayStr
                              const isBooked = isDateBooked(selectedForBooking?.id, dateStr)
                              
                              const isSelected = startDate === dateStr || endDate === dateStr
                              const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate
                              
                              return (
                                <button
                                  key={`day-${dayNum}`}
                                  type="button"
                                  disabled={isPast || isBooked}
                                  onClick={() => handleDateClick(dateStr)}
                                  onMouseEnter={() => setHoveredDate(dateStr)}
                                  className={cn(
                                    "py-2 text-[11px] font-black transition-all rounded-none relative border border-transparent",
                                    isPast 
                                      ? "text-outline/25 cursor-not-allowed bg-transparent" 
                                      : isBooked 
                                      ? "bg-error/15 text-error-strong border-error/20 cursor-not-allowed" 
                                      : isSelected
                                      ? "bg-primary text-on-primary font-black shadow-sm"
                                      : isInRange
                                      ? "bg-primary/20 text-[#546200]"
                                      : "bg-white hover:bg-primary/10 text-on-surface border-outline/5"
                                  )}
                                  title={isBooked ? "Obsadené" : isPast ? "Minulý dátum" : "Voľné"}
                                >
                                  {dayNum}
                                  {isBooked && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-error rounded-full"></span>
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {/* Time Pickers */}
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-outline/5">
                            <div>
                              <label className="text-[9px] font-bold uppercase text-outline block mb-1">Čas vyzdvihnutia</label>
                              <input
                                type="time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-white border border-outline/20 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            {durationMode !== '4h' && (
                              <div>
                                <label className="text-[9px] font-bold uppercase text-outline block mb-1">Čas vrátenia</label>
                                <input
                                  type="time"
                                  required
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  className="w-full bg-white border border-outline/20 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            )}
                          </div>

                          {/* Selection Summary */}
                          <div className="text-[10px] font-bold uppercase tracking-wider mt-2 text-primary-strong">
                            {startDate && !endDate && (
                              <span>Vyberte koniec prenájmu...</span>
                            )}
                            {startDate && endDate && (
                              <span>
                                Zvolené: {new Date(startDate).toLocaleDateString('sk-SK')} 
                                {durationMode === '4h' 
                                  ? ` (Na 4 hodiny o ${startTime})` 
                                  : ` až ${new Date(endDate).toLocaleDateString('sk-SK')} (Počet dní: ${calculateCost(selectedForBooking).daysCount})`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Delivery Option */}
                      <div className="pt-2 border-t border-outline/5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-outline block mb-2">Spôsob prevzatia stroja</label>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('pickup')}
                            className={cn(
                              "p-3 text-left border flex flex-col justify-between transition-all select-none",
                              deliveryMethod === 'pickup' 
                                ? "border-primary bg-primary/5 text-on-surface" 
                                : "border-outline/10 bg-white text-on-surface hover:bg-surface"
                            )}
                          >
                            <span className="font-bold text-[9px] uppercase tracking-wider block font-sans">Osobný odber</span>
                            <span className="font-black text-xs text-emerald-600 mt-1 font-sans">ZADARMO</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod('delivery')}
                            className={cn(
                              "p-3 text-left border flex flex-col justify-between transition-all select-none",
                              deliveryMethod === 'delivery' 
                                ? "border-primary bg-primary/5 text-on-surface" 
                                : "border-outline/10 bg-white text-on-surface hover:bg-surface"
                            )}
                          >
                            <span className="font-bold text-[9px] uppercase tracking-wider block font-sans">Dovoz na adresu</span>
                            <span className="font-black text-xs mt-1 font-sans">Podľa cenníka</span>
                          </button>
                        </div>

                        {deliveryMethod === 'delivery' && (
                          <div className="bg-surface border border-outline/5 p-4 space-y-4 animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-outline">Obec doručenia</label>
                                <select
                                  value={deliveryMunicipality}
                                  onChange={(e) => setDeliveryMunicipality(e.target.value)}
                                  className="w-full bg-white border border-outline/20 p-2 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                                >
                                  {activeMunicipalities.map(m => (
                                    <option key={m.name} value={m.name}>{m.name}</option>
                                  ))}
                                  <option value="other">Iná obec (km sadzba)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-outline">Kategória dovozu</label>
                                <select
                                  value={deliveryVehicle}
                                  onChange={(e) => setDeliveryVehicle(e.target.value)}
                                  className="w-full bg-white border border-outline/20 p-2 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value="car35">Dodávka do 1,5t (Ľahké dovozy)</option>
                                  <option value="hr8">Auto s HR do 8t (Ťažká technika)</option>
                                </select>
                              </div>
                            </div>

                            {deliveryMunicipality === 'other' && (
                              <div className="space-y-2 animate-in fade-in duration-200">
                                <label className="text-[9px] font-bold uppercase text-outline block">
                                  Celková vzdialenosť (km) — tam aj späť
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={deliveryDistance}
                                    onChange={(e) => setDeliveryDistance(Math.max(1, Number(e.target.value)))}
                                    className="bg-white border border-outline/20 p-2 text-xs font-bold text-on-surface w-20 outline-none focus:ring-1 focus:ring-primary"
                                  />
                                  <span className="text-[10px] text-outline font-semibold">
                                    Sadzba: {activeKmRates[deliveryVehicle].toFixed(2)} € / km (Spolu: {(deliveryDistance * activeKmRates[deliveryVehicle]).toFixed(2)} €)
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-outline/5">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-outline">Ulica a číslo domu</label>
                                <input
                                  required
                                  value={deliveryAddress}
                                  onChange={e => setDeliveryAddress(e.target.value)}
                                  className="w-full bg-white border border-outline/20 p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                                  placeholder="Ulica 123"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase text-outline">Mesto / Obec</label>
                                  <input
                                    required
                                    value={deliveryCity}
                                    onChange={e => setDeliveryCity(e.target.value)}
                                    className="w-full bg-white border border-outline/20 p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Mesto"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase text-outline">PSČ</label>
                                  <input
                                    required
                                    value={deliveryZip}
                                    onChange={e => setDeliveryZip(e.target.value)}
                                    className="w-full bg-white border border-outline/20 p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="032 14"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Accessory options if present */}
                      {selectedForBooking.accessories && selectedForBooking.accessories.length > 0 && (
                        <div className="pt-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-outline block mb-2">Odporúčame tiež</label>
                          <div className="space-y-2">
                            {selectedForBooking.accessories.map(acc => {
                              const isChecked = selectedAccIds.includes(acc.id)
                              return (
                                <label
                                  key={acc.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 border cursor-pointer select-none transition-colors",
                                    isChecked ? "bg-primary/5 border-primary" : "bg-white border-outline/10 hover:bg-surface"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedAccIds([...selectedAccIds, acc.id])
                                        } else {
                                          setSelectedAccIds(selectedAccIds.filter(id => id !== acc.id))
                                        }
                                      }}
                                      className="w-4 h-4 text-primary bg-zinc-100 border-zinc-300 focus:ring-primary rounded-none"
                                    />
                                    <span className="text-xs font-bold text-on-surface">{acc.name}</span>
                                  </div>
                                  <span className="text-xs font-black shrink-0 ml-4">
                                    +{acc.price.toFixed(2)} € {acc.flat ? '' : '/ 1mm'}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    

                    {/* Customer detail form fields */}
                    <div className="space-y-4 pt-4 border-t border-outline/5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-outline">Meno a priezvisko</label>
                          <input
                            required
                            value={inquiryData.name}
                            onChange={e => setInquiryData({ ...inquiryData, name: e.target.value })}
                            className="w-full bg-surface p-3 text-xs font-bold border-none focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Meno priezvisko"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-outline">Telefónne číslo</label>
                          <input
                            required
                            type="tel"
                            value={inquiryData.phone}
                            onChange={e => setInquiryData({ ...inquiryData, phone: e.target.value })}
                            className="w-full bg-surface p-3 text-xs font-bold border-none focus:ring-1 focus:ring-primary outline-none"
                            placeholder="+421 ..."
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-outline">E-mailová adresa</label>
                        <input
                          required
                          type="email"
                          value={inquiryData.email}
                          onChange={e => setInquiryData({ ...inquiryData, email: e.target.value })}
                          className="w-full bg-surface p-3 text-xs font-bold border-none focus:ring-1 focus:ring-primary outline-none"
                          placeholder="email@priklad.sk"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-outline">Doplňujúca poznámka</label>
                        <textarea
                          value={inquiryData.message}
                          onChange={e => setInquiryData({ ...inquiryData, message: e.target.value })}
                          className="w-full bg-surface p-3 text-xs font-medium border-none focus:ring-1 focus:ring-primary outline-none min-h-[60px] resize-none"
                          placeholder="Napr. približný čas prevzatia stroja..."
                        />
                      </div>
                    </div>

                    {/* Calculations & Pricing summary */}
                    <div className="bg-[#fdfdf7] p-5 border border-primary/20 space-y-3 mt-6">
                      <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>Nájomné ({durationMode === '4h' ? 'Do 4 hod' : `${cost.daysCount} dní`}):</span>
                        <span className="font-bold text-on-surface">{cost.rentCost.toFixed(2)} €</span>
                      </div>
                      {cost.accCost > 0 && (
                        <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                          <span>Príslušenstvo / Spotrebný materiál:</span>
                          <span className="font-bold text-on-surface">{cost.accCost.toFixed(2)} €</span>
                        </div>
                      )}
                      {cost.discount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 font-bold">
                          <span>Dlhodobá zľava ({cost.discount}%):</span>
                          <span>-{(cost.rentCost * (cost.discount / 100)).toFixed(2)} €</span>
                        </div>
                      )}
                      {deliveryMethod === 'delivery' && (
                        <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                          <span>Dovoz a odvoz stroja:</span>
                          <span className="font-bold text-on-surface">{cost.deliveryCost.toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-on-surface-variant font-medium pt-2 border-t border-outline/5">
                        <span>Vratná záloha (kaucia):</span>
                        <span className="font-black text-on-surface">{selectedForBooking.deposit} €</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t-2 border-primary/20">
                        <span className="text-xs font-black uppercase">Predbežná cena spolu:</span>
                        <span className="text-2xl font-black text-primary-strong font-sans">
                          {cost.total.toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sending || hasDateConflict()}
                      className="w-full bg-[#2d2f2b] text-primary py-5 font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                      {sending ? 'ODOSIELAM...' : 'Potvrdiť rezerváciu prenájmu'}
                    </button>
                    </>
                  )}
                </form>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Rental
