
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Filter as FilterIcon, ChevronDown, Plus, Search, MoreHorizontal, Trash2, TrendingUp, TrendingDown, Check, X, Wallet, Clock, Globe, Pencil, Calendar } from 'lucide-react';
import { Trade, Status } from '../types';
import { Account } from '../App';

interface TradeLogProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onNewTrade: () => void;
  currentAccount: Account;
  accounts: Account[];
  onAccountChange: (account: Account) => void;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col items-end px-6 border-l border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        <span className="text-sm font-black text-white tabular-nums tracking-tight">{timeString}</span>
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dateString}</span>
    </div>
  );
};

const AnimatedValue: React.FC<{ 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  decimals?: number;
  className?: string;
}> = ({ value, prefix = '', suffix = '', decimals = 2, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    previousValueRef.current = value;
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [value]);

  const formatted = Math.abs(displayValue).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {displayValue < 0 && !prefix.includes('-') ? '-' : ''}
      {prefix}{formatted}{suffix}
    </span>
  );
};

const TradeLog: React.FC<TradeLogProps> = ({ 
  trades, 
  onTradeClick, 
  onDelete, 
  onNewTrade, 
  currentAccount, 
  accounts, 
  onAccountChange,
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
      const matchesMonth = selectedMonth === 'ALL' || (new Date(trade.date).getMonth() === selectedMonth);
      const tradeTime = new Date(trade.date).getTime();
      const start = startDate ? new Date(startDate).getTime() : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      const matchesDateRange = (!start || tradeTime >= start) && (!end || tradeTime <= end);
      return matchesSearch && matchesStatus && matchesMonth && matchesDateRange;
    });
  }, [trades, searchTerm, statusFilter, selectedMonth, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    if (total === 0) return { netPL: 0, winRate: 0, profitFactor: 0, efficiency: 0 };
    const wins = filteredTrades.filter(t => t.status === 'WIN').length;
    const netPL = filteredTrades.reduce((acc, t) => acc + t.netPL, 0);
    const grossWins = filteredTrades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(filteredTrades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    return { netPL, winRate: (wins / total) * 100, profitFactor: grossLosses > 0 ? (grossWins / grossLosses) : grossWins, efficiency: ((filteredTrades.filter(t => t.status !== 'LOSS').length) / total) * 100 };
  }, [filteredTrades]);

  return (
    <div className="flex flex-col h-full p-4 pl-0">
      <header className="px-8 py-6 glass-panel rounded-[32px] mb-4 flex items-center justify-between relative z-50 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-4 group text-left transition-all p-1 pr-4 rounded-3xl hover:bg-white/5 active:scale-95">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all">
                <Wallet size={24} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{currentAccount.name}</h2>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentAccount.type}</span>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Active History</span>
                </div>
              </div>
            </button>
            {isAccountMenuOpen && (
              <div className="absolute top-full left-0 mt-4 w-80 glass-panel rounded-[28px] p-2 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl z-50">
                <div className="px-4 py-3 mb-2 flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Managed Account</span></div>
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="group/acc relative flex items-center gap-1">
                      <button onClick={() => { onAccountChange(acc); setIsAccountMenuOpen(false); }} className={`flex-1 text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group ${currentAccount.id === acc.id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                        <div className="flex flex-col">
                          <span className={`text-sm font-black ${currentAccount.id === acc.id ? 'text-cyan-400' : 'text-white'}`}>{acc.name}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{acc.provider}</span>
                        </div>
                        {currentAccount.id === acc.id && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
                      </button>
                      <div className="flex flex-col gap-1 pr-1 opacity-0 group-hover/acc:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEditAccount(acc); setIsAccountMenuOpen(false); }} className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"><Pencil size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteAccount(acc.id); setIsAccountMenuOpen(false); }} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5"><button onClick={() => { onAddAccount(); setIsAccountMenuOpen(false); }} className="w-full px-4 py-3 rounded-2xl text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all"><Plus size={14} /> Add Funded Account</button></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => { setIsFilterOpen(!isFilterOpen); setIsMonthOpen(false); setIsDateRangeOpen(false); }} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${statusFilter !== 'ALL' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <FilterIcon size={16} /> {statusFilter === 'ALL' ? 'All Results' : statusFilter}
              </button>
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {['ALL', 'WIN', 'LOSS', 'BE'].map((s) => (
                    <button key={s} onClick={() => { setStatusFilter(s as any); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between">
                      <span className={s === 'WIN' ? 'text-emerald-400' : s === 'LOSS' ? 'text-rose-400' : 'text-slate-300'}>{s}</span>
                      {statusFilter === s && <Check size={14} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setIsDateRangeOpen(!isDateRangeOpen); setIsFilterOpen(false); setIsMonthOpen(false); }} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${startDate || endDate ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Calendar size={16} /> {startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Date Range'}
              </button>
              {isDateRangeOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-[28px] p-6 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Point</label><input type="date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500/50 [color-scheme:dark]" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Point</label><input type="date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500/50 [color-scheme:dark]" /></div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { setStartDate(null); setEndDate(null); setIsDateRangeOpen(false); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Reset</button>
                      <button onClick={() => setIsDateRangeOpen(false)} className="flex-1 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition-all shadow-lg">Apply</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setIsMonthOpen(!isMonthOpen); setIsFilterOpen(false); setIsDateRangeOpen(false); }} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${selectedMonth !== 'ALL' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                {selectedMonth === 'ALL' ? 'All Months' : months[selectedMonth]} <ChevronDown size={14} />
              </button>
              {isMonthOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl max-h-64 overflow-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                  <button onClick={() => { setSelectedMonth('ALL'); setIsMonthOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between text-slate-300">All Months {selectedMonth === 'ALL' && <Check size={14} className="text-cyan-400" />}</button>
                  {months.map((m, idx) => (
                    <button key={m} onClick={() => { setSelectedMonth(idx); setIsMonthOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between text-slate-300">{m} {selectedMonth === idx && <Check size={14} className="text-cyan-400" />}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <LiveClock />
          <div className="flex items-center gap-4">
            <div className="relative w-64 mr-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search symbol..." className="w-full pl-12 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-slate-600 font-bold" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={14} /></button>}
            </div>
            <button onClick={onNewTrade} className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg glow-cyan flex items-center gap-2 active:scale-95 transition-transform"><Plus size={18} /> New Trade</button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="animate-fade-in-up delay-100"><StatCard title="Net P&L" numericValue={stats.netPL} trend={stats.netPL >= 0 ? 1 : -1} prefix="$" isPositive={stats.netPL >= 0} /></div>
        <div className="animate-fade-in-up delay-200"><StatCard title="Win Rate" numericValue={stats.winRate} trend={stats.winRate > 50 ? 1 : -1} suffix="%" decimals={1} /></div>
        <div className="animate-fade-in-up delay-300"><StatCard title="Profit Factor" numericValue={stats.profitFactor} trend={stats.profitFactor > 1.5 ? 1 : -1} decimals={2} /></div>
        <div className="animate-fade-in-up delay-400"><StatCard title="Efficiency" numericValue={stats.efficiency} trend={stats.efficiency > 70 ? 1 : -1} suffix="%" decimals={0} /></div>
      </div>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col animate-fade-in-up delay-500">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-color)' }}>
                <th className="px-8 py-6 border-b border-white/5">Date</th>
                <th className="px-8 py-6 border-b border-white/5">Asset</th>
                <th className="px-8 py-6 border-b border-white/5 text-center">Status</th>
                <th className="px-8 py-6 border-b border-white/5">Side</th>
                <th className="px-8 py-6 border-b border-white/5 text-right">Net P&L</th>
                <th className="px-8 py-6 border-b border-white/5 text-right">Dur</th>
                <th className="px-8 py-6 border-b border-white/5">Setup</th>
                <th className="px-8 py-6 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.length === 0 ? (
                <tr><td colSpan={8} className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-4"><div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-slate-700"><TrendingUp size={32} /></div><p className="text-sm font-black text-slate-500 uppercase tracking-widest">No executions recorded yet</p></div></td></tr>
              ) : (
                filteredTrades.map((trade, idx) => (
                  <tr 
                    key={trade.id} 
                    className="hover:bg-white/5 cursor-pointer transition-colors group animate-fade-in-up" 
                    style={{ animationDelay: `${500 + (idx * 50)}ms` }}
                  >
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6 text-sm font-medium text-slate-400">{trade.date}</td>
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6 text-base font-black text-white">{trade.symbol}</td>
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6 text-center"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trade.status === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : trade.status === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>{trade.status}</span></td>
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6"><span className={`text-sm font-black ${trade.side === 'LONG' ? 'text-cyan-400' : 'text-rose-400'}`}>{trade.side}</span></td>
                    <td onClick={() => onTradeClick(trade)} className={`px-8 py-6 text-right text-base font-black ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.netPL >= 0 ? '+' : ''}${Math.abs(trade.netPL).toFixed(2)}</td>
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6 text-right text-sm font-medium text-slate-500">{trade.duration}</td>
                    <td onClick={() => onTradeClick(trade)} className="px-8 py-6"><span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-black px-3 py-1.5 rounded-lg border border-indigo-500/20">{trade.setup}</span></td>
                    <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete Trade"><Trash2 size={16} /></button>
                      <button className="p-2 text-slate-600 group-hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  numericValue: number; 
  trend: number; 
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isPositive?: boolean;
}> = ({ title, numericValue, trend, prefix = '', suffix = '', decimals = 2, isPositive = true }) => (
  <div className="glass-panel p-6 rounded-[32px] flex flex-col gap-1 group hover:bg-white/10 transition-all border-white/10 overflow-hidden relative active:scale-[0.98]">
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${trend > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] z-10">{title}</span>
    <div className="flex items-end justify-between z-10">
      <AnimatedValue value={numericValue} prefix={prefix} suffix={suffix} decimals={decimals} className={`text-2xl font-black transition-colors ${title === 'Net P&L' ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`} />
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{trend > 0 ? 'OPTIMAL' : 'RISK'}</span>
      </div>
    </div>
  </div>
);

export default TradeLog;