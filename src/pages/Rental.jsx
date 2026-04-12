import React, { useEffect, useState } from 'react'
import { CheckCircle, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Rental = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

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
          <div className="bg-surface-container-low p-2 flex gap-2">
            <button className="px-6 py-3 bg-[#daf900] text-[#505d00] font-bold">Všetko</button>
            <button className="px-6 py-3 text-on-surface-variant font-medium hover:bg-white transition-colors">Stroje</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
        {loading ? (
          <div className="col-span-12 py-10 text-center">Načítavam...</div>
        ) : items.length === 0 ? (
          <div className="col-span-12 py-10 text-center bg-surface-container-low">Zatiaľ žiadna technika v ponuke.</div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className={`${idx === 0 ? 'md:col-span-8' : 'md:col-span-4'} group bg-surface-container-lowest overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:bg-white border hover:border-outline-variant`}>
              <div className={`${idx === 0 ? 'md:w-1/2' : 'w-full'} relative min-h-[300px]`}>
                <img alt={item.name} className="absolute inset-0 w-full h-full object-cover" src={item.image_url || 'https://via.placeholder.com/800'} />
                {item.availability && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">Dostupné</div>
                )}
              </div>
              <div className={`p-8 ${idx === 0 ? 'md:w-1/2' : 'w-full'} flex flex-col justify-between`}>
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
                <button className="w-full bg-[#daf900] text-[#505d00] py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
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
            <h3 className="text-2xl font-bold mb-6">Rýchly dopyt</h3>
            <form className="space-y-4">
              <input className="w-full bg-surface-container-low border-none p-3 text-sm focus:ring-2 focus:ring-[#daf900]" placeholder="Meno a priezvisko" type="text" />
              <input className="w-full bg-surface-container-low border-none p-3 text-sm focus:ring-2 focus:ring-[#daf900]" placeholder="Telefón" type="tel" />
              <button className="w-full bg-[#daf900] text-[#505d00] py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity mt-4" type="button">
                Odoslať dopyt
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Rental
