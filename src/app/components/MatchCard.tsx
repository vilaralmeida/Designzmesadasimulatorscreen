import React from 'react';
import exampleImage from 'figma:asset/5904eb9eb72b5560bdc24189852159dc8ae88496.png';
import { Zap } from 'lucide-react';

export const MatchCard = () => {
  return (
    <div className="relative mb-8 transform -rotate-1">
      <div className="bg-[#1A1D24] border-4 border-[#4A4E58] rounded-2xl p-5 shadow-[8px_8px_0_0_#000]">
        
        {/* Header section with Carlão's theme */}
        <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-[#4A4E58] pb-3">
          <h3 className="text-[12px] font-black text-[#00D46A] flex items-center gap-2 uppercase tracking-widest">
            <Zap size={18} fill="#00D46A" /> 
            Dica do Carlão
          </h3>
          <span className="text-[10px] bg-[#FFB800] text-black font-black px-2 py-1 rounded-sm uppercase transform rotate-2 shadow-[2px_2px_0_0_#000]">
            Certeza Absoluta
          </span>
        </div>

        {/* The Image and Speech Bubble (Cartoon theme) */}
        <div className="relative mb-6">
          <div className="h-44 w-full overflow-hidden rounded-xl border-4 border-[#0D0F14] shadow-inner relative group">
             {/* Using the provided image */}
             <img 
               src={exampleImage} 
               alt="Dica do Duende" 
               className="w-full h-full object-cover object-right-top mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-300" 
             />
             {/* Gritty vignette overlay */}
             <div className="absolute inset-0 bg-black/30 pointer-events-none mix-blend-multiply" />
          </div>

          {/* Speech Bubble floating over */}
          <div className="absolute -top-3 -right-2 bg-white text-black p-3 rounded-2xl rounded-br-none border-4 border-black shadow-[6px_6px_0_0_#FFB800] transform rotate-3 z-10 max-w-[160px] animate-bounce" style={{ animationDuration: '3s' }}>
            <p className="text-[11px] font-black leading-tight uppercase tracking-wider">
              "Mete tudo no Vozão, Zé! É CERTO!" ⚽️🤑
            </p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 right-0 w-6 h-6 bg-white border-r-4 border-b-4 border-black transform translate-y-1/2 -skew-x-12"></div>
          </div>
        </div>

        {/* Betting Terminal styled Odds */}
        <div className="bg-[#0D0F14] rounded-xl p-4 border-4 border-[#333] shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-3">
             <span className="font-mono text-[10px] uppercase text-[#00D46A] font-black tracking-[0.2em] border-b-2 border-[#00D46A] pb-1">
               Bet Ceará 2005
             </span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest px-2">
            <span className="text-[#FFB800]">Ceará</span>
            <span>Empate</span>
            <span>Fortaleza</span>
          </div>
          <div className="flex gap-2">
            {/* The winning bet styled uniquely */}
            <button className="flex-1 bg-[#00D46A] text-black font-black py-3 rounded-lg border-4 border-black shadow-[4px_4px_0_0_#000] text-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all relative overflow-hidden group">
              <span className="relative z-10">2.10</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button className="flex-1 bg-[#1A1D24] text-white font-black py-3 rounded-lg border-2 border-[#4A4E58] text-lg hover:border-[#FFB800] transition-colors">
              2.90
            </button>
            <button className="flex-1 bg-[#1A1D24] text-white font-black py-3 rounded-lg border-2 border-[#4A4E58] text-lg hover:border-[#FFB800] transition-colors">
              3.40
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
