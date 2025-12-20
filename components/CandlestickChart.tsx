
import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_CHART_DATA } from '../constants';

const CandlestickChart: React.FC = () => {
  const processedData = MOCK_CHART_DATA.map(d => ({
    ...d,
    bottom: Math.min(d.open, d.close),
    height: Math.abs(d.open - d.close),
    color: d.close >= d.open ? '#2dd4bf' : '#fb7185',
    wickBottom: d.low,
    wickHeight: d.high - d.low
  }));

  return (
    <div className="w-full h-full rounded-2xl border border-white/5 overflow-hidden p-4" style={{ backgroundColor: 'var(--chart-bg)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--chart-grid)" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--chart-text)', fontSize: 9, fontWeight: 800 }} 
            dy={10}
          />
          <YAxis 
            domain={['dataMin - 10', 'dataMax + 10']} 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--chart-text)', fontSize: 9, fontWeight: 800 }}
          />
          <Tooltip 
            cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: '#000', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              fontSize: '10px', 
              fontWeight: 900, 
              color: '#fff' 
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="wickHeight" stackId="wick" barSize={1} isAnimationActive={false}>
            {processedData.map((entry, index) => (
              <Cell key={`wick-${index}`} fill={entry.color} opacity={0.6} />
            ))}
          </Bar>
          <Bar dataKey="height" stackId="body" barSize={8} isAnimationActive={false}>
            {processedData.map((entry, index) => (
              <Cell key={`body-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
