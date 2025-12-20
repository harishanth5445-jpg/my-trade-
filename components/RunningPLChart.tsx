
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PL_DATA } from '../constants';

const RunningPLChart: React.FC = () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  // Use pure black for light mode in B&W theme
  const brandColor = isLight ? '#000000' : '#22d3ee';

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={MOCK_PL_DATA}>
          <defs>
            <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={brandColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={brandColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis hide />
          <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isLight ? '#ffffff' : '#000', 
              border: `1px solid ${isLight ? '#000000' : 'rgba(255,255,255,0.1)'}`, 
              borderRadius: '12px' 
            }}
            itemStyle={{ color: isLight ? '#000000' : '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={brandColor} 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorPL)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RunningPLChart;
