import React, { useEffect, useState } from 'react'
import { CheckCircle, Info, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const Rental = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState(['Všetko'])
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [inquiryData, setInquiryData] = useState({ 
    name: '', phone: '', item: '', startDate: '', endDate: '' 
  })
  const [sending, setSending] = useState(false)
  const [selectedForBooking, setSelectedForBooking] = useState(null)

  const handleInquiry = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { error } = await supabase.from('inquiries').insert([{
        name: inquiryData.name,
        email: inquiryData.email,
        message: `ZÁUJEM O PRENÁJOM: ${inquiryData.item}\nTERMÍN: ${inquiryData.startDate} až ${inquiryData.endDate}\nTELEFÓN: ${inquiryData.phone}\nPOZNÁMKA: ${inquiryData.message || 'Žiadna'}`,
      }])
      if (error) throw error
      setSelectedForBooking(null)
      alert('Dopyt bol odoslaný! Budeme vás čoskoro kontaktovať.')
      setInquiryData({ name: '', phone: '', item: '', startDate: '', endDate: '' })
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    fetchRentals()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('type', 'rental')
      .order('name')
    if (data) setCategories(['Všetko', ...data.map(c => c.name)])
  }

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching rentals:', error.message)
    } finally {
      setLoading(false)
    }
  }


  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'Všetko' || (item.category || 'Iné') === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#fcfcf8]">
      {/* Header Section */}
      <section className="bg-white border-b border-outline/5 py-16 px-8 mb-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <span className="text-primary-strong font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Profesionálna technika</span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">POŽIČOVŇA <br className="hidden md:block"/> ĽUBEĽA</h1>
              <p className="text-lg text-on-surface-variant font-medium max-w-xl border-l-4 border-primary pl-6">
                Špičkové stroje pre zemné práce, hutnenie a špecializované stavebné úkony. Všetko s pravidelným servisom.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 w-full lg:w-auto">
               <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Hľadať v ponuke..." 
                    className="w-full lg:w-80 bg-surface p-5 pl-12 text-sm font-bold uppercase tracking-widest border-b-2 border-outline/10 focus:border-primary outline-none transition-all group-hover:bg-white"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-5 text-outline/40 group-hover:text-primary transition-colors" size={20} />
               </div>
               <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                   <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedCategory === cat ? "bg-primary text-on-primary shadow-lg" : "bg-white border border-outline/10 hover:border-primary"
                    )}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="aspect-[4/5] bg-surface animate-pulse"></div>)
          ) : filteredItems.length === 0 ? (
             <div className="col-span-full py-32 text-center bg-white border border-dashed border-outline/20">
                <Info size={48} className="mx-auto mb-4 text-outline/30" />
                <p className="font-black uppercase tracking-widest text-[#546200]">Nenašli sme žiadnu techniku</p>
             </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="group bg-white flex flex-col h-full border border-outline/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                 <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                   <img 
                    src={item.image_url || 'https://via.placeholder.com/800'} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                     {item.availability && (
                       <span className="bg-emerald-500 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Dostupné
                       </span>
                     )}
                     <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-md">
                       {item.category || 'Technika'}
                     </span>
                   </div>

                   <div className="absolute bottom-4 right-4 bg-primary text-on-primary p-4 shadow-xl -mb-20 group-hover:mb-0 transition-all duration-500">
                      <span className="block text-[8px] font-black uppercase opacity-60">Cena / Deň</span>
                      <span className="text-xl font-black">{item.daily_price}€</span>
                   </div>
                 </div>

                 <div className="p-8 flex-grow flex flex-col">
                    <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{item.name}</h3>
                    <div className="space-y-3 mb-10 opacity-70">
                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle size={14} className="text-primary-strong" /> Profesionálny servis
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle size={14} className="text-primary-strong" /> Okamžitý odber
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => { 
                        console.log('Booking item:', item.name);
                        setSelectedForBooking(item); 
                        setInquiryData({ ...inquiryData, item: item.name }); 
                      }}
                      className="mt-auto w-full border-2 border-on-surface p-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-on-surface hover:text-white transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Rezervovať techniku
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedForBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 relative shadow-2xl">
              <button 
                onClick={() => setSelectedForBooking(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white text-on-surface hover:bg-primary transition-colors"
              ><X size={24}/></button>

              <div className="relative h-64 md:h-full overflow-hidden bg-surface">
                 <img src={selectedForBooking.image_url} alt="" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-primary/10"></div>
                 <div className="absolute bottom-10 left-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 decoration-primary decoration-2 underline underline-offset-4">Požiadavka na prenájom</span>
                    <h2 className="text-4xl font-black tracking-tighter mt-4 max-w-xs">{selectedForBooking.name}</h2>
                 </div>
              </div>

              <div className="p-8 md:p-12">
                 <h3 className="text-xl font-black uppercase tracking-widest mb-8 border-b-4 border-primary inline-block">Rezervačný formulár</h3>
                 <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-outline">Vaše meno</label>
                         <input 
                          required 
                          className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold" 
                          placeholder="JOZEF MRKVIČKA" 
                          value={inquiryData.name} 
                          onChange={e => setInquiryData({...inquiryData, name: e.target.value.toUpperCase()})}
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-outline">E-mail</label>
                         <input 
                          required type="email"
                          className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold" 
                          placeholder="EMAIL@PRIKLAD.SK" 
                          value={inquiryData.email || ''} 
                          onChange={e => setInquiryData({...inquiryData, email: e.target.value})}
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-outline">Telefón</label>
                         <input 
                          required 
                          className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-sm font-bold" 
                          placeholder="+421 ..." 
                          type="tel"
                          value={inquiryData.phone} 
                          onChange={e => setInquiryData({...inquiryData, phone: e.target.value})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-outline">Od dátumu</label>
                            <input 
                              required type="date"
                              className="w-full bg-surface p-2 text-xs font-bold border-none focus:ring-1 focus:ring-primary" 
                              value={inquiryData.startDate} 
                              onChange={e => setInquiryData({...inquiryData, startDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-outline">Do dátumu</label>
                            <input 
                              required type="date"
                              className="w-full bg-surface p-2 text-xs font-bold border-none focus:ring-1 focus:ring-primary" 
                              value={inquiryData.endDate} 
                              onChange={e => setInquiryData({...inquiryData, endDate: e.target.value})}
                            />
                          </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-outline">Poznámka / Špecifikácia</label>
                       <textarea 
                        className="w-full bg-surface p-4 border-none focus:ring-1 focus:ring-primary text-xs font-medium min-h-[80px]" 
                        placeholder="Miesto dodania, špeciálne požiadavky..." 
                        value={inquiryData.message || ''} 
                        onChange={e => setInquiryData({...inquiryData, message: e.target.value})}
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={sending}
                      className="w-full bg-primary text-on-primary py-5 font-black uppercase tracking-[0.2em] hover:bg-[#daf900] transition-all disabled:opacity-50 shadow-xl active:scale-[0.98]"
                    >
                      {sending ? 'ODOSIELAM...' : 'POTVRDIŤ ZÁUJEM O PRENÁJOM'}
                    </button>
                    <p className="text-[8px] text-center font-bold uppercase opacity-40 leading-relaxed">
                      Odoslaním dopytu súhlasíte so spracovaním osobných údajov.<br/>Naši pracovníci vás budú kontaktovať pre overenie dostupnosti.
                    </p>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default Rental
