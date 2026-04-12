import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

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
          <div className="lg:col-span-8 h-[500px] bg-surface-container-low relative grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border border-outline/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2613.567156942416!2d19.4795248!3d49.0514138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4715f5d83a1548fb%3A0x63351ec85e821810!2sStavebniny%20%C4%BDube%C4%BEa!5e0!3m2!1sen!2ssk!4v1712920000000!5m2!1sen!2ssk" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="filter contrast-125 brightness-105"
              ></iframe>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 border border-outline/10 shadow-lg text-[10px] font-black uppercase tracking-widest hidden md:block">
                 GPS: 49.0514138, 19.4795248
              </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-8 flex flex-col justify-between flex-grow">
              <div>
                <Phone className="text-[#546200] mb-4" />
                <h3 className="font-headline text-xl font-semibold mb-2">Zavolajte nám</h3>
                <p className="text-on-surface-variant font-body mb-4 text-xs">V prípade otázok nás neváhajte kontaktovať.</p>
                <div className="flex flex-col gap-2">
                  <a className="text-xl font-bold text-[#546200]" href="tel:+421903434495">+421 903 434 495</a>
                  <a className="text-xl font-bold text-[#546200]" href="tel:+421919495141">+421 919 495 141</a>
                </div>
              </div>
            </div>
            <div className="bg-primary p-8 text-on-primary">
              <Mail className="mb-4" />
              <h3 className="font-headline text-xl font-semibold mb-2 text-on-primary">Napíšte nám</h3>
              <p className="opacity-90 font-body mb-4 text-xs">Vybavíme vaše dopyty čo najskôr.</p>
              <a className="text-lg font-bold underline text-on-primary" href="mailto:kubik@stavivalubela.sk">kubik@stavivalubela.sk</a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 bg-white p-6 md:p-10 border border-outline-variant">
          <h2 className="font-headline text-3xl font-bold mb-8">Fakturačné údaje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-on-surface-variant uppercase tracking-wider text-xs font-bold leading-loose">
            <div>
              <p className="text-primary-strong mb-2">Sídlo spoločnosti</p>
              <p className="text-on-surface text-lg">Staviválubela s.r.o.</p>
              <p>Ľubeľa 419</p>
              <p>032 14 Ľubeľa</p>
            </div>
            <div>
              <p className="text-primary-strong mb-2">Identifikácia</p>
              <p>IČO: 52 079 716</p>
              <p>IČ DPH: SK2120884161</p>
              <p>Sme platcami DPH</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-8">
          <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="text-[#546200]" />
            Otváracie hodiny
          </h3>
          <div className="space-y-3 text-sm font-medium">
             {[
               { day: 'Pon - Pia', time: '7:00-12:00, 12:30-16:30' },
               { day: 'Sobota', time: '7:00 – 11:00' },
               { day: 'Nedeľa', time: 'Zatvorené' }
             ].map((item, idx) => (
               <div key={idx} className={cn(
                 "flex justify-between border-b border-outline-variant/10 pb-2",
                 item.day === 'Nedeľa' ? "text-error font-bold" : "text-on-surface"
               )}>
                 <span className="opacity-60">{item.day}</span>
                 <span>{item.time}</span>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
