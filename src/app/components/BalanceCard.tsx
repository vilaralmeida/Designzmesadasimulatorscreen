import React, { useEffect, useState } from 'react';
import { AlertOctagon, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

const INITIAL_BALANCE = 100;

export const BalanceCard = () => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    api.getBankroll()
      .then(d => setBalance(Number(d.balance)))
      .catch(() => setBalance(null));
  }, []);

  const pct = balance !== null
    ? Math.round(((balance - INITIAL_BALANCE) / INITIAL_BALANCE) * 100)
    : null;
  const isDown = pct !== null && pct < 0;
  const color = isDown ? '#FF4B4B' : '#00D46A';
  const borderColor = isDown ? 'border-[#FF4B4B]' : 'border-[#00D46A]';
  const bgColor = isDown ? 'bg-[#1a1414]' : 'bg-[#141a14]';

  return (
    <div className="relative mb-8 transform rotate-1">
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-900/40 backdrop-blur-sm -rotate-3 z-10"
        style={{ clipPath: 'polygon(5% 0%, 95% 5%, 90% 95%, 10% 100%)' }}
      />

      <div className={`${bgColor} border-4 border-dashed ${borderColor} rounded-2xl p-6 shadow-[6px_6px_0_0_#000]`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2" style={{ color }}>
            <AlertOctagon size={16} className="animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest">Saldo na Pindaíba</h2>
          </div>
          {pct !== null && (
            <span
              className="text-xs font-black px-2 py-1 rounded border-2 flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]"
              style={{ color, borderColor: color, backgroundColor: `${color}20` }}
            >
              {isDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {pct > 0 ? '+' : ''}{pct}%
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black" style={{ color }}>R$</span>
          <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
            {balance !== null
              ? balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '...'}
          </span>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-dashed flex justify-between items-center" style={{ borderColor: `${color}50` }}>
          <p className="text-[10px] text-[#FFB800] font-black uppercase tracking-widest opacity-80">
            {isDown ? '"Amanhã a gente recupera..."' : '"Tô voando, Zé! Chicão nunca erra!"'}
          </p>
        </div>
      </div>
    </div>
  );
};
