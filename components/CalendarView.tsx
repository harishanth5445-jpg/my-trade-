
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info, Download, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { Trade } from '../types';
import { exportTradesToCSV } from '../exportUtils';

interface CalendarViewProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

interface DayStats {
  pl: number;
  trades: Trade[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades, onTradeClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate daily P&L and store trades per date
  const dailyStats = useMemo(() => {
    const stats: Record<string, DayStats> = {};
    trades.forEach(trade => {
      // Input format is MM/DD/YYYY
      const [m, d, y] = trade.date.split('/');
      const dateKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      if (!stats[dateKey]) {
        stats[dateKey] = { pl: 0, trades: [] };
      }
      stats[dateKey].pl += trade.netPL;
      stats[dateKey].trades.push(trade);
    });
    return stats;
  }, [trades]);

  // Calculate footer aggregate stats based on active account history
  const footerStats = useMemo(() => {
    return trades.reduce((acc, t) => {
      if (t.netPL > 0) acc.grossWins += t.netPL;
      else if (t.netPL < 0) acc.totalLoss += t.netPL;
      acc.netFlow += t.netPL;
      return acc;
    }, { grossWins: 0, totalLoss: 0, netFlow: 0 });
  }, [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  const handleExport = () => {
    const filename = `Performance_Report_${monthName}_${year}.csv`;
    exportTradesToCSV(trades, filename);
  };

  const renderCells = () => {
    const cells = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      
      if (!isCurrentMonth) {
        cells.push(<div key={`empty-${i}`} className="bg-white/[0.02] h-40 border-b border-r border-white/5"></div>);
        continue;
      }

      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
      const stats = dailyStats[dateString];
      const isToday = new Date().toDateString() === new Date(year, month, dayNumber).toDateString();

      cells.push(
        <div key={dayNumber} className={`h-40 p-3 border-b border-r border-white/5 transition-all hover:bg-white/10 group relative flex flex-col ${isToday ? 'bg-cyan-500/10' : 'bg-transparent'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-black ${isToday ? 'text-cyan-400' : 'text-slate-500'}`}>
              {dayNumber}
            </span>
            {stats && (
              <span className={`text-[9px] font-black uppercase tracking-tighter ${stats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.trades.length} {stats.trades.length === 1 ? 'Trade' : 'Trades'}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pb-2">
            {stats?.trades.map((trade) => (
              <button
                key={trade.id}
                onClick={(e) => { e.stopPropagation(); onTradeClick(trade); }}
                className={`w-full text-left p-1.5 rounded-lg border flex items-center justify-between group/pill transition-all active:scale-95 ${
                  trade.netPL >= 0 
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' 
                  : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full ${trade.netPL >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                  <span className="text-[9px] font-black text-white uppercase tracking-tight truncate">{trade.symbol}</span>
                </div>
                <span className={`text-[9px] font-black tabular-nums ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${Math.abs(trade.netPL).toFixed(0)}
                </span>
              </button>
            ))}
          </div>

          {stats && (
            <div className="mt-auto pt-2 border-t border-white/5 bg-white/[0.02] -mx-3 -mb-3 px-3 pb-2 rounded-b-[32px]">
              <div className="flex justify-between items-center">
                <div className={`text-sm font-black ${stats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.pl >= 0 ? '+' : '-'}${Math.abs(stats.pl).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
                <div className="flex items-center gap-1">
                  {stats.pl >= 0 ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-rose-400" />}
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-500 ${stats.pl >= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} 
                  style={{ width: `${Math.min(100, (Math.abs(stats.pl) / 3000) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)] group transition-all">
            <CalendarIcon size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase">{monthName}</h1>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">{year} Performance Ledger</span>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 ml-4">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronLeft size={18}/></button>
            <button onClick={goToToday} className="px-5 py-2 text-[10px] font-black text-slate-300 hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profitable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Losing</span>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black px-8 py-3 rounded-2xl font-black text-sm hover:opacity-90 transition-all glow-cyan flex items-center gap-2 active:scale-95"
          >
             <Download size={18} /> Export Data
          </button>
        </div>
      </header>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col animate-fade-in-up border-white/10">
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-5 text-center border-r border-white/5 last:border-r-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="grid grid-cols-7 min-h-full">
            {renderCells()}
          </div>
        </div>
      </div>

      <footer className="px-10 py-5 glass-panel rounded-[32px] flex justify-between items-center border-white/10">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross P&L</span>
            <span className="text-xl font-black text-emerald-400">
              +${footerStats.grossWins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Loss</span>
            <span className="text-xl font-black text-rose-400">
              -${Math.abs(footerStats.totalLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Flow</span>
            <span className={`text-xl font-black ${footerStats.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {footerStats.netFlow >= 0 ? '+' : '-'}${Math.abs(footerStats.netFlow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 uppercase tracking-widest">
          <Info size={14} className="text-cyan-400"/>
          Account Telemetry Active
        </div>
      </footer>
    </div>
  );
};

export default CalendarView;
