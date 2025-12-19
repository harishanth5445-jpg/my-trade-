
import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight, MoreVertical, Shield, Target, Zap } from 'lucide-react';

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
    name: 'NEWS TRADE',
    winRate: '62%',
    count: 18,
    rules: {
      context: ['High-impact economic release (CPI/NFP)', 'Significant deviation from consensus'],
      entry: ['Momentum break of first 1m candle', 'VWAP reclaim after initial spike'],
      exit: ['Tap of next major psychological level', '1:2 Risk/Reward ratio reached']
    }
  },
  {
    id: '2',
    name: 'ORB STRATEGY',
    winRate: '58%',
    count: 32,
    rules: {
      context: ['Opening Range (5m or 15m)', 'Volume > 1.5x average on open'],
      entry: ['Breakout of High/Low of Opening Range', 'Retest of the range boundary'],
      exit: ['Opposite side of Opening Range', 'Targeting 2x range size']
    }
  }
];

const PlaybookView: React.FC = () => {
  const [playbooks] = useState(MOCK_PLAYBOOKS);

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group transition-all">
            <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Strategy Playbook</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Execution Frameworks & Protocols</p>
          </div>
        </div>
        <button className="bg-emerald-400 hover:bg-emerald-300 text-black px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20">
          <Plus size={18} /> New Framework
        </button>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playbooks.map((pb) => (
            <div key={pb.id} className="glass-panel rounded-[32px] flex flex-col border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group overflow-hidden">
              <div className="p-7 border-b border-white/5 bg-white/[0.02] relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                    {pb.winRate} Win Probability
                  </span>
                  <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={18}/></button>
                </div>
                <h3 className="text-lg font-black text-white mb-0.5 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{pb.name}</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{pb.count} Verified Instances</p>
              </div>

              <div className="p-7 space-y-5 flex-1 bg-black/20">
                <RuleSection title="Context" icon={<Shield size={14}/>} rules={pb.rules.context} color="emerald" />
                <RuleSection title="Entry" icon={<Zap size={14}/>} rules={pb.rules.entry} color="emerald" />
                <RuleSection title="Exit" icon={<Target size={14}/>} rules={pb.rules.exit} color="rose" />
              </div>

              <div className="px-7 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <button className="text-[9px] font-black text-slate-400 hover:text-white flex items-center gap-2 group/btn uppercase tracking-[0.2em] transition-all">
                  Inspect Specs <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div> Backtested
                </div>
              </div>
            </div>
          ))}
          
          <button className="border-2 border-dashed border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group active:scale-[0.98]">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:scale-110 transition-all">
              <Plus size={24} />
            </div>
            <span className="font-black text-[9px] uppercase tracking-[0.3em]">Register Protocol</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const RuleSection: React.FC<{ title: string; icon: React.ReactNode; rules: string[]; color: string }> = ({ title, icon, rules }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2 mb-1 opacity-70">
      <span className="text-emerald-400">{icon}</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
    </div>
    <div className="space-y-2">
      {rules.map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 leading-tight">
          <div className="w-1 h-1 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0"></div>
          <span>{r}</span>
        </div>
      ))}
      <p className="text-[8px] text-slate-500 font-black italic pl-3 uppercase tracking-widest">+1 Supplementary Rules</p>
    </div>
  </div>
);

export default PlaybookView;
