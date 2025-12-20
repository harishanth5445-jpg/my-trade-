
import React, { useState, useRef } from 'react';
import { ArrowLeft, Star, Trash2, Maximize2, Share2, Image as ImageIcon, X, MessageSquareText } from 'lucide-react';
import { Trade } from '../types';
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
  const [activeTab, setActiveTab] = useState<'stats' | 'playbook'>('stats');
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
    <div className="flex flex-col h-full lg:h-screen w-full bg-transparent overflow-y-auto no-scrollbar">
      {/* Fullscreen Evidence Modal */}
      {isMaximized && trade.screenshot && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight">{trade.symbol} Evidence</h2>
            <button 
              onClick={() => setIsMaximized(false)} 
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <img src={trade.screenshot} alt="Full view" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="p-4 lg:p-6 pb-0">
        <header className="px-5 md:px-8 py-4 md:py-5 glass-panel rounded-[24px] md:rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-4 border-white/5">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button onClick={onBack} className="w-10 h-10 glass-panel border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black text-white leading-none truncate">{trade.symbol}</h2>
              <span className="text-slate-500 text-[10px] md:text-xs font-bold mt-1 block uppercase tracking-widest">{trade.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => onDelete(trade.id)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20 uppercase tracking-widest hover:bg-rose-500/20 transition-all"
            >
               <Trash2 size={14} /> Delete
            </button>
            <button 
              onClick={handleExportTrade} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all"
            >
               <Share2 size={14} /> Export
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-6 gap-4 overflow-visible lg:overflow-hidden">
        
        {/* Left Side: Analysis Panel */}
        <aside className="w-full lg:w-96 glass-panel rounded-[24px] md:rounded-[32px] flex flex-col border-white/5 bg-white/[0.02] shrink-0 h-auto lg:h-full overflow-hidden">
          <div className="flex border-b border-white/5 p-2 gap-1 bg-white/[0.02]">
            {(['stats', 'playbook'] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'stats' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Realized</span>
                  <span className={`text-2xl md:text-4xl font-black tracking-tighter tabular-nums ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${Math.abs(trade.netPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <StatInfo label="Position Side" value={trade.side} color={trade.side === 'LONG' ? 'cyan' : 'rose'} />
                  <StatInfo label="Quantity" value={`${trade.contracts} Units`} />
                  <StatInfo label="Drawdown (MAE)" value={`$${trade.mae.toFixed(2)}`} />
                  <StatInfo label="Favorable (MFE)" value={`$${trade.mfe.toFixed(2)}`} />
                </div>

                <div className="pt-8 border-t border-white/5">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Execution Rating</span>
                   <div className="flex gap-2.5 mb-8">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <button 
                         key={s} 
                         onClick={() => { setRating(s); onUpdate({...trade, rating: s}); }} 
                         className={`transition-all duration-300 transform active:scale-90 ${s <= rating ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-700 hover:text-slate-500'}`}
                       >
                         <Star size={24} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={s <= rating ? 0 : 2} />
                       </button>
                     ))}
                   </div>

                   <div className="space-y-3">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquareText size={14} className="text-cyan-500" /> Professional Remarks
                     </label>
                     <textarea 
                       className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-4 py-4 text-[11px] font-medium text-slate-300 outline-none focus:ring-1 focus:ring-cyan-500/50 min-h-[140px] resize-none transition-all placeholder:text-slate-700 leading-relaxed"
                       placeholder="Context: Describe the session dynamics, mental state, and technical adherence..."
                       defaultValue={trade.remarks}
                       onBlur={(e) => onUpdate({ ...trade, remarks: e.target.value })}
                     />
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'playbook' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <PlaybookSection />
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Visual Evidence & Charts */}
        <section className="flex-1 flex flex-col gap-4 overflow-visible lg:overflow-hidden min-w-0 pb-10 lg:pb-0">
          
          {/* Screenshot Evidence Container */}
          <div className="h-[300px] md:h-[450px] lg:flex-1 glass-panel rounded-[24px] md:rounded-[32px] overflow-hidden relative group border-white/5 bg-black/20 shrink-0 lg:shrink">
             {trade.screenshot ? (
               <div className="w-full h-full relative group/img cursor-crosshair">
                 <img src={trade.screenshot} alt="Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                   <button 
                     onClick={() => setIsMaximized(true)} 
                     className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all"
                   >
                    <Maximize2 size={24} />
                   </button>
                   <button 
                     onClick={() => fileInputRef.current?.click()} 
                     className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all"
                   >
                    <ImageIcon size={24} />
                   </button>
                 </div>
                 <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Verified Snapshot Evidence</span>
                 </div>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-slate-700 border border-white/5 mb-2">
                    <ImageIcon size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No Evidence Found</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Attach a screenshot for visual audit</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="mt-4 px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all active:scale-95"
                  >
                    Upload Record
                  </button>
               </div>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpdateScreenshot} className="hidden" />
          </div>

          {/* Performance Flow Chart */}
          <div className="h-[220px] md:h-[280px] glass-panel rounded-[24px] md:rounded-[32px] p-6 flex flex-col border-white/5 bg-white/[0.01] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Relative Momentum Flow</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Telemetry Active</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <RunningPLChart />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatInfo: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate">{label}</span>
    <span className={`text-sm md:text-base font-black truncate ${color === 'cyan' ? 'text-cyan-400' : color === 'rose' ? 'text-rose-400' : 'text-white'}`}>
      {value}
    </span>
  </div>
);

export default TradeDetail;
