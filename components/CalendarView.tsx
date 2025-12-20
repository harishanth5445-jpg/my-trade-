
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info, Download, TrendingUp, TrendingDown, Calendar as CalendarIcon, BarChart } from 'lucide-react';
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

  const dailyStats = useMemo(() => {
    const stats: Record<string, DayStats> = {};
    trades.forEach(trade => {
      const [m, d, y] = trade.date.split('/');
      const dateKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      if (!stats[dateKey]) stats[dateKey] = { pl: 0, trades: [] };
      stats[dateKey].pl += trade.netPL;
      stats[dateKey].trades.push(trade);
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
          <div key={dayNumber} className="h-28 md:h-40 p-2 md:p-3 border-b border-r border-white/5 hover:bg-white/10 transition-all flex flex-col">
            <span className="text-[10px] font-black text-slate-500 mb-1">{dayNumber}</span>
            <div className="flex-1 overflow-hidden space-y-1">
              {stats?.trades.slice(0, 2).map(t => (
                <div key={t.id} className={`w-full h-1.5 md:h-2 rounded-full ${t.netPL >= 0 ? 'bg-emerald-400' : 'bg-rose-400'} opacity-60`} />
              ))}
            </div>
            {stats && (
              <div className="mt-auto">
                <span className={`text-[8px] md:text-[10px] font-black ${stats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${Math.abs(stats.pl).toFixed(0)}
                </span>
              </div>
            )}
          </div>
        );
      }

      if ((i + 1) % 7 === 0) {
        cells.push(
          <div key={`weekly-${i}`} className="h-28 md:h-40 border-b border-white/5 bg-white/[0.03] flex flex-col items-center justify-center p-2">
            <span className={`text-[9px] md:text-[10px] font-black ${currentWeekPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${Math.abs(currentWeekPL).toFixed(0)}
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
      <header className="px-6 md:px-10 py-5 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <CalendarIcon size={20} />
          </div>
          <h1 className="text-xl font-black text-white uppercase">{monthName} <span className="text-slate-500">{year}</span></h1>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl ml-auto md:ml-4">
            <button onClick={prevMonth} className="p-2 text-slate-400"><ChevronLeft size={16}/></button>
            <button onClick={nextMonth} className="p-2 text-slate-400"><ChevronRight size={16}/></button>
          </div>
        </div>
        <button className="w-full md:w-auto bg-gradient-to-r from-emerald-400 to-cyan-400 text-black px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest">
           Export
        </button>
      </header>

      <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col border-white/10 min-h-[500px]">
        <div className="grid grid-cols-[repeat(7,1fr)_50px] md:grid-cols-[repeat(7,1fr)_100px] border-b border-white/5 bg-white/[0.02]">
          {['S','M','T','W','T','F','S'].map(d => (
            <div key={d} className="py-3 text-center border-r border-white/5 text-[9px] font-black text-slate-500">{d}</div>
          ))}
          <div className="py-3 text-center bg-white/[0.05] text-[9px] font-black text-emerald-400">W</div>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="grid grid-cols-[repeat(7,1fr)_50px] md:grid-cols-[repeat(7,1fr)_100px]">
            {renderCells()}
          </div>
        </div>
      </div>

      <footer className="px-6 py-4 glass-panel rounded-[24px] md:rounded-[32px] flex justify-center items-center border-white/10">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Telemetry Active</span>
      </footer>
    </div>
  );
};

export default CalendarView;
