
import React, { useState, useMemo } from 'react';
import { Clock, BellRing, AlertTriangle, Newspaper, Globe, ArrowUpRight, ArrowDownRight, Info, Search, Filter, X, CheckCircle2, RefreshCw, Plus, Pencil, Trash2, Coins, Landmark } from 'lucide-react';
import { NewsEvent } from '../types';
import { CURRENCIES, INSTRUMENTS } from '../constants';
import Modal from './Modal';

interface NewsViewProps {
  news: NewsEvent[];
  onAddNews: (event: NewsEvent) => void;
  onUpdateNews: (event: NewsEvent) => void;
  onDeleteNews: (id: string) => void;
}

const NewsView: React.FC<NewsViewProps> = ({ news, onAddNews, onUpdateNews, onDeleteNews }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [impactFilter, setImpactFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<NewsEvent | null>(null);

  const filteredNews = useMemo(() => {
    return news.filter(event => {
      const matchesSearch = event.event.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCurrency = currencyFilter === 'ALL' || event.currency === currencyFilter || event.asset === currencyFilter;
      const matchesImpact = impactFilter === 'ALL' || event.impact === impactFilter;
      return matchesSearch && matchesCurrency && matchesImpact;
    });
  }, [news, searchTerm, currencyFilter, impactFilter]);

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
    const eventName = formData.get('event') as string;
    const isFutures = formData.get('type') === 'futures';
    
    const eventData: NewsEvent = {
      id: editingEvent?.id || Math.random().toString(36).substr(2, 9),
      time: formData.get('time') as string,
      currency: formData.get('currency') as string,
      asset: isFutures ? (formData.get('asset') as string) : undefined,
      event: eventName.toUpperCase(),
      impact: formData.get('impact') as any,
      forecast: formData.get('forecast') as string || undefined,
      previous: formData.get('previous') as string || undefined,
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

  const filterOptions = ['ALL', ...CURRENCIES, ...INSTRUMENTS];
  const impactOptions = ['ALL', 'HIGH', 'MED', 'LOW'];

  return (
    <div className="flex flex-col h-full p-4 lg:pl-0 gap-4 overflow-y-auto lg:overflow-hidden no-scrollbar">
      <header className="px-6 md:px-10 py-6 glass-panel rounded-[32px] flex flex-col md:flex-row items-center justify-between border-white/10 relative z-50 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase leading-none">Economic Pulse</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Market Volatility Schedule</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw size={14} className={`text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {isRefreshing ? 'Syncing...' : 'Live'}
            </span>
          </button>
          <button 
            onClick={() => { setEditingEvent(null); setIsEditModalOpen(true); }}
            className="bg-emerald-400 text-black px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus size={16} /> Register Event
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events (e.g. CPI, Inventories)..." 
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[24px] text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-700" 
              />
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-[24px] p-1 px-2 overflow-x-auto no-scrollbar max-w-full md:max-w-[400px]">
              <Filter size={14} className="text-slate-500 mx-2 flex-shrink-0" />
              {filterOptions.map(f => (
                <button 
                  key={f}
                  onClick={() => setCurrencyFilter(f)}
                  className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${currencyFilter === f ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] border-white/10 overflow-hidden animate-fade-in-up">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Active Telemetry ({filteredNews.length})
                </h3>
              </div>
              <div className="space-y-3">
                {filteredNews.map((event, idx) => (
                  <div 
                    key={event.id} 
                    className={`p-5 rounded-3xl bg-white/[0.02] border flex flex-col md:flex-row items-center justify-between group hover:bg-white/[0.05] transition-all gap-4 animate-fade-in-up ${event.impact === 'HIGH' ? 'border-rose-500/10 hover:border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.05)]' : 'border-white/5'}`}
                    style={{ animationDelay: `${0.1 + (idx * 0.03)}s` }}
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`flex flex-col items-center justify-center min-w-[90px] py-2.5 bg-black/40 rounded-xl border border-white/10 group-hover:border-amber-500/30 transition-colors ${event.impact === 'HIGH' ? 'ring-1 ring-rose-500/20' : ''}`}>
                        <span className="text-sm font-black text-white tabular-nums">{event.time}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{event.currency}</span>
                          {event.asset && <span className="text-[9px] font-black text-cyan-500">/{event.asset}</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">{event.event}</h4>
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
                      <div className="flex gap-8">
                        {event.forecast && (
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Forecast</p>
                            <p className="text-xs font-black text-slate-400 tabular-nums">{event.forecast}</p>
                          </div>
                        )}
                        {event.previous && (
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Previous</p>
                            <p className="text-xs font-black text-slate-500 tabular-nums">{event.previous}</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Editor Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingEvent(null); }} title={editingEvent ? "Modify Event" : "Register Event"}>
        <form onSubmit={handleSaveEvent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
              <input name="event" required defaultValue={editingEvent?.event} placeholder="e.g. INVENTORIES" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time</label>
              <input name="time" required defaultValue={editingEvent?.time || '08:30 AM'} placeholder="08:30 AM" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="type" value="forex" defaultChecked={!editingEvent?.asset} className="peer hidden" />
                <div className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 peer-checked:bg-cyan-500/20 peer-checked:text-cyan-400 peer-checked:border-cyan-500/30 transition-all">
                  <Landmark size={14} /> Forex / Macro
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="type" value="futures" defaultChecked={!!editingEvent?.asset} className="peer hidden" />
                <div className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 peer-checked:bg-amber-500/20 peer-checked:text-amber-400 peer-checked:border-amber-500/30 transition-all">
                  <Coins size={14} /> Commodity / Future
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Currency</label>
              <select name="currency" defaultValue={editingEvent?.currency || 'USD'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                {CURRENCIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Instrument</label>
              <select name="asset" defaultValue={editingEvent?.asset || 'GC'} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                {INSTRUMENTS.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Impact Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['LOW', 'MED', 'HIGH'].map(lvl => (
                <label key={lvl} className="cursor-pointer">
                  <input type="radio" name="impact" value={lvl} defaultChecked={editingEvent?.impact === lvl || (lvl === 'HIGH' && !editingEvent)} className="peer hidden" />
                  <div className={`py-3 text-center border rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    lvl === 'HIGH' ? 'border-rose-500/20 text-slate-600 peer-checked:bg-rose-500/20 peer-checked:text-rose-400 peer-checked:border-rose-500/30' :
                    lvl === 'MED' ? 'border-amber-500/20 text-slate-600 peer-checked:bg-amber-500/20 peer-checked:text-amber-400 peer-checked:border-amber-500/30' :
                    'border-white/10 text-slate-600 peer-checked:bg-white/10 peer-checked:text-white'
                  }`}>
                    {lvl}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Forecast</label>
              <input name="forecast" defaultValue={editingEvent?.forecast} placeholder="e.g. 2.2%" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Previous</label>
              <input name="previous" defaultValue={editingEvent?.previous} placeholder="e.g. 2.0%" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-amber-500/10 active:scale-95">
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
                  <span className="text-[10px] font-black text-amber-500">{selectedEvent.currency}</span>
                  {selectedEvent.asset && <span className="text-[10px] font-black text-cyan-400">/{selectedEvent.asset}</span>}
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] font-black text-slate-400">{selectedEvent.time}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase ${
                selectedEvent.impact === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/5 text-slate-500 border-white/10'
              }`}>
                {selectedEvent.impact} Impact
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Info size={14} className="text-amber-500" /> Market Significance
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed bg-white/[0.02] p-6 rounded-[24px] border border-white/5">
                  {selectedEvent.description || "Manual override for this protocol is active. This release typically mandates volatility across linked derivatives and futures contracts."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <RefreshCw size={14} className="text-emerald-500" /> Reaction Forecast
                </div>
                <p className="text-sm font-black text-emerald-400 leading-relaxed bg-emerald-500/5 p-6 rounded-[24px] border border-emerald-500/10 italic">
                  {selectedEvent.typicalReaction || "Immediate volatility expected. Standard protocol: flatten exposure 5 minutes prior to release to mitigate slippage risk."}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Protocol Acknowledged
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsView;
