import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { api } from '../../lib/api';

const INITIAL_BALANCE = 100;

function formatLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const BankrollChart = () => {
  const [chartData, setChartData] = useState<{ name: string; saldo: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBankrollHistory(30)
      .then(history => {
        // Sempre começa com o saldo inicial
        const points = [{ name: 'Início', saldo: INITIAL_BALANCE }];
        let running = INITIAL_BALANCE;
        for (const h of history) {
          running = +(running + h.delta).toFixed(2);
          points.push({ name: formatLabel(h.date), saldo: running });
        }
        setChartData(points);
      })
      .catch(() => setChartData([{ name: 'Início', saldo: INITIAL_BALANCE }]))
      .finally(() => setLoading(false));
  }, []);

  const lastBalance = chartData[chartData.length - 1]?.saldo ?? INITIAL_BALANCE;
  const lineColor = lastBalance >= INITIAL_BALANCE ? '#00D46A' : '#FF4B4B';
  const glowColor = lastBalance >= INITIAL_BALANCE ? 'rgba(0,212,106,0.4)' : 'rgba(255,75,75,0.4)';

  return (
    <div className="bg-[#1A1D24] border-4 border-[#4A4E58] rounded-2xl p-5 shadow-[6px_6px_0_0_#000] relative transform rotate-1 mb-8">
      <div
        className="absolute -bottom-2 -right-3 w-16 h-5 bg-yellow-900/40 backdrop-blur-sm rotate-[15deg] z-10"
        style={{ clipPath: 'polygon(10% 0%, 100% 5%, 90% 95%, 0% 100%)' }}
      />

      <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-[#4A4E58] pb-3">
        <Activity size={18} style={{ color: lineColor }} />
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Gráfico da Tragédia
        </h3>
      </div>

      {loading ? (
        <div className="h-[140px] flex items-center justify-center text-gray-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
          Carregando dados...
        </div>
      ) : (
        <div className="h-[140px] w-full mt-2 relative" style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}>
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-50" />

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#4A4E58"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                fontFamily="monospace"
                fontWeight="bold"
              />
              <YAxis
                stroke="#4A4E58"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                fontFamily="monospace"
                fontWeight="bold"
              />
              <ReferenceLine y={INITIAL_BALANCE} stroke="#4A4E58" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D0F14',
                  border: `4px solid ${lineColor}`,
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  boxShadow: '4px 4px 0 0 #000',
                }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Saldo']}
                itemStyle={{ color: lineColor, fontSize: '13px' }}
                labelStyle={{ color: '#FFB800', marginBottom: '4px', fontSize: '10px' }}
                cursor={{ stroke: '#FFB800', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Line
                type="stepAfter"
                dataKey="saldo"
                stroke={lineColor}
                strokeWidth={4}
                dot={{ r: 4, fill: lineColor, stroke: '#000', strokeWidth: 3 }}
                activeDot={{ r: 6, fill: '#FFB800', stroke: '#000', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
