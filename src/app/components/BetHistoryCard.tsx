import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BetHistoryCardProps {
  status: 'win' | 'loss';
  imageSrc: string;
  match: string;
  betAmount: number;
  odds: number;
  duendeQuote: string;
}

export const BetHistoryCard = ({ status, imageSrc, match, betAmount, odds, duendeQuote }: BetHistoryCardProps) => {
  const isWin = status === 'win';
  const returnAmount = isWin ? betAmount * odds : 0;
  const profit = isWin ? returnAmount - betAmount : betAmount;

  const mainColor = isWin ? 'text-[#00D46A]' : 'text-[#FF4B4B]';
  const shadowColor = isWin ? 'shadow-[8px_8px_0_0_#00D46A]' : 'shadow-[8px_8px_0_0_#FF4B4B]';
  const bgColor = isWin ? 'bg-[#00D46A]/10' : 'bg-[#FF4B4B]/10';
  const rotation = isWin ? 'rotate-1' : '-rotate-1';

  return (
    <div className={`relative mb-8 transform ${rotation}`}>
      <div className={`bg-[#1A1D24] border-4 border-[#0D0F14] rounded-2xl p-4 ${shadowColor} transition-transform hover:-translate-y-1`}>
        
        {/* Header */}
        <div className="mb-3 border-b-2 border-dashed border-[#0D0F14] pb-3">
          <div className="flex items-center gap-2 mb-1">
            {isWin ? <CheckCircle2 size={20} className={mainColor} strokeWidth={3} /> : <AlertCircle size={20} className={mainColor} strokeWidth={3} />}
            <span className={`text-[12px] font-black uppercase tracking-widest ${mainColor}`}>
              {isWin ? 'DEU GREEN! 🤑' : 'DEU RED... 😭'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider w-full block">
            {match}
          </span>
        </div>

        {/* Image and Speech Bubble */}
        <div className="relative mb-8">
          <div className="h-48 w-full overflow-hidden rounded-xl border-4 border-[#0D0F14] shadow-inner">
             <img 
               src={imageSrc} 
               alt={isWin ? 'Vitória' : 'Derrota'} 
               className="w-full h-full object-cover object-top" 
             />
             <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-multiply" />
          </div>

          {/* Speech Bubble floating over */}
          <div className={`absolute -bottom-5 ${isWin ? '-left-2' : '-right-2'} bg-white text-black p-3 rounded-2xl ${isWin ? 'rounded-tl-none' : 'rounded-tr-none'} border-4 border-black shadow-[4px_4px_0_0_#000] transform ${isWin ? '-rotate-3' : 'rotate-3'} z-10 max-w-[160px]`}>
            <p className="text-[10px] font-black leading-tight uppercase tracking-wider">
              "{duendeQuote}"
            </p>
            {/* Speech bubble tail */}
            <div className={`absolute -top-3 ${isWin ? 'left-0 border-l-4 skew-x-12' : 'right-0 border-r-4 -skew-x-12'} w-4 h-4 bg-white border-t-4 border-black transform translate-y-1/2`}></div>
          </div>
        </div>

        {/* Stats */}
        <div className={`rounded-xl p-4 border-4 border-[#0D0F14] ${bgColor}`}>
          <div className="flex justify-between mb-3 pb-3 border-b-2 border-dashed border-[#0D0F14]/20">
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Apostou</p>
              <p className="text-white font-black text-sm">R$ {betAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Odd</p>
              <p className="text-[#FFB800] font-black text-sm">{odds.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Retorno</p>
              <p className={`text-xl font-black ${mainColor}`}>R$ {returnAmount.toFixed(2)}</p>
            </div>
            <div className={`px-2 py-1.5 rounded border-2 border-[#0D0F14] flex items-center gap-1 shadow-[2px_2px_0_0_#0D0F14] ${isWin ? 'bg-[#00D46A] text-black' : 'bg-[#FF4B4B] text-black'}`}>
              {isWin ? <TrendingUp size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
              <span className="text-[11px] font-black uppercase">
                {isWin ? '+' : '-'} R$ {profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
