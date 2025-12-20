
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
    
    return trades.filter(t => {
      const tradeDate = new Date(t.date);
      return tradeDate >= limit;
    });
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

  const { equityData } = useMemo(() => {
    let runningPL = 0;
    let peak = 0;
    const reversedTrades = [...filteredTrades].reverse();
    
    const equity = reversedTrades.map((t, i) => {
      runningPL += t.netPL;
      if (runningPL > peak) peak = runningPL;
      const drawdown = runningPL - peak;
      return { 
        index: i + 1, 
        equity: runningPL, 
        drawdown: drawdown,
        date: t.date,
        symbol: t.symbol
      };
    });

    return { equityData: equity };
  }, [filteredTrades]);

  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const map: Record<string, number> = {};
    filteredTrades.forEach(t => {
      const day = days[new Date(t.date).getDay()];
      map[day] = (map[day] || 0) + t.netPL;
    });
    return days.map(day => ({ name: day.substring(0, 3), pl: Math.round(map[day] || 0) }));
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

  const timeframeLabels = {
    'ALL': 'All History',
    '7D': 'Last 7 Days',
    '30D': 'Last 30 Days',
    '90D': 'Last 90 Days'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-8">
              <span className="text-[10px] font-bold text-slate-400">EQUITY</span>
              <span className={`text-[10px] font-black ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${payload[0].value.toLocaleString()}
              </span>
            </div>
            {payload[1] && (
              <div className="flex justify-between gap-8">
                <span className="text-[10px] font-bold text-slate-400">DRAWDOWN</span>
                <span className="text-[10px] font-black text-rose-500">
                  ${Math.abs(payload[1].value).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4 overflow-hidden">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between border-white/10 relative z-50">
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
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Avg Win</span>
              <span className="text-xs font-black text-emerald-400">${Math.round(stats.avgWin)}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Avg Loss</span>
              <span className="text-xs font-black text-rose-400">${Math.round(stats.avgLoss)}</span>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
              className="flex items-center gap-2 text-[9px] font-black text-slate-300 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-emerald-400" /> 
                {timeframeLabels[timeframe]}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isTimeframeOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTimeframeOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-2xl border border-white/10 shadow-2xl z-50 p-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {(['ALL', '7D', '30D', '90D'] as Timeframe[]).map(tf => (
                  <button 
                    key={tf}
                    onClick={() => { setTimeframe(tf); setIsTimeframeOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === tf ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {timeframeLabels[tf]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleAuditExport}
            className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-7 py-2.5 rounded-2xl font-black text-xs hover:bg-emerald-400/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest"
          >
             <Download size={16} /> Advanced Audit
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar space-y-4 pb-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          <WideReportStatCard title="Portfolio Net" value={`$${stats.netPL.toLocaleString()}`} icon={<TrendingUp size={16}/>} sub="Total Realized" />
          <WideReportStatCard title="Edge Ratio" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={16}/>} sub="Strike Probability" />
          <WideReportStatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={<Activity size={16}/>} sub="Risk Efficiency" />
          <WideReportStatCard title="Expectancy" value={`$${(stats.total > 0 ? stats.netPL / stats.total : 0).toFixed(2)}`} icon={<Zap size={16}/>} sub="Per execution" />
        </div>

        {/* Main Advanced Charts */}
        <div className="grid grid-cols-3 gap-4 h-[450px]">
          {/* Advanced Equity Trajectory */}
          <div className="col-span-2 glass-panel rounded-[32px] p-8 flex flex-col border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Equity Trajectory Curve</h3>
                  <p className="text-[7px] font-bold text-slate-600 uppercase mt-1">Real-time Balance vs Peak Drawdown</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">Growth</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">Drawdown</span>
                  </div>
               </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Area type="step" dataKey="equity" stroke="#10b981" strokeWidth={3} fill="url(#equityGrad)" animationDuration={1000} />
                  <Area type="step" dataKey="drawdown" stroke="#f43f5e" strokeWidth={1} fill="url(#drawdownGrad)" animationDuration={1000} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outcome distribution with details */}
          <div className="glass-panel rounded-[32px] p-8 flex flex-col border-white/10">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Outcome distribution</h3>
            <div className="flex-1 w-full relative mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={12} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stability</span>
                <span className="text-3xl font-black text-white">{stats.winRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row: Behavioral & Tooling */}
        <div className="grid grid-cols-2 gap-4 h-[350px]">
          {/* Day of Week Performance */}
          <div className="glass-panel rounded-[32px] p-8 border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Weekly Edge Profile</h3>
              <BarChartIcon size={14} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                          ${payload[0].value} Net
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="pl" radius={[4, 4, 4, 4]}>
                    {dayOfWeekData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? '#10b981' : '#f43f5e'} opacity={0.6} className="hover:opacity-100 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Psychological & Discipline Metrics */}
          <div className="glass-panel rounded-[32px] p-8 border-white/10 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Cognitive Metrics</h3>
              <Brain size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2">
               <MetricBar label="Rule Adherence" value={92} icon={<CheckSquare size={10} />} color="emerald" />
               <MetricBar label="Risk Discipline" value={88} icon={<ShieldCheck size={10} />} color="cyan" />
               <MetricBar label="Entry Patience" value={76} icon={<Timer size={10} />} color="amber" />
               <MetricBar label="Market Session Focus" value={95} icon={<Clock size={10} />} color="indigo" />
               
               <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white uppercase tracking-wider">Psychology Audit</p>
                    <p className="text-[8px] font-medium text-slate-500 mt-1 leading-relaxed">Systematic adherence is optimal. Consider tightening risk scaling during drawdown cycles.</p>
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
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className={`h-full transition-all duration-1000 ease-out shadow-lg ${colors[color]}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
  );
};

export default ReportsView;
