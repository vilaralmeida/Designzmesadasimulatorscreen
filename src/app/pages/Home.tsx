import React from 'react';
import { DonateCTA } from '../components/DonateCTA';
import { BankrollChart } from '../components/BankrollChart';
import { UpcomingBetsTable } from '../components/UpcomingBetsTable';
import { BalanceCard } from '../components/BalanceCard';
import { BeatDuendeCard } from '../components/BeatDuendeCard';
import exampleImage from 'figma:asset/5904eb9eb72b5560bdc24189852159dc8ae88496.png';
import { AlignJustify, AlertTriangle } from 'lucide-react';

export default function Home() {

  return (
    <div className="w-full max-w-md p-4 relative z-10 overflow-x-hidden">
      {/* Header - Zé Mesada Vibe */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-3 bg-[#1A1D24] p-2 pr-4 rounded-full border-2 border-dashed border-[#FFB800] transform -rotate-2 shadow-[4px_4px_0_0_rgba(255,184,0,0.2)]">
          <div className="w-10 h-10 rounded-full border-2 border-[#FFB800] overflow-hidden bg-black">
            {/* Using a tight crop on Zé's face from the provided image */}
            <img 
              src={exampleImage} 
              alt="Zé" 
              className="w-[200%] h-[200%] max-w-none object-cover -translate-x-1/4 -translate-y-[10%]" 
            />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-[#FFB800]">Zé Mesada</h1>
            <p className="text-[9px] text-gray-400 font-bold tracking-widest">EM BUSCA DO MILAGRE</p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-[#1A1D24] border-2 border-[#4A4E58] rounded-xl rotate-3 hover:-rotate-3 transition-transform shadow-[4px_4px_0_0_#000]">
          <AlignJustify className="text-[#FFB800]" size={20} />
        </button>
      </header>

      {/* Warning / Disclaimer */}
      <div className="bg-[#FFB800] p-3 mb-6 border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] transform rotate-1 flex items-start gap-3">
        <div className="bg-black text-[#FFB800] p-1.5 rounded-lg transform -rotate-6 shrink-0 mt-0.5">
          <AlertTriangle size={20} strokeWidth={3} />
        </div>
        <div>
          <h3 className="text-black font-black uppercase text-[12px] tracking-wider leading-tight mb-1">
            Jogo de Simulação!
          </h3>
          <p className="text-black/80 font-black text-[9.5px] uppercase tracking-widest leading-tight">
            Nenhum dinheiro real é usado. As apostas são iguais ao Duende: <span className="text-black bg-black/10 px-1 py-0.5 rounded">SÓ IMAGINÁRIAS!</span>
          </p>
        </div>
      </div>

      <BeatDuendeCard />

      <UpcomingBetsTable />

      <DonateCTA />

      <BalanceCard />

      <BankrollChart />
    </div>
  );
}
