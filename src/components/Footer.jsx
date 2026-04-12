import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-[#2d2f2b] w-full py-12">
      <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-[#adaea7]">
        <div className="flex flex-col md:flex-row gap-8 mb-8 md:mb-0">
          <Link className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" to="/gdpr">Ochrana údajov</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" to="/obchodne-podmienky">Obchodné podmienky</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" to="/doprava-a-platba">Doprava a platba</Link>
        </div>
        <div className="text-[#daf900] font-headline text-[10px] uppercase tracking-widest">
          © 2024 STAVEBNINY ĽUBEĽA. VŠETKY PRÁVA VYHRADENÉ.
        </div>
      </div>
    </footer>
  )
}

export default Footer
