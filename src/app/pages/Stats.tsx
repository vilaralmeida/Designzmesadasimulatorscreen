import React from 'react';
import { Activity, TrendingDown, Target, Skull, Trophy, Frown } from 'lucide-react';
import { BetHistoryCard } from '../components/BetHistoryCard';
import winImage from 'figma:asset/fff309965f78ba749f829df22aca85c32448399d.png';
import lossImage from 'figma:asset/38de288c4fd63109016bd967f005d4a38821089c.png';

export default function Stats() {
  return (
    <div className="w-full max-w-md p-4 relative z-10 overflow-x-hidden pt-6">
      
      {/* Header */}
      <header className="flex justify-center items-center mb-8">
        <div className="flex items-center gap-3 border-b-4 border-dashed border-[#4A4E58] pb-2">
          <Activity className="text-white" size={24} strokeWidth={3} />
          <h1 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-[2px_2px_0_#000]">
            Estatísticas da Tragédia
          </h1>
        </div>
      </header>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        
        {/* Total Loss */}
        <div className="col-span-2 bg-[#FF4B4B] rounded-2xl p-4 border-4 border-black shadow-[6px_6px_0_0_#000] transform -rotate-1 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Skull size={100} />
          </div>
          <div className="relative z-10">
            <h2 className="text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <TrendingDown size={14} strokeWidth={4} /> Rombo Total
            </h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-black/80 font-black text-xl">R$</span>
              <span className="text-black font-black text-5xl tracking-tighter drop-shadow-sm">
                -4.320
              </span>
            </div>
            <p className="text-black/70 text-[9px] font-black uppercase tracking-wider mt-1">
              "Falta só um green pra recuperar"
            </p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 border-4 border-[#4A4E58] shadow-[4px_4px_0_0_#000] transform rotate-2">
          <h2 className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
            <Target size={12} strokeWidth={4} className="text-[#00D46A]" /> Taxa de Acerto
          </h2>
          <div className="text-white font-black text-3xl">3%</div>
          <div className="w-full bg-[#0D0F14] h-2 mt-2 rounded-full overflow-hidden border border-black">
            <div className="bg-[#00D46A] w-[3%] h-full" />
          </div>
        </div>

        {/* Worst Bet */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 border-4 border-[#4A4E58] shadow-[4px_4px_0_0_#000] transform -rotate-2">
          <h2 className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
            <Frown size={12} strokeWidth={4} className="text-[#FFB800]" /> Pior Palpite
          </h2>
          <div className="text-[#FF4B4B] font-black text-lg leading-tight">Vasco 0 x 3</div>
          <p className="text-gray-500 text-[9px] font-bold uppercase mt-1">Odd 1.10 (Era "certeza")</p>
        </div>

      </div>

      {/* History List */}
      <div className="mb-6 flex items-center gap-2 border-b-2 border-dashed border-[#4A4E58] pb-3">
        <Trophy size={18} className="text-[#FFB800]" />
        <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Últimas Desgraças
        </h2>
      </div>

      <BetHistoryCard 
        status="loss"
        imageSrc={lossImage}
        match="Vasco 0 x 3 Flamengo"
        betAmount={500}
        odds={1.10}
        duendeQuote="All-in no Vascão, pai! A odd tá baixa porque é dinheiro fácil!"
      />

      <BetHistoryCard 
        status="win"
        imageSrc={winImage}
        match="Ceará 2 x 0 Fortaleza"
        betAmount={20}
        odds={2.50}
        duendeQuote="GOOOOL! Falei que era certeza! Chama no Pix, Zé!"
      />

      <BetHistoryCard 
        status="loss"
        imageSrc={lossImage}
        match="Íbis 0 x 1 Ferroviário"
        betAmount={50}
        odds={1.80}
        duendeQuote="Foi mal mano... A bola é redonda, culpa do juizão."
      />
      
      {/* Spacer for bottom bar */}
      <div className="h-20"></div>
    </div>
  );
}
