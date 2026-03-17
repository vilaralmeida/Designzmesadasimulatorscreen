import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Clock, CheckCircle, Circle } from 'lucide-react';
import { api, RoundFixture } from '../../lib/api';

function parseRoundNumber(round: string): number {
  const match = round.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

type MatchStatus = 'finished' | 'live' | 'upcoming';

function getStatus(fixture: RoundFixture): MatchStatus {
  const s = fixture.fixture.status.short;
  if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(s)) return 'finished';
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'HT'].includes(s)) return 'live';
  return 'upcoming';
}

function StatusBadge({ fixture }: { fixture: RoundFixture }) {
  const status = getStatus(fixture);
  if (status === 'live') {
    const elapsed = fixture.fixture.status.elapsed;
    return (
      <span className="flex items-center gap-1 text-[#00D46A] font-black text-[10px] uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#00D46A] animate-pulse" />
        {elapsed ?? ''}′
      </span>
    );
  }
  if (status === 'finished') {
    return <span className="text-[10px] font-black text-[#4A4E58] uppercase tracking-wider">FT</span>;
  }
  return (
    <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-wider">
      {formatTime(fixture.fixture.date)}
    </span>
  );
}

function ScoreOrTime({ fixture }: { fixture: RoundFixture }) {
  const status = getStatus(fixture);
  if (status === 'upcoming') {
    return (
      <div className="flex flex-col items-center">
        <Clock size={14} className="text-[#FFB800] mb-0.5" />
        <span className="text-[9px] text-[#4A4E58] font-bold">{formatDate(fixture.fixture.date)}</span>
      </div>
    );
  }
  const h = fixture.goals.home ?? '-';
  const a = fixture.goals.away ?? '-';
  const isLive = status === 'live';
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xl font-black tracking-tighter ${isLive ? 'text-[#00D46A]' : 'text-white'}`}>
        {h} – {a}
      </span>
      {fixture.score.halftime.home !== null && status === 'finished' && (
        <span className="text-[9px] text-[#4A4E58] font-bold">
          ({fixture.score.halftime.home} – {fixture.score.halftime.away}) HT
        </span>
      )}
    </div>
  );
}

function MatchCard({ fixture }: { fixture: RoundFixture }) {
  const status = getStatus(fixture);
  const homeWon = fixture.teams.home.winner === true;
  const awayWon = fixture.teams.away.winner === true;

  return (
    <div className={`bg-[#1A1D24] border-2 rounded-xl p-3 shadow-[3px_3px_0_0_#000] ${
      status === 'live' ? 'border-[#00D46A]/60' : 'border-[#333]'
    }`}>
      {/* Status row */}
      <div className="flex justify-end mb-2">
        <StatusBadge fixture={fixture} />
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-8 h-8 object-contain" />
          <span className={`text-[10px] font-black text-center leading-tight ${homeWon ? 'text-white' : 'text-[#8A8E98]'}`}>
            {fixture.teams.home.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex-shrink-0">
          <ScoreOrTime fixture={fixture} />
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-8 h-8 object-contain" />
          <span className={`text-[10px] font-black text-center leading-tight ${awayWon ? 'text-white' : 'text-[#8A8E98]'}`}>
            {fixture.teams.away.name}
          </span>
        </div>
      </div>

      {/* Venue */}
      {fixture.fixture.venue?.name && (
        <p className="text-[9px] text-[#4A4E58] text-center mt-2 truncate">
          {fixture.fixture.venue.name} · {fixture.fixture.venue.city}
        </p>
      )}
    </div>
  );
}

export default function SerieA() {
  const [rounds, setRounds] = useState<string[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<RoundFixture[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega lista de rodadas
  useEffect(() => {
    setLoadingRounds(true);
    api.getSerieARounds()
      .then(data => {
        const sorted = [...data].sort((a, b) => parseRoundNumber(a) - parseRoundNumber(b));
        setRounds(sorted);
        // Seleciona a rodada mais próxima da data atual (última ou penúltima)
        if (sorted.length > 0) setSelectedRound(sorted[0]);
      })
      .catch(() => setError('Não foi possível carregar as rodadas.'))
      .finally(() => setLoadingRounds(false));
  }, []);

  // Carrega jogos da rodada selecionada
  useEffect(() => {
    if (!selectedRound) return;
    setLoadingFixtures(true);
    setFixtures([]);
    api.getSerieARoundFixtures(selectedRound)
      .then(data => {
        const sorted = [...data].sort(
          (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
        );
        setFixtures(sorted);
      })
      .catch(() => setError('Não foi possível carregar os jogos.'))
      .finally(() => setLoadingFixtures(false));
  }, [selectedRound]);

  const currentIndex = selectedRound ? rounds.indexOf(selectedRound) : -1;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < rounds.length - 1;

  const liveCount = fixtures.filter(f => getStatus(f) === 'live').length;
  const finishedCount = fixtures.filter(f => getStatus(f) === 'finished').length;
  const upcomingCount = fixtures.filter(f => getStatus(f) === 'upcoming').length;

  return (
    <div className="w-full max-w-md p-4 pb-32">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6 pt-2">
        <div className="bg-[#FFB800] p-2 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transform -rotate-3">
          <Trophy size={20} className="text-black" strokeWidth={3} />
        </div>
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-white">Brasileirão</h1>
          <p className="text-[10px] text-[#4A4E58] font-bold tracking-widest uppercase">Série A · {new Date().getFullYear()}</p>
        </div>
      </header>

      {/* Round selector */}
      <div className="flex items-center justify-between bg-[#1A1D24] border-2 border-[#333] rounded-xl px-3 py-2 mb-4 shadow-[3px_3px_0_0_#000]">
        <button
          onClick={() => canPrev && setSelectedRound(rounds[currentIndex - 1])}
          disabled={!canPrev}
          className="p-1 rounded-lg disabled:opacity-30 hover:bg-[#333] transition-colors"
        >
          <ChevronLeft size={20} className="text-[#FFB800]" />
        </button>

        <div className="text-center">
          {loadingRounds ? (
            <span className="text-[#4A4E58] text-sm font-bold">Carregando...</span>
          ) : (
            <>
              <p className="text-white font-black text-sm uppercase tracking-wide">
                {selectedRound ? `Rodada ${parseRoundNumber(selectedRound)}` : '—'}
              </p>
              <p className="text-[10px] text-[#4A4E58] font-bold">{rounds.length} rodadas no total</p>
            </>
          )}
        </div>

        <button
          onClick={() => canNext && setSelectedRound(rounds[currentIndex + 1])}
          disabled={!canNext}
          className="p-1 rounded-lg disabled:opacity-30 hover:bg-[#333] transition-colors"
        >
          <ChevronRight size={20} className="text-[#FFB800]" />
        </button>
      </div>

      {/* Round stats */}
      {fixtures.length > 0 && (
        <div className="flex gap-2 mb-4">
          {liveCount > 0 && (
            <div className="flex items-center gap-1 bg-[#00D46A]/10 border border-[#00D46A]/30 rounded-lg px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D46A] animate-pulse" />
              <span className="text-[10px] font-black text-[#00D46A]">{liveCount} ao vivo</span>
            </div>
          )}
          {finishedCount > 0 && (
            <div className="flex items-center gap-1 bg-[#333]/50 border border-[#4A4E58]/30 rounded-lg px-2 py-1">
              <CheckCircle size={10} className="text-[#4A4E58]" />
              <span className="text-[10px] font-black text-[#4A4E58]">{finishedCount} finalizados</span>
            </div>
          )}
          {upcomingCount > 0 && (
            <div className="flex items-center gap-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg px-2 py-1">
              <Circle size={10} className="text-[#FFB800]" />
              <span className="text-[10px] font-black text-[#FFB800]">{upcomingCount} a jogar</span>
            </div>
          )}
        </div>
      )}

      {/* Fixtures */}
      {error && (
        <p className="text-[#FF4B4B] text-sm font-bold text-center py-8">{error}</p>
      )}

      {loadingFixtures && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#1A1D24] border-2 border-[#333] rounded-xl p-3 h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loadingFixtures && !error && fixtures.length === 0 && selectedRound && (
        <p className="text-[#4A4E58] text-sm font-bold text-center py-12">
          Nenhum jogo encontrado para esta rodada.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {fixtures.map(f => (
          <MatchCard key={f.fixture.id} fixture={f} />
        ))}
      </div>
    </div>
  );
}
