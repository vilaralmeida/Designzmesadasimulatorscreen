import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { api, UpcomingBet } from '../../lib/api';

const BET_LABEL: Record<string, string> = {
  home: 'Casa',
  draw: 'Empate',
  away: 'Fora',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export const UpcomingBetsTable = () => {
  const [bets, setBets] = useState<UpcomingBet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUpcomingBets()
      .then(setBets)
      .catch(() => setBets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-[#4A4E58] pb-3">
        <CalendarClock size={18} className="text-[#00D46A]" />
        <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Próximas Loucuras
        </h2>
      </div>

      <div className="bg-[#1A1D24] border-4 border-[#0D0F14] rounded-xl overflow-hidden shadow-[6px_6px_0_0_#000] transform -rotate-1 relative">
        <div className="absolute -top-2 -right-2 w-12 h-4 bg-[#00D46A]/80 backdrop-blur-sm rotate-12 z-10 shadow-sm" />

        {loading ? (
          <div className="p-6 text-center text-gray-500 text-[11px] font-black uppercase tracking-widest animate-pulse">
            Chicão analisando os jogos...
          </div>
        ) : bets.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-[11px] font-black uppercase tracking-widest">
            Sem apostas pendentes por enquanto.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[320px]">
              <thead>
                <tr className="bg-[#FFB800] text-black border-b-4 border-[#0D0F14]">
                  <th className="p-3 text-[10px] font-black uppercase tracking-wider">Jogo</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-wider text-center">Odd</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-wider text-center">R$</th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-wider text-right">Palpite</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, idx) => (
                  <tr
                    key={bet.id}
                    className={`border-b-2 border-dashed border-[#0D0F14]/50 hover:bg-[#FFB800]/10 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#1A1D24]' : 'bg-[#222630]'
                    }`}
                  >
                    <td className="p-3 max-w-[110px]">
                      <div className="flex items-center gap-1 mb-0.5">
                        <img src={bet.home_logo} alt={bet.home_team} className="w-3 h-3 object-contain" />
                        <span className="text-[9px] font-black text-white leading-tight truncate">{bet.home_team}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <img src={bet.away_logo} alt={bet.away_team} className="w-3 h-3 object-contain" />
                        <span className="text-[9px] font-black text-white leading-tight truncate">{bet.away_team}</span>
                      </div>
                      <span className="text-[8px] text-gray-500 font-bold">{formatDate(bet.match_date)}</span>
                    </td>
                    <td className="p-3 text-[11px] font-black text-[#FFB800] text-center bg-[#0D0F14]/30">
                      {Number(bet.odds).toFixed(2)}
                    </td>
                    <td className="p-3 text-[10px] font-black text-white text-center">
                      R${bet.amount}
                    </td>
                    <td className="p-3 text-[9px] font-black text-[#00D46A] text-right uppercase">
                      <span className="bg-[#0D0F14] px-2 py-1 rounded inline-block transform rotate-1">
                        {BET_LABEL[bet.bet_type]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
