import React from 'react';
import { AlertOctagon, TrendingDown } from 'lucide-react';

export const BalanceCard = () => {
  return (
    <div className="relative mb-8 transform rotate-1">
      {/* Tape effect top */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-900/40 backdrop-blur-sm -rotate-3 z-10" 
        style={{ clipPath: 'polygon(5% 0%, 95% 5%, 90% 95%, 10% 100%)' }} 
      />
      
      <div className="bg-[#1a1414] border-4 border-dashed border-[#FF4B4B] rounded-2xl p-6 shadow-[6px_6px_0_0_#000]">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-[#FF4B4B]">
            <AlertOctagon size={16} className="animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest">Saldo na Pindaíba</h2>
          </div>
          <span className="text-xs font-black text-[#FF4B4B] bg-[#2A1515] px-2 py-1 rounded border-2 border-[#FF4B4B]/50 flex items-center gap-1 shadow-[2px_2px_0_0_rgba(255,75,75,0.3)]">
            <TrendingDown size={14} /> -87%
          </span>
        </div>
        
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[#FF4B4B] text-2xl font-black">R$</span>
          <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md decoration-4 decoration-[#FF4B4B]">14,32</span>
        </div>
        
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#FF4B4B]/30 flex justify-between items-center">
          <p className="text-[10px] text-[#FFB800] font-black uppercase tracking-widest opacity-80">
            "Amanhã a gente recupera..."
          </p>
          <button className="bg-[#FFB800] text-black text-[10px] font-black uppercase px-4 py-2 rounded-xl transform -rotate-3 hover:rotate-0 transition-all shadow-[4px_4px_0_0_#000] border-2 border-black active:translate-y-1 active:shadow-none">
            Depositar 💸
          </button>
        </div>
      </div>
    </div>
  );
};
