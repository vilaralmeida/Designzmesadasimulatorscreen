import React from 'react';
import { Coffee, Heart } from 'lucide-react';
import { Link } from 'react-router';

export const DonateCTA = () => {
  return (
    <div className="relative mb-8 transform -rotate-1">
      {/* Tape effect top */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-900/40 backdrop-blur-sm rotate-2 z-10" 
        style={{ clipPath: 'polygon(5% 0%, 95% 5%, 90% 95%, 10% 100%)' }} 
      />
      
      <div className="bg-[#1A1D24] border-4 border-solid border-[#FF4B4B] rounded-2xl p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-[#FF4B4B]">
            <Heart size={20} className="animate-pulse fill-current" />
            <h2 className="text-sm font-black uppercase tracking-widest">Dê uma ajuda pro Zé</h2>
          </div>
          <span className="text-xs font-black text-black bg-[#FF4B4B] px-2 py-1 rounded border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_0_#000] transform rotate-3">
            SOS
          </span>
        </div>
        
        <div className="mt-2">
          <p className="text-white text-lg font-black leading-tight tracking-tight drop-shadow-md">
            O Zé gastou até o que não tinha seguindo o Duende.
          </p>
          <p className="text-[#8A8F98] text-sm font-bold mt-2 leading-snug">
            Mande um Pix pra ajudar ele a pagar o agiota (ou apostar de novo).
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#FF4B4B]/30 flex justify-between items-center">
          <p className="text-[10px] text-[#FF4B4B] font-black uppercase tracking-widest">
            "Sério, tô na pindaíba!"
          </p>
          <Link to="/ajuda">
            <button className="bg-[#FF4B4B] text-white text-[10px] font-black uppercase px-4 py-3 rounded-xl transform rotate-2 hover:-rotate-1 transition-all shadow-[4px_4px_0_0_#000] border-2 border-black active:translate-y-1 active:shadow-none flex items-center gap-2">
              <Coffee size={14} />
              Ajudar o Zé
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
