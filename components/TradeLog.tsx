
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Filter as FilterIcon, ChevronDown, Plus, Search, Trash2, Wallet, X, Zap, Activity, BellRing, Target, BarChart2, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade, Status, Side } from '../types';
import { Account } from '../App';
import { SETUPS, INSTRUMENTS } from '../constants';

interface TradeLogProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onNewTrade: () => void;
  onNavigateToNews: () => void;
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
    hour12: true 
  });

  return (
    <div className="flex flex-col items-end px-3 md:px-5 border-l border-white/10">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] animate-pulse ${closed ? 'bg-rose-500 shadow-rose-500/80' : 'bg-emerald-400 shadow-emerald-400/80'}`}></div>
        <span className="text-[10px] md:text-[11px] font-black text-white tabular-nums tracking-tight">{timeString}</span>
      </div>
      <span className={`text-[6px] font-black uppercase tracking-widest ${closed ? 'text-rose-400' : 'text-emerald-400'}`}>
        {closed ? 'Closed' : 'CME Live'}
      </span>
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

  useEffect(() => {
    setDisplayValue(value);
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

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  allLabel?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, icon, value, options, onChange, allLabel = 'ALL' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
          value !== allLabel 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
        }`}
      >
        <span className={value !== allLabel ? 'text-emerald-400' : 'text-slate-600'}>{icon}</span>
        <span className="max-w-[80px] truncate">{value === allLabel ? label : value}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 glass-panel border border-white/10 rounded-2xl p-2 z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1">
          <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
            <button 
              onClick={() => { onChange(allLabel); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${value === allLabel ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
            >
              Reset {label}
            </button>
            <div className="h-[1px] bg-white/5 my-1" />
            {options.map(opt => (
              <button 
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${value === opt ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TradeLog: React.FC<TradeLogProps> = ({ 
  trades, 
  onTradeClick, 
  onDelete, 
  onNewTrade, 
  onNavigateToNews,
  currentAccount, 
  accounts, 
  onAccountChange,
  onAddAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [sideFilter, setSideFilter] = useState<Side | 'ALL'>('ALL');
  const [setupFilter, setSetupFilter] = useState<string | 'ALL'>('ALL');
  const [symbolFilter, setSymbolFilter] = useState<string | 'ALL'>('ALL');
  
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
      const matchesSide = sideFilter === 'ALL' || trade.side === sideFilter;
      const matchesSetup = setupFilter === 'ALL' || trade.setup === setupFilter;
      const matchesSymbol = symbolFilter === 'ALL' || trade.symbol === symbolFilter;
      return matchesSearch && matchesStatus && matchesSide && matchesSetup && matchesSymbol;
    });
  }, [trades, searchTerm, statusFilter, sideFilter, setupFilter, symbolFilter]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    if (total === 0) return { netPL: 0, winRate: 0, profitFactor: 0, efficiency: 0 };
    const wins = filteredTrades.filter(t => t.status === 'WIN').length;
    const netPL = filteredTrades.reduce((acc, t) => acc + t.netPL, 0);
    const grossWins = filteredTrades.filter(t => t.netPL > 0).reduce((acc, t) => acc + t.netPL, 0);
    const grossLosses = Math.abs(filteredTrades.filter(t => t.netPL < 0).reduce((acc, t) => acc + t.netPL, 0));
    return { netPL, winRate: (wins / total) * 100, profitFactor: grossLosses > 0 ? (grossWins / grossLosses) : grossWins, efficiency: ((filteredTrades.filter(t => t.status !== 'LOSS').length) / total) * 100 };
  }, [filteredTrades]);

  const hasActiveFilters = statusFilter !== 'ALL' || sideFilter !== 'ALL' || setupFilter !== 'ALL' || symbolFilter !== 'ALL' || searchTerm !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSideFilter('ALL');
    setSetupFilter('ALL');
    setSymbolFilter('ALL');
  };

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4">
      {/* Primary Header */}
      <header className="px-4 md:px-8 py-5 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between relative z-[110] animate-fade-in-up border-white/5 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-5">
          <div className="relative">
            <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="flex items-center gap-3.5 group text-left transition-all rounded-2xl active:scale-95">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <Wallet size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] md:text-[17px] font-black text-white uppercase tracking-tight leading-none">{currentAccount.name}</h2>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{currentAccount.type}</span>
              </div>
            </button>
            {isAccountMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 md:w-72 glass-panel rounded-[24px] p-2 border border-white/10 shadow-2xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1 p-1">
                  {accounts.map((acc) => (
                    <button 
                      key={acc.id}
                      onClick={() => { onAccountChange(acc); setIsAccountMenuOpen(false); }} 
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${currentAccount.id === acc.id ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-black ${currentAccount.id === acc.id ? 'text-emerald-400' : 'text-white'}`}>{acc.name}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{acc.provider}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                  <button onClick={() => { onAddAccount(); setIsAccountMenuOpen(false); }} className="w-full py-2.5 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-dashed border-emerald-500/20 hover:bg-emerald-500/5 transition-all">
                    Register New
                  </button>
                </div>
              </div>
            )}
          </div>
          <LiveClock />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search strategy..." className="w-full pl-10 pr-4 py-2.5 text-[11px] bg-white/5 border border-white/10 rounded-xl outline-none text-white font-bold focus:border-emerald-500/50 transition-all" />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button onClick={onNavigateToNews} className="flex-1 md:flex-none bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest hover:bg-amber-500/20">
              <BellRing size={16} /> News
            </button>
            <button onClick={onNewTrade} className="flex-1 md:flex-none bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg uppercase tracking-widest">
              <Plus size={16} /> Log Entry
            </button>
          </div>
        </div>
      </header>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-2">
        <div className="flex items-center gap-2 text-slate-600 mr-2">
          <FilterIcon size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Filters</span>
        </div>
        
        <FilterDropdown 
          label="Instrument" 
          icon={<Hash size={12}/>} 
          value={symbolFilter} 
          options={INSTRUMENTS} 
          onChange={setSymbolFilter} 
        />

        <FilterDropdown 
          label="Strategy Type" 
          icon={<Zap size={12}/>} 
          value={setupFilter} 
          options={SETUPS} 
          onChange={setSetupFilter} 
        />

        <FilterDropdown 
          label="Direction" 
          icon={<Activity size={12}/>} 
          value={sideFilter} 
          options={['LONG', 'SHORT']} 
          onChange={(val) => setSideFilter(val as any)} 
        />

        <FilterDropdown 
          label="Outcome" 
          icon={<Target size={12}/>} 
          value={statusFilter} 
          options={['WIN', 'LOSS', 'BE']} 
          onChange={(val) => setStatusFilter(val as any)} 
        />

        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Portfolio Net" numericValue={stats.netPL} trend={stats.netPL >= 0 ? 1 : -1} prefix="$" isPositive={stats.netPL >= 0} />
        <StatCard title="Win Accuracy" numericValue={stats.winRate} trend={stats.winRate > 50 ? 1 : -1} suffix="%" decimals={1} />
        <StatCard title="Profit Factor" numericValue={stats.profitFactor} trend={stats.profitFactor > 1.5 ? 1 : -1} decimals={2} />
        <StatCard title="Efficiency" numericValue={stats.efficiency} trend={stats.efficiency > 70 ? 1 : -1} suffix="%" decimals={0} />
      </div>

      {/* Execution Ledger Table */}
      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col animate-fade-in-up border-white/10 shadow-2xl min-h-[400px]">
        <div className="overflow-x-auto overflow-y-auto flex-1 no-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-3xl" style={{ backgroundColor: 'var(--bg-color)' }}>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Execution</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Asset Class</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Strategy / Setup</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-center">Outcome</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Direction</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-right">Net Flow</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-right">Duration</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} onClick={() => onTradeClick(trade)} className="cursor-pointer transition-all hover:bg-white/[0.04] group">
                  <td className="px-6 md:px-10 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-black text-white">{trade.date}</span>
                      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Timestamp Verified</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <BarChart2 size={14} />
                      </div>
                      <span className="text-sm md:text-base font-black text-white">{trade.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-lg group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 transition-all">
                      {trade.setup}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-5 text-center">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${trade.status === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : trade.status === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
                      {trade.status === 'WIN' ? 'Profit' : trade.status === 'LOSS' ? 'Loss' : 'B-Even'}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-5">
                    <div className="flex items-center gap-2">
                      {trade.side === 'LONG' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${trade.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.side}</span>
                    </div>
                  </td>
                  <td className={`px-6 md:px-10 py-5 text-right text-sm md:text-base font-black tabular-nums ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.netPL >= 0 ? '+' : '-'}${Math.abs(trade.netPL).toFixed(2)}
                  </td>
                  <td className="px-6 md:px-10 py-5 text-right text-[11px] font-black text-slate-600 tabular-nums uppercase tracking-widest">{trade.duration}</td>
                  <td className="px-6 md:px-10 py-5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="p-2 text-slate-700 hover:text-rose-400 lg:opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30 w-full">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-500">
                <BarChart2 size={32} />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-300">No matching telemetry</p>
                <p className="text-[10px] font-bold text-slate-600 mt-2">Adjust your active filter parameters</p>
              </div>
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
  <div className="glass-panel p-4 md:p-6 rounded-[32px] flex flex-col gap-1 md:gap-2 group hover:bg-white/[0.04] transition-all border-white/5 overflow-hidden relative">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
      <div className={`w-2 h-2 rounded-full ${trend > 0 ? 'bg-emerald-500' : 'bg-rose-500'} blur-[4px]`}></div>
    </div>
    <div className="flex items-end justify-between z-10">
      <AnimatedValue value={numericValue} prefix={prefix} suffix={suffix} decimals={decimals} className={`text-base md:text-2xl font-black ${title.includes('Portfolio') ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`} />
    </div>
    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
  </div>
);

export default TradeLog;
