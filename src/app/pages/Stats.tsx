import React, { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp, Target, Skull, Trophy, Frown } from 'lucide-react';
import { BetHistoryCard } from '../components/BetHistoryCard';
import winImage from 'figma:asset/fff309965f78ba749f829df22aca85c32448399d.png';
import lossImage from 'figma:asset/38de288c4fd63109016bd967f005d4a38821089c.png';
import { api, Bet, BetStats } from '../../lib/api';

export default function Stats() {
  const [stats, setStats] = useState<BetStats | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBetStats(), api.getBets(20)])
      .then(([s, b]) => { setStats(s); setBets(b.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const netPnL = stats ? +(stats.returned - stats.wagered).toFixed(2) : 0;
  const isProfit = netPnL >= 0;

  // Pior palpite: perda com maior valor apostado
  const worstBet = bets
    .filter(b => b.result === 'loss')
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0] ?? null;

  // Melhor vitória: maior retorno
  const bestBet = bets
    .filter(b => b.result === 'win')
    .sort((a, b) => Number(b.payout) - Number(a.payout))[0] ?? null;

  function matchLabel(bet: Bet) {
    return bet.home_score != null
      ? `${bet.home_team} ${bet.home_score}x${bet.away_score} ${bet.away_team}`
      : `${bet.home_team} x ${bet.away_team}`;
  }

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

      {loading ? (
        <div className="text-center text-gray-500 text-[11px] font-black uppercase tracking-widest py-12 animate-pulse">
          Chicão calculando os prejuízos...
        </div>
      ) : stats?.total === 0 ? (
        <div className="text-center text-gray-500 text-[11px] font-black uppercase tracking-widest py-12">
          Nenhuma aposta liquidada ainda. Aguarda os jogos!
        </div>
      ) : (
        <>
          {/* Summary Dashboard */}
          <div className="grid grid-cols-2 gap-4 mb-10">

            {/* P&L Total — ocupa linha inteira */}
            <div
              className="col-span-2 rounded-2xl p-4 border-4 border-black shadow-[6px_6px_0_0_#000] transform -rotate-1 relative overflow-hidden"
              style={{ backgroundColor: isProfit ? '#00D46A' : '#FF4B4B' }}
            >
              <div className="absolute -right-4 -bottom-4 opacity-20">
                {isProfit ? <Trophy size={100} /> : <Skull size={100} />}
              </div>
              <div className="relative z-10">
                <h2 className="text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  {isProfit
                    ? <><TrendingUp size={14} strokeWidth={4} /> Lucro Total</>
                    : <><TrendingDown size={14} strokeWidth={4} /> Rombo Total</>}
                </h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-black/80 font-black text-xl">R$</span>
                  <span className="text-black font-black text-5xl tracking-tighter drop-shadow-sm">
                    {isProfit ? '+' : ''}{netPnL.toFixed(2)}
                  </span>
                </div>
                <p className="text-black/70 text-[9px] font-black uppercase tracking-wider mt-1">
                  {stats?.total} apostas · R${stats?.wagered.toFixed(2)} arriscados · ROI {stats?.roi}%
                </p>
              </div>
            </div>

            {/* Taxa de Acerto */}
            <div className="bg-[#1A1D24] rounded-2xl p-4 border-4 border-[#4A4E58] shadow-[4px_4px_0_0_#000] transform rotate-2">
              <h2 className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
                <Target size={12} strokeWidth={4} className="text-[#00D46A]" /> Taxa de Acerto
              </h2>
              <div className="text-white font-black text-3xl">{stats?.winRate ?? 0}%</div>
              <div className="w-full bg-[#0D0F14] h-2 mt-2 rounded-full overflow-hidden border border-black">
                <div className="bg-[#00D46A] h-full transition-all" style={{ width: `${stats?.winRate ?? 0}%` }} />
              </div>
              <p className="text-gray-500 text-[8px] font-bold uppercase mt-2">
                {stats?.wins}W · {stats?.losses}L
              </p>
            </div>

            {/* Pior palpite */}
            <div className="bg-[#1A1D24] rounded-2xl p-4 border-4 border-[#4A4E58] shadow-[4px_4px_0_0_#000] transform -rotate-2">
              <h2 className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
                <Frown size={12} strokeWidth={4} className="text-[#FFB800]" /> Pior Palpite
              </h2>
              {worstBet ? (
                <>
                  <div className="text-[#FF4B4B] font-black text-[11px] leading-tight">{matchLabel(worstBet)}</div>
                  <p className="text-gray-500 text-[8px] font-bold uppercase mt-1">
                    -{Number(worstBet.amount).toFixed(2)} · Odd {Number(worstBet.odds).toFixed(2)}
                  </p>
                </>
              ) : (
                <div className="text-gray-600 text-[9px] font-bold uppercase">Ainda sem derrotas!</div>
              )}
            </div>

            {/* Melhor vitória */}
            {bestBet && (
              <div className="col-span-2 bg-[#1A1D24] rounded-2xl p-4 border-4 border-[#4A4E58] shadow-[4px_4px_0_0_#000] transform rotate-1">
                <h2 className="text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
                  <Trophy size={12} strokeWidth={4} className="text-[#FFB800]" /> Maior Vitória
                </h2>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[#00D46A] font-black text-[11px] leading-tight">{matchLabel(bestBet)}</div>
                    <p className="text-gray-500 text-[8px] font-bold uppercase mt-1">
                      Odd {Number(bestBet.odds).toFixed(2)} · Apostou R${Number(bestBet.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-[#00D46A] font-black text-xl">
                    +R${Number(bestBet.payout).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History List */}
          <div className="mb-6 flex items-center gap-2 border-b-2 border-dashed border-[#4A4E58] pb-3">
            <Trophy size={18} className="text-[#FFB800]" />
            <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Últimas Desgraças
            </h2>
          </div>

          {bets.map(bet => (
            <BetHistoryCard
              key={bet.id}
              status={bet.result as 'win' | 'loss'}
              imageSrc={bet.result === 'win' ? winImage : lossImage}
              match={matchLabel(bet)}
              betAmount={Number(bet.amount)}
              odds={Number(bet.odds)}
              duendeQuote={bet.duende_quote || '...'}
            />
          ))}
        </>
      )}

      <div className="h-20" />
    </div>
  );
}
