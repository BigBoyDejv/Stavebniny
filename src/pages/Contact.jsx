import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, Smartphone, User, HelpCircle, ArrowRight, ShieldCheck, Headphones } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'Všeobecný dopyt', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([{
          ...formData,
          message: `PREDMET: ${formData.subject}\nINFO: ${formData.message}\nTELEFÓN: ${formData.phone || 'N/A'}`
        }])

      if (error) throw error
      setSent(true)
      setFormData({ name: '', email: '', phone: '', subject: 'Všeobecný dopyt', message: '' })
    } catch (error) {
      alert('Chyba pri odosielaní: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const subjects = [
    'Stavebné materiály',
    'Požičovňa náradia',
    'Miešacie centrum farieb',
    'Technické poradenstvo',
    'Cenová ponuka',
    'Iné'
  ]

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">

        {/* Header Section */}
        <header className="mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-outline pb-12">
            <div className="max-w-4xl">
              <span className="text-primary-strong font-black uppercase tracking-[0.4em] text-[10px] mb-6 block border-l-4 border-primary pl-4">Konzultácie & Expertíza</span>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
                PROFESIONÁLNA <br /> <span className="text-gradient">PODPORA</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl leading-relaxed">
                Sme tu, aby sme vám pomohli s každým technickým detailom vášho projektu. Od výberu materiálu až po logistiku na stavbe.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <div className="bg-on-surface text-primary p-5 rounded-full">
                  <Headphones size={32} />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase text-outline tracking-widest mb-1">TECHNICKÁ LINKA</span>
                  <a href="tel:+421903434495" className="text-3xl font-black tracking-tighter hover:text-primary-strong transition-colors">+421 903 434 495</a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Left Column: Form & Call to Actions */}
          <div className="lg:col-span-7 space-y-16">
            <section className="bg-white border border-outline p-8 lg:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>

              <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                <Send className="text-primary-strong" /> KONZULTAČNÝ FORMULÁR
              </h2>

              {sent ? (
                <div className="py-20 text-center space-y-8">
                  <CheckCircle size={80} className="mx-auto text-primary-strong" />
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">ĎAKUJEME ZA DOPYT!</h3>
                    <p className="text-on-surface-variant font-bold uppercase text-xs tracking-widest">Budeme vás kontaktovať v priebehu 24 hodín.</p>
                  </div>
                  <button onClick={() => setSent(false)} className="btn-primary mx-auto">POSLAŤ ĎALŠIU SPRÁVU</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase text-on-surface/40 tracking-widest group-focus-within:text-primary transition-colors">VÁŠ DOPYT SA TÝKA</label>
                      <select
                        className="w-full bg-transparent p-4 border-b-2 border-outline focus:border-primary transition-all outline-none text-sm font-black uppercase tracking-widest cursor-pointer"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase text-on-surface/40 tracking-widest group-focus-within:text-primary transition-colors">VAŠE CELÉ MENO</label>
                      <input
                        required
                        className="w-full bg-transparent p-4 border-b-2 border-outline focus:border-primary transition-all outline-none text-xl font-black uppercase tracking-tight"
                        placeholder="NAPÍŠTE SEM..."
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase text-on-surface/40 tracking-widest group-focus-within:text-primary transition-colors">E-MAILOVÁ ADRESA</label>
                      <input
                        required type="email"
                        className="w-full bg-transparent p-4 border-b-2 border-outline focus:border-primary transition-all outline-none text-xl font-black tracking-tight"
                        placeholder="VAŠA@ADRESA.SK"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase text-on-surface/40 tracking-widest group-focus-within:text-primary transition-colors">TELEFÓNNE ČÍSLO</label>
                      <input
                        required
                        className="w-full bg-transparent p-4 border-b-2 border-outline focus:border-primary transition-all outline-none text-xl font-black tracking-tight"
                        placeholder="+421 9XX XXX XXX"
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase text-on-surface/40 tracking-widest group-focus-within:text-primary transition-colors">ŠPECIFIKÁCIA DOPYTU / PROJEKTU</label>
                    <textarea
                      required
                      className="w-full bg-surface p-8 border-none focus:ring-2 focus:ring-primary outline-none text-sm font-medium min-h-[200px] resize-none"
                      placeholder="Popíšte nám detaily vášho dopytu, množstvá alebo technické požiadavky..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className="pt-10">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-on-surface text-primary py-10 font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-on-surface transition-all disabled:opacity-50 shadow-2xl active:scale-[0.98] text-sm flex items-center justify-center gap-6"
                    >
                      {loading ? 'ODOSIELAM...' : (
                        <>
                          ODOSLAŤ DOPYT KONZULTÁCIE <ArrowRight size={24} />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center font-black uppercase tracking-widest opacity-30 mt-8 leading-relaxed">
                      Zabezpečená komunikácia • Odpoveď do 24 hodín • Bezplatná cenová ponuka
                    </p>
                  </div>
                </form>
              )}
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <a
                href="https://wa.me/421903434495"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-10 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors group"
              >
                <MessageSquare size={32} className="mb-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest opacity-80 mb-2 uppercase">RÝCHLA SPRÁVA</span>
                <h3 className="text-2xl font-black uppercase tracking-tighter">WHATSAPP CHAT</h3>
              </a>
              <div className="flex flex-col p-10 bg-on-surface text-primary">
                <ShieldCheck size={32} className="mb-6" />
                <span className="text-[10px] font-black tracking-widest opacity-80 mb-2 uppercase">GARANCIA KVALITY</span>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">CERTIFIKOVANÉ ODBORNÉ PORADENSTVO</h3>
              </div>
            </div>
          </div>

          {/* Right Column: Branch Info & Map */}
          <div className="lg:col-span-5 space-y-16">
            <section className="space-y-10 focus-within:ring-2 ring-primary transition-all">
              <div className="aspect-[4/3] w-full bg-white border border-outline overflow-hidden relative grayscale-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2613.567156942416!2d19.4795248!3d49.0514138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4715f5d83a1548fb%3A0x63351ec85e821810!2sStavebniny%20%C4%BDube%C4%BEa!5e0!3m2!1sen!2ssk!4v1712920000000!5m2!1sen!2ssk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-strong flex items-center gap-4">
                    <MapPin size={18} /> HLAVNÁ PREDAJŇA
                  </h4>
                  <div className="text-4xl font-black tracking-tighter uppercase leading-none">
                    ĽUBEĽA 419 <br /> 032 14 ĽUBEĽA
                  </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-outline">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-strong flex items-center gap-4">
                    <Clock size={18} /> OTVÁRACIE HODINY
                  </h4>
                  <div className="space-y-4">
                    {[
                      { day: 'PONDELOK - PIATOK', time: '07:00 - 12:00, 12:30 - 16:30' },
                      { day: 'SOBOTA', time: '07:00 - 11:00' },
                      { day: 'NEDEĽA', time: 'ZATVORENÉ', status: 'closed' }
                    ].map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-black tracking-widest">
                        <span className="opacity-40">{h.day}</span>
                        <span className={cn(h.status === 'closed' ? "text-error" : "text-on-surface")}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-8 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-strong">FAKTURAČNÉ ÚDAJE</h4>
                  <div className="grid grid-cols-1 gap-6 text-[11px] font-black tracking-widest uppercase">
                    <div>
                      <span className="block opacity-40 mb-1">OBCHODNÉ MENO</span>
                      STAVIVÁLUBELA S.R.O.
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block opacity-40 mb-1">IČO</span>
                        52 079 716
                      </div>
                      <div>
                        <span className="block opacity-40 mb-1">IČ DPH</span>
                        SK2120884161
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

