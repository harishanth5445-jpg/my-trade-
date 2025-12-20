
import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Activity, Zap, Calendar as CalendarIcon, Filter, Brain, CheckSquare, ShieldCheck, Timer, AlertCircle, BarChart as BarChartIcon, Clock, ChevronDown, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { Trade } from '../types';
import { exportTradesToCSV } from '../exportUtils';

interface ReportsViewProps {
  trades: Trade[];
}

type Timeframe = 'ALL' | '7D' | '30D' | '90D';

const ReportsView: React.FC<ReportsViewProps> = ({ trades }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const filteredTrades = useMemo(() => {
    if (timeframe === 'ALL') return trades;
    const now = new Date();
    const limit = new Date();
    if (timeframe === '7D') limit.setDate(now.getDate() - 7);
    else if (timeframe === '30D') limit.setDate(now.getDate() - 30);
    else if (timeframe === '90D') limit.setDate(now.getDate() - 90);
    return trades.filter(t => new Date(t.date) >= limit);
  }, [trades, timeframe]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === 'WIN').length;
    const losses = filteredTrades.filter(t => t.status === 'LOSS').length;
    const netPL = filteredTrades.reduce((acc, t) => acc + t.netPL, 0);
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const grossWins = filteredTrades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(filteredTrades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins;
    const avgWin = wins > 0 ? grossWins / wins : 0;
    const avgLoss = losses > 0 ? grossLosses / losses : 0;
    return { total, wins, losses, netPL, winRate, profitFactor, avgWin, avgLoss };
  }, [filteredTrades]);

  const equityData = useMemo(() => {
    let runningPL = 0;
    let peak = 0;
    return [...filteredTrades].reverse().map((t, i) => {
      runningPL += t.netPL;
      if (runningPL > peak) peak = runningPL;
      return { index: i + 1, equity: runningPL, drawdown: runningPL - peak, date: t.date };
    });
  }, [filteredTrades]);

  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, number> = {};
    filteredTrades.forEach(t => {
      const day = days[new Date(t.date).getDay()];
      map[day] = (map[day] || 0) + t.netPL;
    });
    return days.map(name => ({ name, pl: Math.round(map[name] || 0) }));
  }, [filteredTrades]);

  const pieData = [
    { name: 'Profit', value: stats.wins, color: '#10b981' },
    { name: 'Loss', value: stats.losses, color: '#f43f5e' },
    { name: 'BE', value: filteredTrades.filter(t => t.status === 'BE').length, color: '#64748b' },
  ];

  const handleAuditExport = () => {
    const filename = `Nexus_Audit_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`;
    exportTradesToCSV(filteredTrades, filename);
  };

  const timeframeLabels = { 'ALL': 'All History', '7D': '7 Days', '30D': '30 Days', '90D': '90 Days' };

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4 overflow-y-auto lg:overflow-hidden no-scrollbar">
      <header className="px-6 py-5 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between border-white/10 relative z-50 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase leading-none">Analytics</h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Edge Report</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <button onClick={() => setIsTimeframeOpen(!isTimeframeOpen)} className="w-full flex items-center gap-2 text-[10px] font-black text-slate-300 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 uppercase tracking-widest min-w-[120px] justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-emerald-400" /> 
                {timeframeLabels[timeframe]}
              </div>
              <ChevronDown size={14} className={isTimeframeOpen ? 'rotate-180' : ''} />
            </button>
            {isTimeframeOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-white/10 shadow-2xl z-50 p-1">
                {(['ALL', '7D', '30D', '90D'] as Timeframe[]).map(tf => (
                  <button key={tf} onClick={() => { setTimeframe(tf); setIsTimeframeOpen(false); }} className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeframe === tf ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
                    {timeframeLabels[tf]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleAuditExport} className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Download size={14} /> Audit
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 pb-10 lg:pb-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <WideReportStatCard title="Portfolio Net" value={`$${stats.netPL.toLocaleString()}`} icon={<TrendingUp size={16}/>} sub="Total Realized" />
          <WideReportStatCard title="Edge Ratio" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={16}/>} sub="Strike Prob" />
          <WideReportStatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={<Activity size={16}/>} sub="Efficiency" />
          <WideReportStatCard title="Expectancy" value={`$${(stats.total > 0 ? stats.netPL / stats.total : 0).toFixed(2)}`} icon={<Zap size={16}/>} sub="Per execution" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[450px]">
          <div className="lg:col-span-2 glass-panel rounded-[32px] p-6 lg:p-8 flex flex-col border-white/10 min-h-[300px]">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Equity Curve</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #10b981', fontSize: '10px' }} />
                  <Area type="step" dataKey="equity" stroke="#10b981" strokeWidth={3} fill="url(#eqGrad)" />
                  <Area type="step" dataKey="drawdown" stroke="#f43f5e" strokeWidth={1} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 lg:p-8 flex flex-col border-white/10 min-h-[300px]">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Outcome distribution</h3>
            <div className="flex-1 w-full relative mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{stats.winRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {pieData.map(d => (
                <div key={d.name} className="flex flex-col items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[7px] font-black text-slate-500 uppercase">{d.name}</span>
                  <span className="text-xs font-black text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[350px]">
          <div className="glass-panel rounded-[32px] p-6 lg:p-8 border-white/10 flex flex-col min-h-[250px]">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Weekly Performance</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
                  <Bar dataKey="pl" radius={[4, 4, 4, 4]}>
                    {dayOfWeekData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 lg:p-8 border-white/10 flex flex-col min-h-[250px]">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Psychology Metrics</h3>
            <div className="space-y-4">
               <MetricBar label="Rule Adherence" value={92} color="emerald" />
               <MetricBar label="Risk Discipline" value={88} color="cyan" />
               <MetricBar label="Entry Patience" value={76} color="amber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WideReportStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; sub: string }> = ({ title, value, icon, sub }) => (
    <div className="glass-panel p-4 md:p-5 rounded-[24px] md:rounded-[32px] flex items-center justify-between border-white/10 group overflow-hidden">
        <div className="flex flex-col gap-0.5">
            <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
            <span className="text-base md:text-xl font-black text-white">{value}</span>
            <span className="text-[6px] md:text-[7px] font-bold text-slate-600 uppercase mt-0.5">{sub}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
            {icon}
        </div>
    </div>
);

const MetricBar: React.FC<{ label: string; value: number; color: 'emerald' | 'cyan' | 'amber' }> = ({ label, value, color }) => {
  const colors = { emerald: 'bg-emerald-500', cyan: 'bg-cyan-500', amber: 'bg-amber-500' };
  return (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
  );
};

export default ReportsView;
