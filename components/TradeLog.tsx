
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Filter as FilterIcon, ChevronDown, Plus, Search, MoreHorizontal, Trash2, TrendingUp, TrendingDown, Check, X, Wallet, Clock, Globe, Pencil, Calendar, XCircle, Zap, Activity } from 'lucide-react';
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

const isMarketClosed = (date: Date) => {
  const ctFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    hour12: false,
    weekday: 'short',
  });
  
  const parts = ctFormatter.formatToParts(date);
  const weekday = parts.find(p => p.type === 'weekday')?.value;
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const isDailyBreak = hour === 16;
  const isFridayClose = (weekday === 'Fri' && hour >= 16);
  const isSaturday = weekday === 'Sat';
  const isSundayOpen = (weekday === 'Sun' && hour < 17);

  return isDailyBreak || isFridayClose || isSaturday || isSundayOpen;
};

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const closed = isMarketClosed(time);
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
    <div className="flex flex-col items-end px-4 border-l border-white/10">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] animate-pulse transition-colors duration-1000 ${
          closed ? 'bg-rose-500 shadow-rose-500/80' : 'bg-emerald-400 shadow-emerald-400/80'
        }`}></div>
        <span className="text-[11px] font-black text-white tabular-nums tracking-tight">{timeString}</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
         <span className={`text-[6px] font-black uppercase tracking-widest ${closed ? 'text-rose-400' : 'text-emerald-400'}`}>
           {closed ? 'Closed' : 'CME Live'}
         </span>
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{dateString}</span>
      </div>
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
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [monthFilter, setMonthFilter] = useState<number | 'ALL'>('ALL');
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [sideFilter, setSideFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isStrategyMenuOpen, setIsStrategyMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const closed = isMarketClosed(currentTime);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const strategies = Array.from(new Set(trades.map(t => t.setup)));

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
      const matchesStrategy = strategyFilter === 'ALL' || trade.setup === strategyFilter;
      const matchesSide = sideFilter === 'ALL' || trade.side === sideFilter;
      
      const tradeDate = new Date(trade.date);
      const matchesMonth = monthFilter === 'ALL' || tradeDate.getMonth() === monthFilter;
      
      let matchesRange = true;
      if (startDate) {
        matchesRange = matchesRange && tradeDate >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesRange = matchesRange && tradeDate <= end;
      }
      
      return matchesSearch && matchesStatus && matchesMonth && matchesRange && matchesStrategy && matchesSide;
    });
  }, [trades, searchTerm, statusFilter, monthFilter, startDate, endDate, strategyFilter, sideFilter]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    if (total === 0) return { netPL: 0, winRate: 0, profitFactor: 0, efficiency: 0 };
    const wins = filteredTrades.filter(t => t.status === 'WIN').length;
    const netPL = filteredTrades.reduce((acc, t) => acc + t.netPL, 0);
    const grossWins = filteredTrades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(filteredTrades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    return { netPL, winRate: (wins / total) * 100, profitFactor: grossLosses > 0 ? (grossWins / grossLosses) : grossWins, efficiency: ((filteredTrades.filter(t => t.status !== 'LOSS').length) / total) * 100 };
  }, [filteredTrades]);

  const resetDateRange = () => {
    setStartDate('');
    setEndDate('');
    setIsRangeOpen(false);
  };

  const closeAllMenus = () => {
    setIsAccountMenuOpen(false);
    setIsFilterMenuOpen(false);
    setIsMonthMenuOpen(false);
    setIsRangeOpen(false);
    setIsStrategyMenuOpen(false);
    setIsSideMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-4 pl-0">
      <header className="px-6 py-4 glass-panel rounded-[28px] mb-4 flex items-center justify-between relative z-50 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => { closeAllMenus(); setIsAccountMenuOpen(!isAccountMenuOpen); }} className="flex items-center gap-3 group text-left transition-all rounded-2xl active:scale-95">
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                <Wallet size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight leading-none">{currentAccount.name}</h2>
                  <ChevronDown size={12} className={`text-slate-500 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{currentAccount.type}</span>
                </div>
              </div>
            </button>
            {isAccountMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 glass-panel rounded-[24px] p-1.5 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl z-50">
                <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1">
                  {accounts.map((acc) => (
                    <button key={acc.id} onClick={() => { onAccountChange(acc); setIsAccountMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${currentAccount.id === acc.id ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black ${currentAccount.id === acc.id ? 'text-emerald-400' : 'text-white'}`}>{acc.name}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{acc.provider}</span>
                      </div>
                      {currentAccount.id === acc.id && <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-6 w-[1px] bg-white/10 mx-0.5" />
          
          <div className="flex items-center gap-1.5">
            {/* Status Button (Ultra Compact) */}
            <div className="relative">
              <button onClick={() => { closeAllMenus(); setIsFilterMenuOpen(!isFilterMenuOpen); }} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${statusFilter !== 'ALL' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <FilterIcon size={10} /> {statusFilter === 'ALL' ? 'Status' : statusFilter}
              </button>
              {isFilterMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 glass-panel rounded-lg p-1 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl z-50">
                  {['ALL', 'WIN', 'LOSS', 'BE'].map(status => (
                    <button key={status} onClick={() => { setStatusFilter(status as any); setIsFilterMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${statusFilter === status ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {status === 'ALL' ? 'All' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Strategy Button (Ultra Compact) */}
            <div className="relative">
              <button onClick={() => { closeAllMenus(); setIsStrategyMenuOpen(!isStrategyMenuOpen); }} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${strategyFilter !== 'ALL' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Zap size={10} /> {strategyFilter === 'ALL' ? 'Strategy' : strategyFilter}
              </button>
              {isStrategyMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 glass-panel rounded-lg p-1 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl z-50">
                  <button onClick={() => { setStrategyFilter('ALL'); setIsStrategyMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${strategyFilter === 'ALL' ? 'text-cyan-400' : 'text-slate-400'}`}>
                    All Strategies
                  </button>
                  {strategies.map(strat => (
                    <button key={strat} onClick={() => { setStrategyFilter(strat); setIsStrategyMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${strategyFilter === strat ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {strat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Side Button (Ultra Compact) */}
            <div className="relative">
              <button onClick={() => { closeAllMenus(); setIsSideMenuOpen(!isSideMenuOpen); }} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${sideFilter !== 'ALL' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Activity size={10} /> {sideFilter === 'ALL' ? 'Side' : sideFilter}
              </button>
              {isSideMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-36 glass-panel rounded-lg p-1 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl z-50">
                  {['ALL', 'LONG', 'SHORT'].map(side => (
                    <button key={side} onClick={() => { setSideFilter(side); setIsSideMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${sideFilter === side ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {side === 'ALL' ? 'All Sides' : side}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Month Button (Ultra Compact) */}
            <div className="relative">
              <button onClick={() => { closeAllMenus(); setIsMonthMenuOpen(!isMonthMenuOpen); }} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${monthFilter !== 'ALL' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <Calendar size={10} /> {monthFilter === 'ALL' ? 'Month' : months[monthFilter as number].substring(0, 3)}
              </button>
              {isMonthMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-40 glass-panel rounded-lg p-1 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl z-50 max-h-52 overflow-y-auto no-scrollbar">
                  <button onClick={() => { setMonthFilter('ALL'); setIsMonthMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${monthFilter === 'ALL' ? 'text-cyan-400' : 'text-slate-400'}`}>
                    History
                  </button>
                  {months.map((month, idx) => (
                    <button key={month} onClick={() => { setMonthFilter(idx); setIsMonthMenuOpen(false); }} className={`w-full text-left px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${monthFilter === idx ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Range Button (Ultra Compact) */}
            <div className="relative">
              <button onClick={() => { closeAllMenus(); setIsRangeOpen(!isRangeOpen); }} className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${startDate || endDate ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'text-slate-400 bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="w-1 h-1 rounded-full bg-emerald-400"></div> Range
              </button>
              {isRangeOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 glass-panel rounded-[20px] p-4 border border-white/10 shadow-2xl animate-in fade-in duration-200 backdrop-blur-3xl z-50">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Start</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-white outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">End</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-white outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark]" />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={resetDateRange} className="flex-1 px-2 py-1.5 rounded-lg text-[7px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 border border-transparent">Clear</button>
                      <button onClick={() => setIsRangeOpen(false)} className="flex-1 px-2 py-1.5 rounded-lg text-[7px] font-black text-black bg-emerald-400 uppercase tracking-widest">Apply</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <LiveClock />
          <div className="flex items-center gap-2 pl-4">
            <div className="relative w-44 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={12} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Asset Search..." className="w-full pl-8 pr-3 py-2 text-[10px] bg-white/5 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all text-white placeholder:text-slate-600 font-bold" />
            </div>
            <button onClick={onNewTrade} className="bg-emerald-400 hover:bg-emerald-300 text-black px-4 py-2 rounded-lg font-black text-[10px] transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-500/10 uppercase tracking-widest">
              <Plus size={14} /> Log Entry
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard title="Portfolio Net" numericValue={stats.netPL} trend={stats.netPL >= 0 ? 1 : -1} prefix="$" isPositive={stats.netPL >= 0} />
        <StatCard title="Win Accuracy" numericValue={stats.winRate} trend={stats.winRate > 50 ? 1 : -1} suffix="%" decimals={1} />
        <StatCard title="Profit Factor" numericValue={stats.profitFactor} trend={stats.profitFactor > 1.5 ? 1 : -1} decimals={2} />
        <StatCard title="Efficiency" numericValue={stats.efficiency} trend={stats.efficiency > 70 ? 1 : -1} suffix="%" decimals={0} />
      </div>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col animate-fade-in-up border-white/10 shadow-2xl">
        <div className="overflow-auto flex-1 no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-3xl" style={{ backgroundColor: 'rgba(10, 10, 11, 0.98)' }}>
                <th className="px-10 py-5 border-b border-white/5">Execution</th>
                <th className="px-10 py-5 border-b border-white/5">Instrument</th>
                <th className="px-10 py-5 border-b border-white/5 text-center">Outcome</th>
                <th className="px-10 py-5 border-b border-white/5">Side</th>
                <th className="px-10 py-5 border-b border-white/5 text-right">Net P&L</th>
                <th className="px-10 py-5 border-b border-white/5 text-right">Duration</th>
                <th className="px-10 py-5 border-b border-white/5">Strategy</th>
                <th className="px-10 py-5 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map((trade, idx) => (
                <tr 
                  key={trade.id} 
                  onClick={() => onTradeClick(trade)}
                  className="cursor-pointer transition-all group animate-fade-in-up relative overflow-hidden hover:bg-white/[0.04]" 
                  style={{ animationDelay: `${100 + (idx * 30)}ms` }}
                >
                  <td className="px-10 py-5 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{trade.date}</td>
                  <td className="px-10 py-5 text-base font-black text-white group-hover:text-emerald-400 transition-colors">{trade.symbol}</td>
                  <td className="px-10 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${trade.status === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : trade.status === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>{trade.status}</span></td>
                  <td className="px-10 py-5"><span className={`text-sm font-black ${trade.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.side}</span></td>
                  <td className={`px-10 py-5 text-right text-base font-black ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.netPL >= 0 ? '+' : '-'}${Math.abs(trade.netPL).toFixed(2)}</td>
                  <td className="px-10 py-5 text-right text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">{trade.duration}</td>
                  <td className="px-10 py-5"><span className="bg-emerald-500/10 text-emerald-300 text-[9px] font-black px-3 py-1.5 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">{trade.setup}</span></td>
                  <td className="px-10 py-5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <XCircle size={40} className="text-slate-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No telemetry found</p>
            </div>
          )}
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
  <div className="glass-panel p-4 rounded-[24px] flex flex-col gap-1 group hover:bg-white/10 transition-all border-white/10 overflow-hidden relative active:scale-[0.98]">
    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-3xl opacity-10 transition-all duration-700 group-hover:opacity-40 group-hover:scale-150 ${trend > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] z-10">{title}</span>
    <div className="flex items-end justify-between z-10 mt-1">
      <AnimatedValue value={numericValue} prefix={prefix} suffix={suffix} decimals={decimals} className={`text-lg font-black transition-colors ${title.includes('Portfolio') ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`} />
      <div className={`flex items-center gap-1 text-[7px] font-black px-2 py-1 rounded-lg transition-all ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
        {trend > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
        <span>{trend > 0 ? 'OPTIMAL' : 'WATCH'}</span>
      </div>
    </div>
  </div>
);

export default TradeLog;
