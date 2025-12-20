
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon, Hash, Activity, X, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { Trade } from '../types';
import { exportTradesToCSV } from '../exportUtils';
import Modal from './Modal';

interface CalendarViewProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

interface DayStats {
  pl: number;
  trades: Trade[];
  symbols: string[];
  dateLabel: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades, onTradeClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStats, setSelectedDayStats] = useState<DayStats | null>(null);

  const dailyStats = useMemo(() => {
    const stats: Record<string, DayStats> = {};
    trades.forEach(trade => {
      const [m, d, y] = trade.date.split('/');
      const dateKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      if (!stats[dateKey]) {
        stats[dateKey] = { 
          pl: 0, 
          trades: [], 
          symbols: [],
          dateLabel: trade.date
        };
      }
      stats[dateKey].pl += trade.netPL;
      stats[dateKey].trades.push(trade);
      if (!stats[dateKey].symbols.includes(trade.symbol)) {
        stats[dateKey].symbols.push(trade.symbol);
      }
    });
    return stats;
  }, [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(currentDate);

  const handleExport = () => {
    const monthYear = `${monthName}_${year}`;
    exportTradesToCSV(trades, `Nexus_Journal_${monthYear}.csv`);
  };

  const handleDayClick = (stats: DayStats) => {
    setSelectedDayStats(stats);
  };

  const renderCells = () => {
    const cells = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    let currentWeekPL = 0;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const dateString = isCurrentMonth ? `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}` : null;
      const stats = dateString ? dailyStats[dateString] : null;
      if (stats) currentWeekPL += stats.pl;

      if (!isCurrentMonth) {
        cells.push(<div key={`empty-${i}`} className="bg-white/[0.01] h-28 md:h-40 border-b border-r border-white/5"></div>);
      } else {
        cells.push(
          <div 
            key={dayNumber} 
            onClick={() => stats && handleDayClick(stats)}
            className={`h-28 md:h-40 p-2 md:p-3 border-b border-r border-white/5 transition-all flex flex-col group relative ${stats ? 'cursor-pointer hover:bg-white/[0.06]' : 'bg-white/[0.01]'}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] md:text-[11px] font-black ${stats ? 'text-slate-300' : 'text-slate-600'} group-hover:text-white transition-colors`}>{dayNumber}</span>
              {stats && stats.trades.length > 0 && (
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-lg">
                  <Activity size={8} className="text-emerald-400" />
                  <span className="text-[8px] font-black text-slate-400 tabular-nums">{stats.trades.length}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {stats && stats.symbols.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats.symbols.slice(0, 3).map((sym, idx) => (
                    <div 
                      key={idx} 
                      className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[7px] md:text-[8px] font-black text-cyan-400 uppercase tracking-tighter"
                    >
                      {sym}
                    </div>
                  ))}
                  {stats.symbols.length > 3 && (
                    <div className="text-[7px] font-black text-slate-600 self-center ml-0.5">+{stats.symbols.length - 3}</div>
                  )}
                </div>
              )}
            </div>

            {stats && (
              <div className="mt-auto text-right">
                <span className={`text-[9px] md:text-[11px] font-black tabular-nums ${stats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.pl >= 0 ? '+' : '-'}${Math.abs(stats.pl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}
            
            {/* Hover indicator for clickable cells */}
            {stats && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
              </div>
            )}
          </div>
        );
      }

      if ((i + 1) % 7 === 0) {
        cells.push(
          <div key={`weekly-${i}`} className="h-28 md:h-40 border-b border-white/5 bg-white/[0.02] flex flex-col items-center justify-center p-2 relative">
            <div className="absolute top-2 text-[7px] font-black text-slate-700 uppercase tracking-widest">Week Net</div>
            <span className={`text-[10px] md:text-[12px] font-black tabular-nums ${currentWeekPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${Math.abs(currentWeekPL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        );
        currentWeekPL = 0;
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4 overflow-y-auto lg:overflow-hidden no-scrollbar">
      <header className="px-6 md:px-10 py-5 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase leading-none">{monthName} <span className="text-slate-500">{year}</span></h1>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1.5">Execution Distribution</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl ml-auto md:ml-6 border border-white/5">
            <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-400 text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-300 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
        >
           <Download size={14} /> Export Month
        </button>
      </header>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col border-white/10 min-h-[500px] shadow-2xl">
        <div className="grid grid-cols-[repeat(7,1fr)_40px] md:grid-cols-[repeat(7,1fr)_80px] border-b border-white/5 bg-white/[0.03]">
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
            <div key={d} className="py-3.5 text-center border-r border-white/5 text-[9px] font-black text-slate-500 tracking-widest">{d}</div>
          ))}
          <div className="py-3.5 text-center bg-emerald-500/5 text-[9px] font-black text-emerald-400 tracking-widest">NET</div>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="grid grid-cols-[repeat(7,1fr)_40px] md:grid-cols-[repeat(7,1fr)_80px]">
            {renderCells()}
          </div>
        </div>
      </div>

      <footer className="px-8 py-4 glass-panel rounded-[24px] md:rounded-[32px] flex justify-between items-center border-white/10 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-cyan-400" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unique Assets Tracked: {Array.from(new Set(trades.map(t => t.symbol))).length}</span>
        </div>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Proprietary Terminal v3.1</span>
      </footer>

      {/* Daily Audit Modal */}
      <Modal 
        isOpen={!!selectedDayStats} 
        onClose={() => setSelectedDayStats(null)} 
        title={`Execution Audit: ${selectedDayStats?.dateLabel}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aggregate Daily P&L</span>
              <span className={`text-2xl font-black tabular-nums ${selectedDayStats && selectedDayStats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedDayStats?.pl !== undefined ? (selectedDayStats.pl >= 0 ? '+' : '-') : ''}
                ${Math.abs(selectedDayStats?.pl || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sample Size</span>
              <div className="text-xl font-black text-white">{selectedDayStats?.trades.length} Executions</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 flex items-center gap-2">
              <Target size={14} className="text-cyan-500" /> Detailed Session Breakdown
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
              {selectedDayStats?.trades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    onTradeClick(trade);
                    setSelectedDayStats(null);
                  }}
                  className="w-full group flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${trade.netPL >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                      {trade.side === 'LONG' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{trade.symbol}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${trade.side === 'LONG' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                          {trade.side}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{trade.setup}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black tabular-nums ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.netPL >= 0 ? '+' : '-'}${Math.abs(trade.netPL).toFixed(2)}
                    </span>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-0.5">Verified P&L</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => setSelectedDayStats(null)}
              className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all tracking-widest"
            >
              Dismiss
            </button>
            <button 
              onClick={() => {
                if (selectedDayStats) {
                  exportTradesToCSV(selectedDayStats.trades, `Daily_Audit_${selectedDayStats.dateLabel.replace(/\//g, '-')}.csv`);
                }
              }}
              className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-black bg-emerald-400 hover:bg-emerald-300 transition-all tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Download size={14} /> Audit Log
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarView;
