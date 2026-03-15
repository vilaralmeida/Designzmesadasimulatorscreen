import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Trophy, TrendingUp, TrendingDown, Minus, Swords } from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { RankingEntry } from '../../lib/supabase';

export function BeatDuendeCard() {
  const [top3, setTop3] = useState<RankingEntry[]>([]);
  const [duendeBalance, setDuendeBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
          .from('daily_ranking')
          .select('*, user_profiles(username, avatar_url)')
          .eq('round_date', today)
          .order('balance', { ascending: false })
          .limit(4);

        if (data) {
          const duende = data.find((e: any) => e.is_duende);
          const humans = data.filter((e: any) => !e.is_duende).slice(0, 3);
          if (duende) setDuendeBalance(duende.balance);
          setTop3(humans as RankingEntry[]);
        }
      } catch {}

      // fallback: pega saldo do bankroll mesmo se ranking vazio
      try {
        const bankroll = await api.getBankroll();
        setDuendeBalance(prev => prev ?? bankroll.balance);
      } catch {}

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;

  const duendeBalanceStr = duendeBalance != null ? `R$${duendeBalance.toFixed(2)}` : '...';

  return (
    <div className="w-full mb-6">
      <Link to="/ranking">
        <div className="bg-[#1A1D24] border-4 border-[#FFB800] rounded-2xl p-4 shadow-[6px_6px_0_0_#000] transform -rotate-1 relative overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer">
          {/* Tape strip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#FFB800]/60 z-10 rounded-sm" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFB800] p-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0_0_#000] transform rotate-3">
                <Swords size={16} strokeWidth={3} className="text-black" />
              </div>
              <div>
                <h2 className="text-[#FFB800] font-black text-sm uppercase tracking-wider leading-none">
                  Bata o Duende!
                </h2>
                <p className="text-[#4A4E58] text-[9px] font-bold uppercase tracking-widest">
                  Chicão está em {duendeBalanceStr}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#FFB800] text-[9px] font-black uppercase tracking-widest border border-[#FFB800]/40 px-2 py-0.5 rounded">
                Ver ranking →
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-[#333] mb-3" />

          {/* Top 3 ou CTA */}
          {top3.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-[#4A4E58] text-xs font-mono mb-1">Ninguém apostou ainda hoje.</p>
              <p className="text-[#FFB800] text-[11px] font-black uppercase tracking-wider">
                Seja o primeiro a bater o Chicão! 👊
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {top3.map((entry, i) => {
                const isAbove = duendeBalance != null && entry.balance > duendeBalance;
                const isBelow = duendeBalance != null && entry.balance < duendeBalance;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{medals[i]}</span>
                      <span className="text-white text-xs font-black truncate max-w-[140px]">
                        {(entry as any).user_profiles?.username ?? 'Jogador'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-black ${isAbove ? 'text-[#00D46A]' : isBelow ? 'text-[#FF4B4B]' : 'text-[#4A4E58]'}`}>
                        R${entry.balance.toFixed(2)}
                      </span>
                      {isAbove ? <TrendingUp size={10} className="text-[#00D46A]" /> : isBelow ? <TrendingDown size={10} className="text-[#FF4B4B]" /> : <Minus size={10} className="text-[#4A4E58]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
