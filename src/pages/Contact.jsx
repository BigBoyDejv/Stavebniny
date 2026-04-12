import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([formData])
      
      if (error) throw error
      setSent(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      alert('Chyba pri odosielaní: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-24">
      <section className="max-w-[1440px] mx-auto px-8 mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight text-on-surface mb-12">Kontaktujte nás</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-[500px] bg-surface-container-low relative grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg1P9Wci8iVrydUk9grGm1nrHnkBHbv_nOSEhZMkqBJOF2s0xS6nRu3a7KSq1-rMg9TDRPT3HptSmYOk9Oi4cQxxxi46KaMFvoSMMMWA3yLohQGxyu0mArTCUKaAjCNNSqgz9OGLAscG0NbxzkutsceQYTk-TX517XKoa0ARhTdHYP3iem-SLqoTaJN0IsJqkLpFsCSzyofxZYKHWdLZev-3R22n14wO8FqfjrWJFIXBE1VcyMiR5NuGgP1JZ1cYhqVqVzHU7s5n8D" alt="Map" className="w-full h-full object-cover" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary p-3 rounded-full shadow-2xl">
                <MapPin className="text-on-primary" size={24} />
             </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-8 flex flex-col justify-between flex-grow">
              <div>
                <Phone className="text-[#546200] mb-4" />
                <h3 className="font-headline text-xl font-semibold mb-2">Zavolajte nám</h3>
                <p className="text-on-surface-variant font-body mb-4">Radi vám poradíme s výberom materiálu.</p>
                <a className="text-2xl font-bold text-[#546200]" href="tel:+421905123456">+421 905 123 456</a>
              </div>
            </div>
            <div className="bg-primary p-8 rounded-xl text-on-primary">
              <Mail className="mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2">Napíšte nám</h3>
              <p className="opacity-90 font-body mb-4">Vybavíme vaše dopyty do 24 hodín.</p>
              <a className="text-lg font-semibold underline" href="mailto:info@stavebninylubela.sk">info@stavebninylubela.sk</a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 bg-white p-10 border border-outline-variant">
          <h2 className="font-headline text-3xl font-bold mb-8">Kontaktný formulár</h2>
          {sent ? (
            <div className="p-6 bg-emerald-50 text-emerald-700 border border-emerald-200">
               Vaša správa bola úspešne odoslaná. Budeme vás kontaktovať.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                className="w-full bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20" 
                placeholder="Meno" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input 
                className="w-full bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20" 
                placeholder="E-mail" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <textarea 
                className="w-full bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20 md:col-span-2" 
                placeholder="Vaša správa" 
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#2d2f2b] text-primary px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Odosielam...' : 'Odoslať dopyt'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-surface-container-low p-8">
          <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="text-[#546200]" />
            Otváracie hodiny
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-outline-variant/20 pb-2"><span>Pon - Pia</span> <span>07:00 – 16:30</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-2"><span>Sobota</span> <span>07:30 – 12:00</span></div>
            <div className="flex justify-between text-error font-bold"><span>Nedeľa</span> <span>Zatvorené</span></div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
