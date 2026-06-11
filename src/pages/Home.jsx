import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'
import { Editable } from '../components/Editable'

const Home = () => {
  const { settings } = useSettings()

  const formatTitle = (titleText) => {
    if (!titleText) return ""
    const parts = titleText.split(/(\[[^\]]+\])/g)
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const word = part.slice(1, -1)
        return (
          <span key={index} className="bg-gradient-to-r from-primary via-[#daf900] to-white bg-clip-text text-transparent">
            {word}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <Editable
        settingKey="home_hero_bg"
        value={settings.home_hero_bg}
        type="image"
        label="Hero Pozadie"
        as="section"
        className="relative h-[80vh] flex items-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src={settings.home_hero_bg}
            alt="Hero Warehouse"
          />
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block font-label text-[0.75rem] font-bold text-primary uppercase tracking-[0.3em] mb-6 border-b-2 border-primary/30 pb-1">Stavebniny Ľubeľa</span>
            <Editable settingKey="home_hero_title" value={settings.home_hero_title} type="text" label="Hero Nadpis">
              <h1 className="font-headline text-5xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
                {formatTitle(settings.home_hero_title)}
              </h1>
            </Editable>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/materialy" className="bg-primary text-on-primary px-8 py-4 font-label font-bold tracking-wide flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                Nakupovať materiál
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/pozicovna" className="tertiary-gradient text-on-tertiary px-8 py-4 font-label font-bold tracking-wide flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                Požičať techniku
                <span className="material-symbols-outlined">construction</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </Editable>

      {/* Trust Signals */}
      <section className="bg-surface-container-low py-12">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: 'local_shipping', title: 'Rýchla doprava', desc: 'Doručíme priamo na stavbu' },
              { icon: 'support_agent', title: 'Odborné poradenstvo', desc: '25+ rokov skúseností' },
              { icon: 'verified', title: 'Kvalitné materiály', desc: 'Certifikovaní dodávatelia' },
              { icon: 'calendar_today', title: 'Požičovňa 24/7', desc: 'Online rezervácia termínu' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container">{item.icon}</span>
                </div>
                <div>
                  <p className="font-headline font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories (Static Grid for Home) */}
      <section className="py-24 max-w-[1440px] mx-auto px-8">
        <div className="mb-16">
          <span className="font-label text-[0.75rem] font-semibold text-on-primary-container uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Naša Ponuka</span>
          <h2 className="font-headline text-4xl font-semibold mt-4">Materiály pre váš projekt</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-rows-2 gap-4 md:gap-6 min-h-[500px] md:h-[700px]">
          <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest overflow-hidden group cursor-pointer relative aspect-square md:aspect-auto">
            <Editable settingKey="home_cat_hruba" value={settings.home_cat_hruba} type="image" label="Kategória: Hrubá stavba" className="w-full h-full">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={settings.home_cat_hruba} alt="Hrubá stavba" />
            </Editable>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none">
              <h3 className="text-white font-headline text-xl md:text-2xl font-bold">Hrubá stavba</h3>
              <p className="text-zinc-200 text-xs md:text-sm mt-2">Tehly, tvárnice, izolácie a ocel.</p>
              <div className="w-12 h-1 bg-primary mt-4 transform origin-left transition-transform group-hover:scale-x-150"></div>
            </div>
          </div>
          <div className="md:col-span-2 bg-surface-container-lowest overflow-hidden group cursor-pointer relative aspect-[16/9] md:aspect-auto">
            <Editable settingKey="home_cat_sucha" value={settings.home_cat_sucha} type="image" label="Kategória: Suchá výstavba" className="w-full h-full">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={settings.home_cat_sucha} alt="Suchá výstavba" />
            </Editable>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none">
              <h3 className="text-white font-headline text-lg md:text-xl font-bold">Suchá výstavba</h3>
              <p className="text-zinc-200 text-xs md:text-sm mt-2">Sádrokartón a omietky.</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest overflow-hidden group cursor-pointer relative aspect-square md:aspect-auto">
            <Editable settingKey="home_cat_zahrada" value={settings.home_cat_zahrada} type="image" label="Kategória: Záhrada" className="w-full h-full">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={settings.home_cat_zahrada} alt="Záhrada" />
            </Editable>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
              <h3 className="text-white font-headline text-lg font-bold">Záhrada</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest overflow-hidden group cursor-pointer relative aspect-square md:aspect-auto">
            <Editable settingKey="home_cat_farby" value={settings.home_cat_farby} type="image" label="Kategória: Farby a laky" className="w-full h-full">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={settings.home_cat_farby} alt="Farby a laky" />
            </Editable>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
              <h3 className="text-white font-headline text-lg font-bold">Farby a laky</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-[1440px] mx-auto px-8 pb-24">
        <div className="bg-primary p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 -mr-32 -mt-32"></div>
          <h2 className="font-headline text-3xl md:text-5xl font-black text-on-primary mb-6 relative z-10">PRIPRAVENÍ ZAČAŤ STAVAŤ?</h2>
          <p className="text-on-primary-container text-lg mb-10 max-w-2xl mx-auto relative z-10 font-medium">
            Navštívte nás v Ľubeli alebo si vyžiadajte cenovú ponuku online. Sme tu pre vás každý pracovný deň.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/kontakt" className="bg-on-primary text-primary px-8 py-4 font-label font-bold tracking-wide hover:bg-zinc-800 transition-colors">Získať cenovú ponuku</Link>
            <Link to="/materialy" className="border-2 border-on-primary text-on-primary px-8 py-4 font-label font-bold tracking-wide hover:bg-on-primary hover:text-primary transition-colors">Prejsť do e-shopu</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
