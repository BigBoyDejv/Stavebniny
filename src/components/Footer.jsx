import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#2d2f2b] w-full py-12">
      <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-[#adaea7]">
        <div className="flex flex-col md:flex-row gap-8 mb-8 md:mb-0">
          <a className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" href="#">Ochrana údajov</a>
          <a className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" href="#">Obchodné podmienky</a>
          <a className="font-headline text-[10px] uppercase tracking-widest hover:text-white transition-colors" href="#">Doprava</a>
        </div>
        <div className="text-[#daf900] font-headline text-[10px] uppercase tracking-widest">
          © 2024 STAVEBNINY ĽUBEĽA. VŠETKY PRÁVA VYHRADENÉ.
        </div>
      </div>
    </footer>
  )
}

export default Footer
