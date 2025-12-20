
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Zap, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Trade } from '../types';

interface ReportsViewProps {
  trades: Trade[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ trades }) => {
  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.status === 'WIN').length;
    const netPL = trades.reduce((acc, t) => acc + t.netPL, 0);
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const grossWins = trades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(trades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins;
    return { total, wins, netPL, winRate, profitFactor };
  }, [trades]);

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4 overflow-hidden">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between border-white/10">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group transition-all">
            <BarChart3 size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Performance Analytics</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Statistical Edge & Audit Reports</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 mr-4 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Total Logs</span>
              <span className="text-xs font-black text-white">{stats.total}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
              <span className="text-xs font-black text-emerald-400">{stats.winRate.toFixed(1)}%</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[9px] font-black text-slate-300 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest">
             <CalendarIcon size={14} className="text-emerald-400" /> Rolling 30D
          </button>
          <button className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-7 py-2.5 rounded-2xl font-black text-xs hover:bg-emerald-400/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest">
             <Filter size={16} /> Deep Audit
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar space-y-4 pb-4">
        {/* Top KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          <WideReportStatCard title="Portfolio Net" value={`$${stats.netPL.toLocaleString()}`} icon={<TrendingUp size={16}/>} sub="Total Realized" />
          <WideReportStatCard title="Edge Ratio" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={16}/>} sub="Strike Probability" />
          <WideReportStatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={<Activity size={16}/>} sub="Risk Efficiency" />
          <WideReportStatCard title="Expectancy" value={`$${(stats.total > 0 ? stats.netPL / stats.total : 0).toFixed(2)}`} icon={<Zap size={16}/>} sub="Per execution" />
        </div>
      </div>
    </div>
  );
};

const WideReportStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; sub: string }> = ({ title, value, icon, sub }) => (
    <div className="glass-panel p-5 rounded-[32px] flex items-center justify-between border-white/10 group hover:bg-white/[0.06] transition-all relative overflow-hidden active:scale-[0.98]">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
        <div className="flex flex-col gap-1 z-10">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</span>
            <span className="text-xl font-black text-white">{value}</span>
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-1">{sub}</span>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shadow-inner">
            {icon}
        </div>
    </div>
);

export default ReportsView;
