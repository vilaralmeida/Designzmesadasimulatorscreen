import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { RankingEntry } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router';

type UpcomingBet = {
  id: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  league: string;
  match_date: string;
  bet_type: 'home' | 'draw' | 'away';
  odds: number;
};

type MyBet = {
  upcoming_bet_id: string;
  bet_type: 'home' | 'draw' | 'away';
  amount: number;
};

const BET_LABELS = { home: 'Casa', draw: 'Empate', away: 'Fora' };
const BET_COLORS = { home: '#00D46A', draw: '#FFB800', away: '#FF4B4B' };

export default function Ranking() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<UpcomingBet[]>([]);
  const [myBets, setMyBets] = useState<Record<string, MyBet>>({});
  const [selectedBets, setSelectedBets] = useState<Record<string, { betType: 'home' | 'draw' | 'away'; amount: number }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [activeTab, setActiveTab] = useState<'ranking' | 'games'>('ranking');

  useEffect(() => {
    loadRanking();
    if (user) {
      loadGames();
      loadMyBets();
    }
  }, [user]);

  async function loadRanking() {
    setLoadingRanking(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('daily_ranking')
      .select('*')
      .eq('round_date', today)
      .order('position', { ascending: true })
      .limit(50);
    setRanking(data ?? []);
    setLoadingRanking(false);
  }

  async function loadGames() {
    try {
      const data = await api.getUpcomingBets();
      setGames(data);
    } catch { /* ignore */ }
  }

  async function loadMyBets() {
    if (!user) return;
    const { data } = await supabase
      .from('user_bets')
      .select('upcoming_bet_id, bet_type, amount')
      .eq('user_id', user.id);
    const map: Record<string, MyBet> = {};
    (data ?? []).forEach((b: MyBet) => { map[b.upcoming_bet_id] = b; });
    setMyBets(map);
  }

  async function submitBet(gameId: string, odds: number) {
    if (!user) return;
    const sel = selectedBets[gameId];
    if (!sel) return;
    setSubmitting(gameId);
    const { error } = await supabase.from('user_bets').insert({
      user_id: user.id,
      upcoming_bet_id: gameId,
      bet_type: sel.betType,
      amount: sel.amount,
      odds,
    });
    if (!error) {
      setMyBets(prev => ({ ...prev, [gameId]: { upcoming_bet_id: gameId, bet_type: sel.betType, amount: sel.amount } }));
      setSelectedBets(prev => { const n = { ...prev }; delete n[gameId]; return n; });
    }
    setSubmitting(null);
  }

  const duendeBalance = ranking.find(r => r.user_id === null)?.balance ?? 100;

  return (
    <div className="w-full max-w-md px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-[#FFB800] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            Ranking
          </h1>
          <p className="text-xs text-[#4A4E58] font-mono">Quem bate o Duende hoje?</p>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-[#4A4E58] font-mono">Seu saldo</div>
              <div className="text-[#00D46A] font-black text-sm">R${profile?.balance?.toFixed(2) ?? '100.00'}</div>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg bg-[#1A1D24] border-2 border-[#333] text-[#4A4E58] hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} className="flex items-center gap-2 bg-[#FFB800] text-black font-black text-xs uppercase px-3 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-y-[-1px] transition-all">
            <LogIn size={14} /> Entrar
          </button>
        )}
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-2">
          {(['ranking', 'games'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all ${activeTab === tab ? 'bg-[#FFB800] text-black border-black shadow-[3px_3px_0_0_#000]' : 'bg-[#1A1D24] text-[#4A4E58] border-[#333]'}`}>
              {tab === 'ranking' ? '🏆 Ranking' : '⚽ Meus Palpites'}
            </button>
          ))}
        </div>
      )}

      {/* Ranking Tab */}
      {(activeTab === 'ranking' || !user) && (
        <div className="flex flex-col gap-2">
          {loadingRanking ? (
            <div className="text-center text-[#4A4E58] text-sm py-8 font-mono">Carregando ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="bg-[#1A1D24] border-4 border-[#333] rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🎲</div>
              <div className="text-[#4A4E58] text-sm font-mono">Ranking será gerado ao final do dia</div>
              {!user && (
                <button onClick={signInWithGoogle} className="mt-4 flex items-center gap-2 mx-auto bg-[#FFB800] text-black font-black text-xs uppercase px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                  <LogIn size={14} /> Entrar para competir
                </button>
              )}
            </div>
          ) : (
            ranking.map((entry, i) => {
              const isMe = entry.user_id === user?.id;
              const isDuende = entry.user_id === null;
              const above = entry.vs_duende === 'above';
              const below = entry.vs_duende === 'below';
              return (
                <div key={entry.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${isMe ? 'border-[#FFB800] bg-[#FFB800]/10' : 'border-[#333] bg-[#1A1D24]'}`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-sm border-2 border-black ${i === 0 ? 'bg-[#FFB800] text-black' : i === 1 ? 'bg-[#aaa] text-black' : i === 2 ? 'bg-[#cd7f32] text-black' : 'bg-[#333] text-white'}`}>
                    {i + 1}
                  </div>
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} className="w-8 h-8 rounded-full border-2 border-[#333]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-[#333] bg-[#333] flex items-center justify-center text-sm">
                      {isDuende ? '👻' : entry.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm truncate">
                      {entry.username} {isDuende && <span className="text-[#B854FF]">(Duende)</span>}
                      {isMe && <span className="text-[#FFB800]"> (você)</span>}
                    </div>
                    <div className="text-xs text-[#4A4E58] font-mono">
                      {entry.daily_pnl >= 0 ? '+' : ''}R${entry.daily_pnl.toFixed(2)} hoje
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm">R${entry.balance.toFixed(2)}</div>
                    {!isDuende && (
                      <div className={`text-xs font-mono flex items-center gap-1 justify-end ${above ? 'text-[#00D46A]' : below ? 'text-[#FF4B4B]' : 'text-[#4A4E58]'}`}>
                        {above ? <TrendingUp size={10} /> : below ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {above ? 'acima' : below ? 'abaixo' : 'igual'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Games / My Bets Tab */}
      {activeTab === 'games' && user && (
        <div className="flex flex-col gap-3">
          {games.length === 0 ? (
            <div className="text-center text-[#4A4E58] text-sm py-8 font-mono">Sem jogos disponíveis hoje</div>
          ) : (
            games.map(game => {
              const already = myBets[game.id];
              const sel = selectedBets[game.id];
              const isSubmitting = submitting === game.id;
              const matchDate = new Date(game.match_date);
              const isPast = matchDate < new Date();

              return (
                <div key={game.id} className={`bg-[#1A1D24] border-4 rounded-2xl p-4 flex flex-col gap-3 ${already ? 'border-[#00D46A]/50' : 'border-[#333]'}`}>
                  {/* Teams */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <img src={game.home_logo} className="w-7 h-7 object-contain" />
                      <span className="text-xs font-black truncate">{game.home_team}</span>
                    </div>
                    <span className="text-[#4A4E58] text-xs font-mono">vs</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-xs font-black truncate">{game.away_team}</span>
                      <img src={game.away_logo} className="w-7 h-7 object-contain" />
                    </div>
                  </div>

                  <div className="text-xs text-[#4A4E58] font-mono text-center">
                    {matchDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} • {game.league}
                  </div>

                  {/* Already bet */}
                  {already ? (
                    <div className="text-center text-xs font-black py-2 rounded-xl bg-[#00D46A]/10 text-[#00D46A] border border-[#00D46A]/30">
                      ✓ Palpite enviado: {BET_LABELS[already.bet_type]} · R${already.amount}
                    </div>
                  ) : isPast ? (
                    <div className="text-center text-xs text-[#4A4E58] font-mono py-2">Jogo já começou</div>
                  ) : (
                    <>
                      {/* Bet type buttons */}
                      <div className="flex gap-2">
                        {(['home', 'draw', 'away'] as const).map(type => (
                          <button key={type} onClick={() => setSelectedBets(prev => ({ ...prev, [game.id]: { betType: type, amount: prev[game.id]?.amount ?? 5 } }))}
                            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg border-2 transition-all ${sel?.betType === type ? 'border-black shadow-[2px_2px_0_0_#000] translate-y-[-1px]' : 'border-[#333] text-[#4A4E58]'}`}
                            style={sel?.betType === type ? { backgroundColor: BET_COLORS[type], color: type === 'draw' ? '#000' : '#000' } : {}}>
                            {BET_LABELS[type]}
                          </button>
                        ))}
                      </div>

                      {/* Amount slider */}
                      {sel && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-mono text-[#4A4E58]">
                            <span>Valor</span>
                            <span className="text-white font-black">R${sel.amount}</span>
                          </div>
                          <input type="range" min={1} max={10} value={sel.amount}
                            onChange={e => setSelectedBets(prev => ({ ...prev, [game.id]: { ...prev[game.id], amount: Number(e.target.value) } }))}
                            className="w-full accent-[#FFB800]" />
                          <button onClick={() => submitBet(game.id, game.odds)} disabled={isSubmitting}
                            className="w-full py-2 bg-[#FFB800] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-y-[-1px] transition-all disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : 'Confirmar Palpite'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
