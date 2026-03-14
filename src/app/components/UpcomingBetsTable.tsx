import React from 'react';
import { CalendarClock } from 'lucide-react';

const UPCOMING_BETS = [
  { 
    id: 1, 
    match: 'Flamengo x Vasco', 
    odd: 5.50, 
    amount: 150, 
    guess: 'Vascão Amassa' 
  },
  { 
    id: 2, 
    match: 'Corinthians x Palmeiras', 
    odd: 1.90, 
    amount: 300, 
    guess: 'Empate Anula' 
  },
  { 
    id: 3, 
    match: 'Íbis x Sport', 
    odd: 12.00, 
    amount: 50, 
    guess: 'Íbis +2 Gols' 
  },
  { 
    id: 4, 
    match: 'Real Madrid x City', 
    odd: 1.25, 
    amount: 500, 
    guess: 'City Seco' 
  },
];

export const UpcomingBetsTable = () => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-[#4A4E58] pb-3">
        <CalendarClock size={18} className="text-[#00D46A]" />
        <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Próximas Loucuras
        </h2>
      </div>

      <div className="bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl overflow-hidden shadow-[6px_6px_0_0_#000] transform -rotate-1 relative">
        
        {/* Tape highlight piece */}
        <div className="absolute -top-2 -right-2 w-12 h-4 bg-[#00D46A]/80 backdrop-blur-sm rotate-12 z-10 shadow-sm" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-[#FFB800] text-black border-b-4 border-[#0D0F14]">
                <th className="p-3 text-[10px] font-black uppercase tracking-wider">Jogo</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-center">Odd</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-center">R$</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-wider text-right">Palpite do Chicão</th>
              </tr>
            </thead>
            <tbody>
              {UPCOMING_BETS.map((bet, idx) => (
                <tr 
                  key={bet.id} 
                  className={`border-b-2 border-dashed border-[#0D0F14]/50 hover:bg-[#FFB800]/10 transition-colors ${
                    idx % 2 === 0 ? 'bg-[#1A1D24]' : 'bg-[#222630]'
                  }`}
                >
                  <td className="p-3 text-[10px] font-bold text-white max-w-[100px] leading-tight">
                    {bet.match}
                  </td>
                  <td className="p-3 text-[11px] font-black text-[#FFB800] text-center bg-[#0D0F14]/30">
                    {bet.odd.toFixed(2)}
                  </td>
                  <td className="p-3 text-[10px] font-black text-white text-center">
                    {bet.amount}
                  </td>
                  <td className="p-3 text-[9px] font-black text-[#00D46A] text-right uppercase">
                    <span className="bg-[#0D0F14] px-2 py-1 rounded border border-[#0D0F14] inline-block transform rotate-1">
                      "{bet.guess}"
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
