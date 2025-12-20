
import React, { useState, useMemo } from 'react';
import { Clock, BellRing, AlertTriangle, Newspaper, Globe, ArrowUpRight, ArrowDownRight, Info, Search, Filter, X, RefreshCw, Plus, Pencil, Trash2, Calendar, Target, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';
import { NewsEvent } from '../types';
import { INSTRUMENTS } from '../constants';
import Modal from './Modal';

interface NewsViewProps {
  news: NewsEvent[];
  onAddNews: (event: NewsEvent) => void;
  onUpdateNews: (event: NewsEvent) => void;
  onDeleteNews: (id: string) => void;
}

const NewsView: React.FC<NewsViewProps> = ({ news, onAddNews, onUpdateNews, onDeleteNews }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [impactFilter, setImpactFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NewsEvent | null>(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

  const filteredNews = useMemo(() => {
    return news.filter(event => {
      const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAsset = assetFilter === 'ALL' || event.asset === assetFilter;
      const matchesImpact = impactFilter === 'ALL' || event.impact === impactFilter;
      return matchesSearch && matchesAsset && matchesImpact;
    });
  }, [news, searchTerm, assetFilter, impactFilter]);

  const totals = useMemo(() => {
    return filteredNews.reduce((acc, event) => {
      acc.expected += event.profitExpectation || 0;
      acc.realized += event.profitGained || 0;
      return acc;
    }, { expected: 0, realized: 0 });
  }, [filteredNews]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleOpenEdit = (e: NewsEvent) => {
    setEditingEvent(e);
    setIsEditModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const eventData: NewsEvent = {
      id: editingEvent?.id || Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      asset: formData.get('asset') as string,
      event: (formData.get('event') as string).toUpperCase(),
      impact: formData.get('impact') as any,
      profitExpectation: parseFloat(formData.get('profitExpectation') as string) || 0,
      profitGained: parseFloat(formData.get('profitGained') as string) || 0,
      description: formData.get('description') as string || undefined,
      typicalReaction: formData.get('typicalReaction') as string || undefined,
    };

    if (editingEvent) {
      onUpdateNews(eventData);
    } else {
      onAddNews(eventData);
    }

    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const filterOptions = ['ALL', ...INSTRUMENTS];

  const formatCurrency = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4 overflow-y-auto lg:overflow-hidden no-scrollbar">
      <header className="px-6 md:px-10 py-6 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between border-white/10 relative z-[100] gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase leading-none">Economic Pulse</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Targeted Momentum Calendar</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <button 
              onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
              className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-amber-500" />
                {assetFilter === 'ALL' ? 'All Assets' : assetFilter}
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAssetDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-2xl border border-white/10 shadow-2xl z-[110] p-2 animate-in fade-in slide-in-from-top-2">
                <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
                  {filterOptions.map(f => (
                    <button 
                      key={f}
                      onClick={() => { setAssetFilter(f); setIsAssetDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${assetFilter === f ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setEditingEvent(null); setIsEditModalOpen(true); }}
            className="bg-emerald-400 text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} /> Register
          </button>
        </div>
      </header>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-[32px] border-white/10 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Projected Yield</span>
            <span className="text-2xl font-black text-white">{formatCurrency(totals.expected)}</span>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-[32px] border-white/10 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Realized Yield</span>
            <span className={`text-2xl font-black ${totals.realized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totals.realized)}
            </span>
          </div>
          <div className={`w-12 h-12 ${totals.realized >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} border rounded-2xl flex items-center justify-center`}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter events..." 
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[24px] text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" 
              />
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-[24px] p-1 px-2">
              <Filter size={14} className="text-slate-500 mx-2" />
              {['ALL', 'HIGH', 'MED', 'LOW'].map(i => (
                <button 
                  key={i}
                  onClick={() => setImpactFilter(i)}
                  className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${impactFilter === i ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-300'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] border-white/10 overflow-hidden animate-fade-in-up">
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-3">
                {filteredNews.sort((a,b) => a.date.localeCompare(b.date)).map((event, idx) => (
                  <div 
                    key={event.id} 
                    className={`p-5 rounded-3xl bg-white/[0.02] border flex flex-col md:flex-row items-center justify-between group hover:bg-white/[0.05] transition-all gap-4 animate-fade-in-up ${event.impact === 'HIGH' ? 'border-rose-500/10 hover:border-rose-500/30' : 'border-white/5'}`}
                    style={{ animationDelay: `${0.1 + (idx * 0.03)}s` }}
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`flex flex-col items-center justify-center min-w-[100px] py-2.5 bg-black/40 rounded-xl border border-white/10 group-hover:border-amber-500/30 transition-colors`}>
                        <span className="text-xs font-black text-white tabular-nums">{event.date.split('-').slice(1).join('/')}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{event.time}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">{event.event}</h4>
                          <span className="text-[10px] font-black text-cyan-400">/{event.asset}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                            event.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                            event.impact === 'MED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          } uppercase tracking-widest`}>
                            {event.impact} IMPACT
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="flex gap-6">
                        {event.profitExpectation !== undefined && (
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Target</p>
                            <p className="text-xs font-black text-slate-300 tabular-nums">{formatCurrency(event.profitExpectation)}</p>
                          </div>
                        )}
                        {event.profitGained !== undefined && (
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Realized</p>
                            <p className={`text-xs font-black tabular-nums ${event.profitGained >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatCurrency(event.profitGained)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleOpenEdit(event)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteNews(event.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedEvent(event)}
                          className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all ml-2"
                        >
                          <Info size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredNews.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center gap-4">
                    <Newspaper size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">No matching telemetry records found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified News Editor Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingEvent(null); }} title={editingEvent ? "Modify Protocol" : "Register Protocol"}>
        <form onSubmit={handleSaveEvent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Header</label>
            <input name="event" required defaultValue={editingEvent?.event} placeholder="e.g. FOMC STATEMENT" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Execution Date</label>
              <input name="date" type="date" required defaultValue={editingEvent?.date || new Date().toISOString().split('T')[0]} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time</label>
              <input name="time" required defaultValue={editingEvent?.time || '08:30 AM'} placeholder="08:30 AM" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instrument</label>
              <select name="asset" defaultValue={editingEvent?.asset || 'NQ'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Impact Level</label>
              <select name="impact" defaultValue={editingEvent?.impact || 'HIGH'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                <option value="LOW" className="bg-slate-900">LOW</option>
                <option value="MED" className="bg-slate-900">MED</option>
                <option value="HIGH" className="bg-slate-900">HIGH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profit Expectation ($)</label>
              <input name="profitExpectation" type="number" step="0.01" defaultValue={editingEvent?.profitExpectation} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profit Gained ($)</label>
              <input name="profitGained" type="number" step="0.01" defaultValue={editingEvent?.profitGained} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
            {editingEvent ? 'Synchronize Record' : 'Register Protocol'}
          </button>
        </form>
      </Modal>

      {/* Insight Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Insight">
        {selectedEvent && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white/[0.03] p-6 rounded-[32px] border border-white/10">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol Header</span>
                <h3 className="text-xl font-black text-white uppercase">{selectedEvent.event}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-cyan-400">{selectedEvent.asset}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] font-black text-slate-400">{selectedEvent.date} @ {selectedEvent.time}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase ${
                selectedEvent.impact === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/5 text-slate-500 border-white/10'
              }`}>
                {selectedEvent.impact} Impact
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 p-6 rounded-[24px] border border-emerald-500/10 flex flex-col items-center justify-center gap-2">
                 <Target size={24} className="text-emerald-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Gain</span>
                 <span className="text-2xl font-black text-white">{formatCurrency(selectedEvent.profitExpectation || 0)}</span>
              </div>
              <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 flex flex-col items-center justify-center gap-2">
                 <TrendingUp size={24} className={selectedEvent.profitGained && selectedEvent.profitGained >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Realized Gain</span>
                 <span className={`text-xl font-black ${selectedEvent.profitGained && selectedEvent.profitGained >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(selectedEvent.profitGained || 0)}
                 </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Info size={14} className="text-amber-500" /> Operational Context
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed bg-white/[0.02] p-6 rounded-[24px] border border-white/5">
                  {selectedEvent.description || "Manual protocol override is active. This release Typically mandates extreme volatility across linked derivative contracts."}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Close Protocol
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsView;
