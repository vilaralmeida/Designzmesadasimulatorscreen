import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const data = [
  { name: 'S', uv: 400 },
  { name: 'T', uv: 300 },
  { name: 'Q', uv: 200 },
  { name: 'Q', uv: 278 },
  { name: 'S', uv: 189 },
  { name: 'S', uv: 50 },
  { name: 'D', uv: 12 }, // "Pindaíba" trend
];

export const BankrollChart = () => {
  return (
    <div className="bg-[#1A1D24] border-4 border-[#4A4E58] rounded-2xl p-5 shadow-[6px_6px_0_0_#000] relative transform rotate-1 mb-8">
      {/* Messy tape detail */}
      <div 
        className="absolute -bottom-2 -right-3 w-16 h-5 bg-yellow-900/40 backdrop-blur-sm rotate-[15deg] z-10" 
        style={{ clipPath: 'polygon(10% 0%, 100% 5%, 90% 95%, 0% 100%)' }}
      />
      
      <div className="flex items-center gap-2 mb-6 border-b-2 border-dashed border-[#4A4E58] pb-3">
        <Activity size={18} className="text-[#FF4B4B]" />
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Gráfico da Tragédia
        </h3>
      </div>

      <div className="h-[140px] w-full mt-2 relative" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 75, 75, 0.4))' }}>
        {/* CRT Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-50" />
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke="#4A4E58" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
              fontWeight="bold"
            />
            <YAxis 
              stroke="#4A4E58" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
              fontWeight="bold"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0D0F14', 
                border: '4px solid #FF4B4B', 
                borderRadius: '12px', 
                color: '#fff', 
                fontWeight: '900',
                fontFamily: 'monospace',
                boxShadow: '4px 4px 0 0 #000',
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: '#FF4B4B', fontSize: '14px' }}
              labelStyle={{ color: '#FFB800', marginBottom: '4px' }}
              cursor={{ stroke: '#FFB800', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Line 
              type="stepAfter" 
              dataKey="uv" 
              stroke="#FF4B4B" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#FF4B4B', stroke: '#000', strokeWidth: 3 }}
              activeDot={{ r: 6, fill: '#FFB800', stroke: '#000', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
