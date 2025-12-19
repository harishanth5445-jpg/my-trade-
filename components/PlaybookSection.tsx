
import React, { useState } from 'react';
import { Check, ChevronDown, Info } from 'lucide-react';

const PlaybookSection: React.FC = () => {
  const [activePlaybook, setActivePlaybook] = useState('ORB Strategy');
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({
    'Rule-0-0': true,
    'Rule-1-0': true
  });

  const sections = [
    { title: 'Context', items: ['Opening Range (5m or 15m)', 'Volume > 1.5x average on open', 'Clear gap up/down'] },
    { title: 'Entry', items: ['Breakout of High/Low', 'Retest of boundary'] },
  ];

  const totalRules = sections.reduce((acc, sec) => acc + sec.items.length, 0);
  const checkedCount = Object.values(checkedRules).filter(Boolean).length;
  const progressPercent = (checkedCount / totalRules) * 100;

  const toggleRule = (id: string) => {
    setCheckedRules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex justify-between items-end mb-2">
           <h3 className="text-sm font-black text-white uppercase tracking-tighter">{activePlaybook}</h3>
           <span className="text-[10px] font-black text-cyan-400 uppercase">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 glow-cyan" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-4">
          <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
             {section.title} <div className="h-[1px] flex-1 bg-white/5"></div>
          </h4>
          <div className="space-y-2">
            {section.items.map((item, iIdx) => {
              const id = `Rule-${sIdx}-${iIdx}`;
              const isChecked = checkedRules[id];
              return (
                <label 
                  key={id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                    isChecked ? 'bg-white/10 border-cyan-500/30' : 'bg-white/5 border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={!!isChecked}
                      onChange={() => toggleRule(id)}
                      className="peer appearance-none w-6 h-6 border-2 border-white/10 rounded-xl checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer" 
                    />
                    <Check className="absolute left-0 top-0 w-6 h-6 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-1" size={20} strokeWidth={4} />
                  </div>
                  <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-500'}`}>
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaybookSection;
