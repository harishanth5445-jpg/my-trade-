
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
      reader.onloadend = () => {
        onUpdate({
          ...trade,
          screenshot: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportTrade = () => {
    const filename = `Trade_${trade.symbol}_${trade.date.replace(/\//g, '-')}.csv`;
    exportTradesToCSV([trade], filename);
  };

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4 relative">
      {/* Maximized Overlay */}
      {isMaximized && trade.screenshot && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white">{trade.symbol} - Execution Evidence</h2>
            <button 
              onClick={() => setIsMaximized(false)}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <img src={trade.screenshot} alt="Full view" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Detail Header */}
      <header className="px-8 py-5 glass-panel rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 glass-panel border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">{trade.symbol}</h2>
              <span className="text-slate-500 text-sm font-bold">{trade.date}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase tracking-wider border border-cyan-400/20">
                <CheckCircle2 size={10} /> Valid Setup
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onDelete(trade.id)}
            className="flex items-center gap-2 text-xs font-black text-rose-400 bg-rose-500/10 px-5 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all group"
          >
             <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Delete Trade
          </button>
          <button 
            onClick={handleExportTrade}
            className="flex items-center gap-2 text-xs font-black text-slate-300 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10"
          >
             <Share2 size={16} /> Export
          </button>
          <button className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black px-6 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all glow-cyan">
             Log Note
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <aside className="w-80 glass-panel rounded-[32px] flex flex-col overflow-hidden border-white/10">
          <div className="flex border-b border-white/5 p-2 gap-1">
            {['stats', 'playbook', 'executions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  activeTab === tab ? 'bg-white/10 text-cyan-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8 space-y-8 flex-1 overflow-auto no-scrollbar">
            {activeTab === 'stats' && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net P&L Result</span>
                    <span className={`text-3xl font-black ${trade.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.netPL >= 0 ? '+' : ''}${Math.abs(trade.netPL).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4">
                    <StatInfo label="Position Side" value={trade.side} color={trade.side === 'LONG' ? 'cyan' : 'rose'} />
                    <StatInfo label="Quantity" value={trade.contracts.toString()} />
                    <StatInfo label="MAE" value={`$${trade.mae.toLocaleString()}`} color="rose" />
                    <StatInfo label="MFE" value={`$${trade.mfe.toLocaleString()}`} color="emerald" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution Rating</span>
                     <div className="flex gap-1.5">
                       {[1, 2, 3, 4, 5].map((s) => (
                         <button key={s} onClick={() => { setRating(s); onUpdate({...trade, rating: s}) }} className={`transition-all ${s <= rating ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-700'}`}>
                           <Star size={18} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={3} />
                         </button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <GlassInput label="Target" value="$ 5,523.87" />
                     <GlassInput label="Stop" value="$ 5,531.92" />
                   </div>
                </div>
              </>
            )}

            {activeTab === 'playbook' && <PlaybookSection />}
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-[2.5] glass-panel rounded-[32px] overflow-hidden relative group">
             <div className="absolute top-6 left-8 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg group-hover:bg-black/80 transition-all">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.1em]">
                  {trade.screenshot ? 'Execution Evidence' : '1M CANDLES'}
                </span>
                <div className="h-4 w-[1px] bg-white/20"></div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink size={14} />
                </button>
             </div>
             
             {trade.screenshot ? (
               <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black/40">
                 <img 
                   src={trade.screenshot} 
                   alt="Trade Chart Evidence" 
                   className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
                 />
                 
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                   <button 
                     onClick={() => setIsMaximized(true)}
                     className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-2"
                   >
                     <Maximize2 size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Expand Evidence</span>
                   </button>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-2"
                   >
                     <ImageIcon size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Replace Chart</span>
                   </button>
                 </div>
               </div>
             ) : (
               <div className="w-full h-full relative">
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600 mb-4">
                       <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No Screenshot Evidence</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all pointer-events-auto"
                    >
                      Upload Snapshot
                    </button>
                 </div>
                 <div className="p-8 h-full opacity-30 grayscale blur-[2px]">
                   <CandlestickChart />
                 </div>
               </div>
             )}
             
             <input 
               ref={fileInputRef} 
               type="file" 
               accept="image/*" 
               onChange={handleUpdateScreenshot} 
               className="hidden" 
             />
          </div>

          <div className="flex-1 flex gap-4 overflow-hidden">
            <div className="flex-1 glass-panel rounded-[32px] p-6 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Relative Performance</h3>
              <div className="flex-1">
                <RunningPLChart />
              </div>
            </div>
            <div className="w-1/3 glass-panel rounded-[32px] p-8 space-y-4 overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Post-Trade Analysis</h3>
                <button className="text-slate-600 hover:text-white"><Plus size={14}/></button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic border-l-2 border-cyan-500/30 pl-4 py-1">
                {trade.status === 'WIN' 
                  ? 'Excellent patience. Waited for the sweep of the highs before entering the short. Structure broke exactly at the supply zone.' 
                  : 'Entry was impulsive. Flipped long too early without seeing displacement. Risk management saved the day.'
                }
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatInfo: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-base font-black ${
      color === 'cyan' ? 'text-cyan-400' : color === 'rose' ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-400' : 'text-white'
    }`}>{value}</span>
  </div>
);

const GlassInput: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white tracking-tight">
      {value}
    </div>
  </div>
);

export default TradeDetail;
