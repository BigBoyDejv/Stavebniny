import React, { useEffect, useState } from 'react'
import { CheckCircle, Info, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const Rental = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Všetko')
  const [searchQuery, setSearchQuery] = useState('')
  const [inquiryData, setInquiryData] = useState({ 
    name: '', phone: '', item: '', startDate: '', endDate: '' 
  })
  const [sending, setSending] = useState(false)

  const handleInquiry = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { error } = await supabase.from('inquiries').insert([{
        name: inquiryData.name,
        message: `Záujem o prenájom: ${inquiryData.item || 'Všeobecný dopyt'}.\nTermín: ${inquiryData.startDate} do ${inquiryData.endDate}.\nTelefón: ${inquiryData.phone}`,
        email: 'rental@lubela.sk' // Fallback
      }])
      if (error) throw error
      alert('Váš dopyt bol odoslaný. Budeme vás kontaktovať s cenovou ponukou a potvrdením termínu.')
      setInquiryData({ name: '', phone: '', item: '', startDate: '', endDate: '' })
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching rentals:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Všetko', ...new Set(items.map(i => i.category || 'Ostatné'))]

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'Všetko' || (item.category || 'Ostatné') === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto w-full">
      <section className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="uppercase tracking-[0.1em] text-[#546200] font-bold text-xs mb-3 block">Profesionálne vybavenie</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">Požičovňa techniky Ľubeľa</h1>
            <p className="text-lg text-on-surface-variant max-w-xl">
              Ponúkame prémiové stavebné stroje a náradie pre vaše projekty. Od ťažkých bagrov po precízne ručné náradie.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Hľadať techniku..." 
                className="bg-surface-container-low border-none py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#daf900] w-full sm:w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-outline/50" size={16} />
            </div>
            <div className="bg-surface-container-low p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0",
                    selectedCategory === cat ? "bg-[#daf900] text-[#505d00]" : "text-on-surface-variant hover:bg-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
        {loading ? (
          <div className="col-span-12 py-20 text-center">
             <div className="animate-spin w-10 h-10 border-4 border-[#daf900] border-t-transparent inline-block rounded-full mb-4"></div>
             <p className="font-bold uppercase tracking-widest text-xs">Načítavam ponuku...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-12 py-20 text-center bg-surface-container-low">
             <Info className="mx-auto mb-4 text-outline" />
             <p className="font-bold uppercase tracking-widest text-xs">Žiadna technika nezodpovedá vašim kritériám.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div key={item.id} className={`${idx === 0 && filteredItems.length > 2 ? 'md:col-span-8' : 'md:col-span-4'} group bg-white overflow-hidden flex flex-col md:flex-row transition-all duration-300 border border-outline/5 hover:border-primary-strong/20 hover:shadow-xl`}>
              <div className={`${idx === 0 && filteredItems.length > 2 ? 'md:w-1/2' : 'w-full'} relative min-h-[300px]`}>
                <img alt={item.name} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={item.image_url || 'https://via.placeholder.com/800'} />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   {item.availability && (
                     <div className="bg-[#daf900] text-[#505d00] px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg">Dostupné</div>
                   )}
                   <div className="bg-black/80 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{item.category || 'Všeobecné'}</div>
                </div>
              </div>
              <div className={`p-8 ${idx === 0 && filteredItems.length > 2 ? 'md:w-1/2' : 'w-full'} flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                      <p className="text-on-surface-variant text-sm font-medium">Stroj / Zariadenie</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#546200]">{item.daily_price}€</span>
                      <span className="text-xs text-on-surface-variant block">/ deň</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2 font-medium tracking-tight"><CheckCircle size={16} className="text-[#546200]" /> Profesionálny stav</li>
                    <li className="flex items-center gap-2 font-medium tracking-tight"><CheckCircle size={16} className="text-[#546200]" /> Pravidelný servis</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setInquiryData({ ...inquiryData, item: item.name }); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                  className="w-full bg-[#daf900] text-[#505d00] py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
                >
                  Rezervovať
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="bg-surface-container-low p-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-8">Pravidlá prenájmu</h2>
            <div className="space-y-6 text-on-surface-variant">
              <p>Fyzické osoby: OP + druhý doklad.</p>
              <p>Firmy: Výpis z ORSR a poverenie k prevzatiu.</p>
              <p>Pri každom prenájme sa skladá finančná kaucia.</p>
            </div>
          </div>
          <div className="bg-white p-8 border border-outline-variant">
            <h3 className="text-2xl font-bold mb-6">Rýchly dopyt {inquiryData.item && `- ${inquiryData.item}`}</h3>
            <form onSubmit={handleInquiry} className="space-y-4">
              <input 
                required 
                className="w-full bg-surface-container-low border-b border-outline/10 p-4 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all" 
                placeholder="Meno a priezvisko" 
                type="text" 
                value={inquiryData.name} 
                onChange={e => setInquiryData({...inquiryData, name: e.target.value})} 
              />
              <input 
                required 
                className="w-full bg-surface-container-low border-b border-outline/10 p-4 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all" 
                placeholder="Telefónne číslo" 
                type="tel" 
                value={inquiryData.phone} 
                onChange={e => setInquiryData({...inquiryData, phone: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-outline pl-1">Od dátumu</label>
                   <input 
                    required 
                    className="w-full bg-surface-container-low border-b border-outline/10 p-4 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all" 
                    type="date" 
                    value={inquiryData.startDate} 
                    onChange={e => setInquiryData({...inquiryData, startDate: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-outline pl-1">Do dátumu</label>
                   <input 
                    required 
                    className="w-full bg-surface-container-low border-b border-outline/10 p-4 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all" 
                    type="date" 
                    value={inquiryData.endDate} 
                    onChange={e => setInquiryData({...inquiryData, endDate: e.target.value})} 
                  />
                </div>
              </div>
              <button disabled={sending} className="w-full bg-primary text-on-primary py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#daf900] hover:text-[#505d00] transition-all mt-4 disabled:opacity-50 shadow-lg active:scale-[0.98]">
                {sending ? 'ODOSIELAM...' : 'Odoslať nezáväzný dopyt'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Rental
