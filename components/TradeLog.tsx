
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
  const previousValueRef = useRef(value);

  useEffect(() => {
    setDisplayValue(value);
    previousValueRef.current = value;
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
  
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trades, searchTerm, statusFilter]);

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
    <div className="flex flex-col h-full p-4 lg:pl-0">
      <header className="px-4 md:px-8 py-5 glass-panel rounded-[32px] mb-5 flex flex-col md:flex-row items-center justify-between relative z-50 animate-fade-in-up border-white/5 gap-4">
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
                    <div key={acc.id} className="group/item flex items-center gap-1">
                      <button 
                        onClick={() => { onAccountChange(acc); setIsAccountMenuOpen(false); }} 
                        className={`flex-1 text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${currentAccount.id === acc.id ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-black ${currentAccount.id === acc.id ? 'text-emerald-400' : 'text-white'}`}>{acc.name}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">{acc.provider}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                  <button onClick={() => { onAddAccount(); setIsAccountMenuOpen(false); }} className="w-full py-2.5 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-dashed border-emerald-500/20">
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
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 text-[11px] bg-white/5 border border-white/10 rounded-xl outline-none text-white font-bold" />
          </div>
          <button onClick={onNewTrade} className="w-full md:w-auto bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg uppercase tracking-widest">
            <Plus size={16} /> Log Entry
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Portfolio Net" numericValue={stats.netPL} trend={stats.netPL >= 0 ? 1 : -1} prefix="$" isPositive={stats.netPL >= 0} />
        <StatCard title="Win Accuracy" numericValue={stats.winRate} trend={stats.winRate > 50 ? 1 : -1} suffix="%" decimals={1} />
        <StatCard title="Profit Factor" numericValue={stats.profitFactor} trend={stats.profitFactor > 1.5 ? 1 : -1} decimals={2} />
        <StatCard title="Efficiency" numericValue={stats.efficiency} trend={stats.efficiency > 70 ? 1 : -1} suffix="%" decimals={0} />
      </div>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col animate-fade-in-up border-white/10 shadow-2xl">
        <div className="overflow-x-auto overflow-y-auto flex-1 no-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-3xl" style={{ backgroundColor: 'rgba(10, 10, 11, 0.98)' }}>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Execution</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Instrument</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-center">Outcome</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5">Side</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-right">Net P&L</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5 text-right">Duration</th>
                <th className="px-6 md:px-10 py-5 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} onClick={() => onTradeClick(trade)} className="cursor-pointer transition-all hover:bg-white/[0.04] group">
                  <td className="px-6 md:px-10 py-5 text-[12px] font-medium text-slate-400">{trade.date}</td>
                  <td className="px-6 md:px-10 py-5 text-sm md:text-base font-black text-white">{trade.symbol}</td>
                  <td className="px-6 md:px-10 py-5 text-center">
                    <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${trade.status === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : trade.status === 'LOSS' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-5 text-[12px] font-black uppercase tracking-widest">
                    <span className={trade.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>{trade.side}</span>
                  </td>
                  <td className={`px-6 md:px-10 py-5 text-right text-sm md:text-base font-black ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.netPL >= 0 ? '+' : '-'}${Math.abs(trade.netPL).toFixed(2)}
                  </td>
                  <td className="px-6 md:px-10 py-5 text-right text-[12px] font-medium text-slate-500">{trade.duration}</td>
                  <td className="px-6 md:px-10 py-5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="p-2 text-slate-600 hover:text-rose-400 lg:opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50 w-full">
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
  <div className="glass-panel p-3 md:p-4 rounded-[24px] flex flex-col gap-0.5 md:gap-1 group hover:bg-white/10 transition-all border-white/10 overflow-hidden relative">
    <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
    <div className="flex items-end justify-between z-10">
      <AnimatedValue value={numericValue} prefix={prefix} suffix={suffix} decimals={decimals} className={`text-sm md:text-lg font-black ${title.includes('Portfolio') ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`} />
    </div>
  </div>
);

export default TradeLog;
