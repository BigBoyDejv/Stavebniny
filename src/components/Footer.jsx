import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[#1a1b1a] w-full pt-16 pb-8 text-[#adaea7] border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <img src="/Logo.png" alt="Logo" className="h-8 brightness-0 invert opacity-80" />
            <span className="text-white font-black tracking-tighter text-lg uppercase">
              Stavebniny <span className="text-primary">Ľubeľa</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs mb-6">
            Váš spoľahlivý partner pre hrubú stavbu, sádrokartónové systémy a záhradné riešenia už od roku 2026.
          </p>
        </div>

        <div>
           <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Navigácia</h4>
           <ul className="space-y-3 flex flex-col">
             <Link className="text-xs hover:text-white transition-colors" to="/">Domov</Link>
             <Link className="text-xs hover:text-white transition-colors" to="/katalog">Katalóg materiálov</Link>
             <Link className="text-xs hover:text-white transition-colors" to="/kontakt">Kontakt</Link>
             <Link className="text-xs hover:text-white transition-colors" to="/admin">Partner Portál</Link>
           </ul>
        </div>

        <div>
           <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Právne info</h4>
           <ul className="space-y-3 flex flex-col">
             <Link className="text-xs hover:text-white transition-colors" to="/gdpr">Ochrana údajov (GDPR)</Link>
             <Link className="text-xs hover:text-white transition-colors" to="/obchodne-podmienky">Obchodné podmienky</Link>
             <Link className="text-xs hover:text-white transition-colors" to="/doprava-a-platba">Doprava a platba</Link>
           </ul>
        </div>

        <div>
           <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">Kontakt</h4>
           <ul className="space-y-4">
             <li className="flex items-start gap-3 mt-1">
               <MapPin size={16} className="text-primary shrink-0" />
               <div className="text-xs leading-none">
                 <strong className="text-white block mb-1">Staviválubela s.r.o.</strong>
                 Ľubeľa 419, 032 14 Ľubeľa
               </div>
             </li>
             <li className="flex items-center gap-3">
               <Phone size={16} className="text-primary shrink-0" />
               <a href="tel:+421903434495" className="text-xs hover:text-white transition-colors">+421 903 434 495</a>
             </li>
             <li className="flex items-center gap-3">
               <Mail size={16} className="text-primary shrink-0" />
               <a href="mailto:kubik@stavivalubela.sk" className="text-xs hover:text-white transition-colors">kubik@stavivalubela.sk</a>
             </li>
           </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
           IČO: 52 079 716  |  IČ DPH: SK2120884161
        </div>
        <div className="text-primary font-headline text-[10px] uppercase tracking-widest font-black">
          © {new Date().getFullYear()} STAVEBNINY ĽUBEĽA. VŠETKY PRÁVA VYHRADENÉ.
        </div>
      </div>
    </footer>
  )
}

export default Footer
