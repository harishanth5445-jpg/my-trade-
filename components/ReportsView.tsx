
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Zap, AlertCircle, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trade } from '../types';

interface ReportsViewProps {
  trades: Trade[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ trades }) => {
  // Aggregate Data
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

  // Data for Setup Performance
  const setupData = useMemo(() => {
    const setups: Record<string, { name: string; pl: number; count: number }> = {};
    trades.forEach(t => {
      if (!setups[t.setup]) setups[t.setup] = { name: t.setup, pl: 0, count: 0 };
      setups[t.setup].pl += t.netPL;
      setups[t.setup].count += 1;
    });
    return Object.values(setups).sort((a, b) => b.pl - a.pl);
  }, [trades]);

  // Data for Win/Loss Ratio
  const pieData = [
    { name: 'Wins', value: stats.wins, color: '#2dd4bf' },
    { name: 'Losses', value: stats.losses, color: '#fb7185' },
    { name: 'BE', value: trades.filter(t => t.status === 'BE').length, color: '#94a3b8' },
  ];

  // Cumulative P&L Data
  const cumulativePLData = useMemo(() => {
    let running = 0;
    return trades.slice().reverse().map((t, i) => {
      running += t.netPL;
      return { index: i + 1, value: running, date: t.date };
    });
  }, [trades]);

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 glass-panel rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Performance Analytics</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Comprehensive Trade Insights</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-black text-slate-300 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10">
             <CalendarIcon size={16} /> Last 30 Days
          </button>
          <button className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all glow-cyan flex items-center gap-2">
             <Filter size={18} /> Deep Audit
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar space-y-4">
        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <ReportStatCard title="Total Net P&L" value={`$${stats.netPL.toLocaleString()}`} icon={<TrendingUp size={18}/>} color="emerald" />
          <ReportStatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={18}/>} color="cyan" />
          <ReportStatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={<Activity size={18}/>} color="indigo" />
          <ReportStatCard title="Avg Win/Loss" value="1.82" icon={<Zap size={18}/>} color="amber" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-4 h-[400px]">
          {/* Equity Curve */}
          <div className="col-span-2 glass-panel rounded-[32px] p-8 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Equity Growth Curve</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativePLData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="index" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#equityGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win/Loss Pie */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 self-start">Execution Quality</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 w-full gap-2 mt-4">
                {pieData.map(d => (
                    <div key={d.name} className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                        <span className="text-sm font-black text-white">{d.value}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-4 h-[350px]">
          {/* Setup Efficiency */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Setup Profitability</h3>
             <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={setupData}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="pl" radius={[0, 4, 4, 0]}>
                            {setupData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? '#22d3ee' : '#fb7185'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Risk/Reward Distribution */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Psychological Indicators</h3>
             <div className="space-y-6">
                <RiskProgress label="Average MAE Absorption" value={84} color="rose" />
                <RiskProgress label="Execution Discipline" value={92} color="cyan" />
                <RiskProgress label="Setup Consistency" value={76} color="emerald" />
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <AlertCircle className="text-amber-500 flex-shrink-0" size={18} />
                        <p className="text-[11px] text-amber-200/70 font-medium leading-relaxed">
                            Insight: You are most profitable on <span className="text-amber-400 font-bold">Tuesday Mornings</span> using the <span className="text-amber-400 font-bold">Absorption Reversal</span> setup. Avoid trading after 3:00 PM EST.
                        </p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="glass-panel p-6 rounded-[32px] flex items-center justify-between border-white/10 group hover:bg-white/[0.08] transition-all">
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
            <span className="text-2xl font-black text-white">{value}</span>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
    </div>
);

const RiskProgress: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span>{label}</span>
            <span className={`text-${color}-400`}>{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
                className={`h-full bg-${color}-500 transition-all duration-700`} 
                style={{ width: `${value}%`, boxShadow: `0 0 10px rgba(var(--${color}-rgb), 0.5)` }}
            ></div>
        </div>
    </div>
);

export default ReportsView;
