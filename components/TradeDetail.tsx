
import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle2, ExternalLink, Star, Trash2, Maximize2, Share2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Trade } from '../types';
import CandlestickChart from './CandlestickChart';
import RunningPLChart from './RunningPLChart';
import PlaybookSection from './PlaybookSection';
import { exportTradesToCSV } from '../exportUtils';

interface TradeDetailProps {
  trade: Trade;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (trade: Trade) => void;
}

const TradeDetail: React.FC<TradeDetailProps> = ({ trade, onBack, onDelete, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'playbook' | 'executions'>('stats');
  const [rating, setRating] = useState(trade.rating || 0);
  const [isMaximized, setIsMaximized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ ...trade, screenshot: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleExportTrade = () => {
    const filename = `Trade_${trade.symbol}_${trade.date.replace(/\//g, '-')}.csv`;
    exportTradesToCSV([trade], filename);
  };

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4 relative overflow-y-auto lg:overflow-hidden no-scrollbar">
      {isMaximized && trade.screenshot && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base md:text-xl font-black text-white">{trade.symbol} - Evidence</h2>
            <button onClick={() => setIsMaximized(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <img src={trade.screenshot} alt="Full view" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      <header className="px-6 md:px-8 py-4 md:py-5 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onBack} className="w-10 h-10 glass-panel border border-white/10 rounded-full flex items-center justify-center text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-none">{trade.symbol}</h2>
            <span className="text-slate-500 text-[10px] md:text-xs font-bold mt-1 block">{trade.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => onDelete(trade.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20 uppercase tracking-widest">
             <Trash2 size={14} /> Delete
          </button>
          <button onClick={handleExportTrade} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 uppercase tracking-widest">
             <Share2 size={14} /> Export
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden">
        <aside className="w-full lg:w-80 glass-panel rounded-[32px] flex flex-col overflow-hidden border-white/10">
          <div className="flex border-b border-white/5 p-2 gap-1">
            {['stats', 'playbook'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 space-y-8 flex-1">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net P&L</span>
                  <span className={`text-2xl md:text-3xl font-black ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${Math.abs(trade.netPL).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-4">
                  <StatInfo label="Side" value={trade.side} color={trade.side === 'LONG' ? 'cyan' : 'rose'} />
                  <StatInfo label="Qty" value={trade.contracts.toString()} />
                </div>
                <div className="pt-6 border-t border-white/5">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Execution Rating</span>
                   <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <button key={s} onClick={() => onUpdate({...trade, rating: s})} className={s <= rating ? 'text-cyan-400' : 'text-slate-700'}>
                         <Star size={20} fill={s <= rating ? 'currentColor' : 'none'} />
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'playbook' && <PlaybookSection />}
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-4">
          <div className="h-[250px] md:h-[400px] lg:flex-1 glass-panel rounded-[32px] overflow-hidden relative group">
             {trade.screenshot ? (
               <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black/40">
                 <img src={trade.screenshot} alt="Evidence" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => setIsMaximized(true)} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white"><Maximize2 size={24} /></button>
                   <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white"><ImageIcon size={24} /></button>
                 </div>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/20">
                  <ImageIcon size={32} className="text-slate-700 mb-4" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                    Upload Snapshot
                  </button>
               </div>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpdateScreenshot} className="hidden" />
          </div>
          <div className="h-[200px] md:h-[250px] glass-panel rounded-[32px] p-6 flex flex-col">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Relative Flow</h3>
            <div className="flex-1">
              <RunningPLChart />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatInfo: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-sm md:text-base font-black ${color === 'cyan' ? 'text-cyan-400' : color === 'rose' ? 'text-rose-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default TradeDetail;
