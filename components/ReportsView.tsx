
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Zap, AlertCircle, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trade } from '../types';

interface ReportsViewProps {
  trades: Trade[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ trades }) => {
  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.status === 'WIN').length;
    const losses = trades.filter(t => t.status === 'LOSS').length;
    const netPL = trades.reduce((acc, t) => acc + t.netPL, 0);
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const grossWins = trades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(trades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins;
    return { total, wins, losses, netPL, winRate, profitFactor };
  }, [trades]);

  const cumulativePLData = useMemo(() => {
    let running = 0;
    return trades.slice().reverse().map((t, i) => {
      running += t.netPL;
      return { index: i + 1, value: running };
    });
  }, [trades]);

  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#10b981' },
    { name: 'Losses', value: stats.losses, color: '#f43f5e' },
    { name: 'BE', value: trades.filter(t => t.status === 'BE').length, color: '#64748b' },
  ];

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4 overflow-hidden">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between animate-fade-in-up border-white/10">
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
          <button className="flex items-center gap-2 text-[9px] font-black text-slate-300 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest">
             <CalendarIcon size={14} className="text-emerald-400" /> Rolling 30D
          </button>
          <button className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-7 py-2.5 rounded-2xl font-black text-xs hover:bg-emerald-400/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest">
             <Filter size={16} /> Deep Audit
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar space-y-4 animate-fade-in-up">
        <div className="grid grid-cols-4 gap-4">
          <WideReportStatCard title="Portfolio Net" value={`$${stats.netPL.toLocaleString()}`} icon={<TrendingUp size={16}/>} />
          <WideReportStatCard title="Edge Ratio" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={16}/>} />
          <WideReportStatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={<Activity size={16}/>} />
          <WideReportStatCard title="Reward Scale" value="1.82" icon={<Zap size={16}/>} />
        </div>

        <div className="grid grid-cols-3 gap-4 h-[400px]">
          <div className="col-span-2 glass-panel rounded-[32px] p-8 flex flex-col border-white/10">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Equity Trajectory Curve</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativePLData}>
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#curveGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-8 flex flex-col items-center border-white/10">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 self-start">Outcome Distribution</h3>
            <div className="flex-1 w-full relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                <span className="text-2xl font-black text-white">{stats.winRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-2">
                {pieData.map(d => (
                    <div key={d.name} className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                        <span className="text-sm font-black text-white mt-1">{d.value}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 h-[300px]">
           <div className="glass-panel rounded-[32px] p-8 border-white/10">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Setup Efficiency (Alpha)</h3>
           </div>
           <div className="glass-panel rounded-[32px] p-8 border-white/10">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Cognitive Metrics</h3>
              <div className="space-y-6">
                 <MetricBar label="Adherence to Rules" value={92} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const WideReportStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glass-panel p-5 rounded-[32px] flex items-center justify-between border-white/10 group hover:bg-white/[0.06] transition-all relative overflow-hidden">
        <div className="flex flex-col gap-1 z-10">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</span>
            <span className="text-lg font-black text-white">{value}</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
            {icon}
        </div>
    </div>
);

const MetricBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-2">
      <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
          <span>{label}</span>
          <span className="text-emerald-400">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${value}%` }}></div>
      </div>
  </div>
);

export default ReportsView;
