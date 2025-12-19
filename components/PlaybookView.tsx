
import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight, MoreVertical, CheckCircle2, Shield, Target, Zap } from 'lucide-react';

interface Playbook {
  id: string;
  name: string;
  winRate: string;
  count: number;
  rules: {
    context: string[];
    entry: string[];
    exit: string[];
  };
}

const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: '1',
    name: 'Morning Top Reversal',
    winRate: '68%',
    count: 24,
    rules: {
      context: ['Price extended from 20EMA', 'Near key psychological level', 'RSI overbought (>70)'],
      entry: ['Bearish engulfing candle', 'Volume spike on rejection', 'Break of previous 1m low'],
      exit: ['Tap of VWAP', 'Tap of 20EMA', 'Profit target 2R reached']
    }
  },
  {
    id: '2',
    name: 'Buy At New Low of Day',
    winRate: '42%',
    count: 15,
    rules: {
      context: ['Aggressive sell-off into demand', 'Relative volume high'],
      entry: ['Absorption at lows', 'Structure break on 1m'],
      exit: ['Mid-range target', 'New HOD']
    }
  },
  {
    id: '3',
    name: 'Absorption Reversal',
    winRate: '55%',
    count: 42,
    rules: {
      context: ['Sellers exhausted at level', 'Delta turning positive'],
      entry: ['Big lot buy orders hitting', 'Price holds level despite selling'],
      exit: ['Supply zone reached', 'Trailing stop 1 ATR']
    }
  }
];

const PlaybookView: React.FC = () => {
  const [playbooks] = useState(MOCK_PLAYBOOKS);

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4">
      <header className="px-8 py-6 glass-panel rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Strategy Playbook</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Execution & Setup Library</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all glow-cyan flex items-center gap-2">
          <Plus size={18} /> Add New Framework
        </button>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playbooks.map((pb) => (
            <div key={pb.id} className="glass-panel rounded-[32px] flex flex-col border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all group overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    {pb.winRate} Win Rate
                  </span>
                  <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={20}/></button>
                </div>
                <h3 className="text-xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">{pb.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{pb.count} Instances Tracked</p>
              </div>

              <div className="p-8 space-y-6 flex-1">
                <RuleSnippet title="Context" icon={<Shield size={14}/>} rules={pb.rules.context} color="cyan" />
                <RuleSnippet title="Entry" icon={<Zap size={14}/>} rules={pb.rules.entry} color="emerald" />
                <RuleSnippet title="Exit" icon={<Target size={14}/>} rules={pb.rules.exit} color="rose" />
              </div>

              <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <button className="text-xs font-black text-slate-400 hover:text-white flex items-center gap-1 group/btn uppercase tracking-widest">
                  View Specs <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Backtested
                </div>
              </div>
            </div>
          ))}
          
          <button className="border-2 border-dashed border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-white/5 transition-all group">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:scale-110 transition-all">
              <Plus size={32} />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]">Create New Framework</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const RuleSnippet: React.FC<{ title: string; icon: React.ReactNode; rules: string[]; color: 'cyan' | 'emerald' | 'rose' }> = ({ title, icon, rules, color }) => {
  const colorMap = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400'
  };
  const bgMap = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={colorMap[color]}>{icon}</span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="space-y-2">
        {rules.slice(0, 2).map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-xs font-medium text-slate-400">
            <div className={`w-1 h-1 rounded-full ${bgMap[color]} shadow-[0_0_4px_currentColor]`}></div>
            <span className="truncate">{r}</span>
          </div>
        ))}
        {rules.length > 2 && <p className="text-[10px] text-slate-600 font-bold italic pl-4">+{rules.length - 2} supplementary rules</p>}
      </div>
    </div>
  );
};

export default PlaybookView;
