
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Zap, AlertCircle, Calendar as CalendarIcon, Filter, Brain, CheckSquare, ShieldCheck, Timer } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
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
    // Reverse trades because they are usually newest-first in the log
    return trades.slice().reverse().map((t, i) => {
      running += t.netPL;
      return { index: i + 1, value: running, date: t.date };
    });
  }, [trades]);

  const pieData = [
    { name: 'Profit', value: stats.wins, color: '#10b981' },
    { name: 'Loss', value: stats.losses, color: '#f43f5e' },
    { name: 'BE', value: trades.filter(t => t.status === 'BE').length, color: '#64748b' },
  ];

  // Dynamic Setup Efficiency Data
  const setupEfficiencyData = useMemo(() => {
    const map: Record<string, { total: number; wins: number }> = {};
    trades.forEach(t => {
      if (!map[t.setup]) map[t.setup] = { total: 0, wins: 0 };
      map[t.setup].total++;
      if (t.status === 'WIN') map[t.setup].wins++;
    });

    return Object.entries(map).map(([name, data]) => ({
      name: name.toUpperCase(),
      efficiency: Math.round((data.wins / data.total) * 100),
      count: data.total
    })).sort((a, b) => b.efficiency - a.efficiency);
  }, [trades]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cumulative Flow</p>
          <p className={`text-lg font-black ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {payload[0].value >= 0 ? '+' : '-'}${Math.abs(payload[0].value).toLocaleString()}
          </p>
          <p className="text-[8px] font-bold text-slate-400 mt-1">Execution #{payload[0].payload.index}</p>
        </div>
      );
    }
    return null;
  };

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

        {/* Main Charts Row */}
        <div className="grid grid-cols-3 gap-4 h-[400px]">
          {/* Equity Curve */}
          <div className="col-span-2 glass-panel rounded-[32px] p-8 flex flex-col border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={160} className="text-emerald-400" />
            </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Equity Trajectory Curve</h3>
               <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Optimal Growth</span>
               </div>
            </div>
            <div className="flex-1 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativePLData}>
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#curveGrad)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outcome Pie */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col items-center border-white/10 group">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 self-start">Outcome Distribution</h3>
            <div className="flex-1 w-full relative mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Accuracy</span>
                <span className="text-3xl font-black text-white">{stats.winRate.toFixed(0)}%</span>
                <div className="w-12 h-1 bg-emerald-500/20 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-emerald-400" style={{ width: `${stats.winRate}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-3">
                {pieData.map(d => (
                    <div key={d.name} className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-all">
                        <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: d.color }}></div>
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                        <span className="text-sm font-black text-white mt-1">{d.value}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bottom Metrics Row */}
        <div className="grid grid-cols-2 gap-4 h-[350px]">
           {/* Setup Efficiency */}
           <div className="glass-panel rounded-[32px] p-8 border-white/10 flex flex-col overflow-hidden group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Setup Efficiency (Alpha)</h3>
                <Zap size={14} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                {setupEfficiencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={setupEfficiencyData} layout="vertical" margin={{ left: -20, right: 40 }}>
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" hide />
                      <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-slate-900/90 border border-white/10 p-2 rounded-lg text-[9px] font-black uppercase text-cyan-400">
                              {payload[0].value}% Strike Rate
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Bar dataKey="efficiency" radius={[0, 10, 10, 0]} barSize={24}>
                        {setupEfficiencyData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.efficiency >= 50 ? '#22d3ee' : '#64748b'} fillOpacity={0.8} />
                        ))}
                        <LabelList dataKey="name" position="insideLeft" fill="white" fontSize={8} fontWeight={900} offset={10} />
                        <LabelList dataKey="efficiency" position="right" fill="#94a3b8" fontSize={9} fontWeight={900} formatter={(v: any) => `${v}%`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                     <AlertCircle size={40} />
                     <p className="text-[10px] font-black uppercase tracking-widest mt-2">Insufficient Data</p>
                  </div>
                )}
              </div>
           </div>

           {/* Cognitive Metrics */}
           <div className="glass-panel rounded-[32px] p-8 border-white/10 flex flex-col group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Cognitive Metrics</h3>
                <Brain size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2">
                 <MetricBar label="Rule Adherence" value={92} icon={<CheckSquare size={10} />} color="emerald" />
                 <MetricBar label="FomO Control" value={78} icon={<ShieldCheck size={10} />} color="cyan" />
                 <MetricBar label="Patience Index" value={85} icon={<Timer size={10} />} color="amber" />
                 <MetricBar label="Risk Discipline" value={95} icon={<ShieldCheck size={10} />} color="indigo" />
                 
                 <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-wider">Trading Psychology</p>
                      <p className="text-[8px] font-medium text-slate-500 mt-1 leading-relaxed">Overall discipline is in top 10% of cohort. Focus on entry FOMO for next week.</p>
                    </div>
                 </div>
              </div>
           </div>
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

const MetricBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: 'emerald' | 'cyan' | 'amber' | 'indigo' }> = ({ label, value, icon, color }) => {
  const colors = {
    emerald: 'bg-emerald-500 shadow-[#10b98144]',
    cyan: 'bg-cyan-500 shadow-[#06b6d444]',
    amber: 'bg-amber-500 shadow-[#f59e0b44]',
    indigo: 'bg-indigo-500 shadow-[#6366f144]'
  };

  const textColors = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    indigo: 'text-indigo-400'
  };

  return (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className={textColors[color]}>{icon}</span>
              <span>{label}</span>
            </div>
            <span className={textColors[color]}>{value}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className={`h-full transition-all duration-1000 ease-out shadow-lg ${colors[color]}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
  );
};

export default ReportsView;
