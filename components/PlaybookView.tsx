
import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ChevronRight, MoreVertical, Shield, Target, Zap, X, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface Playbook {
  id: string;
  name: string;
  winRate: string;
  count: number;
  rules: {
    context: string[];
    entry: string[];
    exit: string[];
  };
}

const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: '1',
    name: 'NEWS TRADE',
    winRate: '62%',
    count: 18,
    rules: {
      context: ['High-impact economic release (CPI/NFP)', 'Significant deviation from consensus'],
      entry: ['Momentum break of first 1m candle', 'VWAP reclaim after initial spike'],
      exit: ['Tap of next major psychological level', '1:2 Risk/Reward ratio reached']
    }
  },
  {
    id: '2',
    name: 'ORB STRATEGY',
    winRate: '58%',
    count: 32,
    rules: {
      context: ['Opening Range (5m or 15m)', 'Volume > 1.5x average on open'],
      entry: ['Breakout of High/Low of Opening Range', 'Retest of the range boundary'],
      exit: ['Opposite side of Opening Range', 'Targeting 2x range size']
    }
  }
];

const PlaybookView: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => {
    const saved = localStorage.getItem('tradenexus_playbooks');
    return saved ? JSON.parse(saved) : MOCK_PLAYBOOKS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tradenexus_playbooks', JSON.stringify(playbooks));
  }, [playbooks]);

  const handleSavePlaybook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPb: Playbook = {
      id: editingPlaybook?.id || Math.random().toString(36).substr(2, 9),
      name: (formData.get('name') as string).toUpperCase(),
      winRate: (formData.get('winRate') as string) + '%',
      count: parseInt(formData.get('count') as string) || 0,
      rules: {
        context: (formData.get('context') as string).split('\n').filter(r => r.trim()),
        entry: (formData.get('entry') as string).split('\n').filter(r => r.trim()),
        exit: (formData.get('exit') as string).split('\n').filter(r => r.trim()),
      }
    };

    if (editingPlaybook) {
      setPlaybooks(prev => prev.map(p => p.id === newPb.id ? newPb : p));
    } else {
      setPlaybooks(prev => [newPb, ...prev]);
    }

    setIsModalOpen(false);
    setEditingPlaybook(null);
  };

  const handleDelete = (id: string) => {
    setPlaybooks(prev => prev.filter(p => p.id !== id));
    setActiveMenuId(null);
  };

  const openEdit = (pb: Playbook) => {
    setEditingPlaybook(pb);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="flex flex-col h-full p-4 pl-0 gap-4">
      <header className="px-10 py-6 glass-panel rounded-[32px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group transition-all">
            <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Strategy Playbook</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Execution Frameworks & Protocols</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingPlaybook(null); setIsModalOpen(true); }}
          className="bg-emerald-400 hover:bg-emerald-300 text-black px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} /> New Framework
        </button>
      </header>

      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {playbooks.map((pb) => (
            <div key={pb.id} className="glass-panel rounded-[32px] flex flex-col border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group overflow-hidden relative">
              <div className="p-7 border-b border-white/5 bg-white/[0.02] relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                    {pb.winRate} Win Probability
                  </span>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === pb.id ? null : pb.id)}
                      className={`p-1.5 rounded-lg transition-all ${activeMenuId === pb.id ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                    >
                      <MoreVertical size={18}/>
                    </button>
                    {activeMenuId === pb.id && (
                      <div className="absolute top-full right-0 mt-2 w-32 glass-panel rounded-xl border border-white/10 shadow-2xl z-50 p-1 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => openEdit(pb)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(pb.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-0.5 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{pb.name}</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{pb.count} Verified Instances</p>
              </div>

              <div className="p-7 space-y-5 flex-1 bg-black/20">
                <RuleSection title="Context" icon={<Shield size={14}/>} rules={pb.rules.context} />
                <RuleSection title="Entry" icon={<Zap size={14}/>} rules={pb.rules.entry} />
                <RuleSection title="Exit" icon={<Target size={14}/>} rules={pb.rules.exit} />
              </div>

              <div className="px-7 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => { setSelectedPlaybook(pb); setIsDetailOpen(true); }}
                  className="text-[9px] font-black text-slate-400 hover:text-white flex items-center gap-2 group/btn uppercase tracking-[0.2em] transition-all"
                >
                  Inspect Specs <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></div> Backtested
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => { setEditingPlaybook(null); setIsModalOpen(true); }}
            className="border-2 border-dashed border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all group active:scale-[0.98] min-h-[400px]"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:scale-110 transition-all">
              <Plus size={24} />
            </div>
            <span className="font-black text-[9px] uppercase tracking-[0.3em]">Register Protocol</span>
          </button>
        </div>
      </div>

      {/* Playbook Editor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlaybook ? "Modify Framework" : "Create Framework"}>
        <form onSubmit={handleSavePlaybook} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Strategy Name</label>
              <input name="name" required defaultValue={editingPlaybook?.name} placeholder="e.g. BREAKOUT ALPHA" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Win Rate %</label>
                <input name="winRate" type="number" required defaultValue={editingPlaybook?.winRate.replace('%', '')} placeholder="60" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verified Count</label>
                <input name="count" type="number" defaultValue={editingPlaybook?.count} placeholder="10" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Context (One per line)</label>
            <textarea name="context" rows={3} defaultValue={editingPlaybook?.rules.context.join('\n')} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="Enter context rules..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entry Triggers (One per line)</label>
            <textarea name="entry" rows={3} defaultValue={editingPlaybook?.rules.entry.join('\n')} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="Enter entry rules..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exit protocols (One per line)</label>
            <textarea name="exit" rows={3} defaultValue={editingPlaybook?.rules.exit.join('\n')} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="Enter exit rules..." />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black py-5 rounded-2xl font-black text-sm hover:opacity-90 transition-all glow-cyan mt-4">
            {editingPlaybook ? 'Synchronize Framework' : 'Establish Framework'}
          </button>
        </form>
      </Modal>

      {/* Playbook Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedPlaybook?.name || "Protocol Details"}>
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white/[0.03] p-6 rounded-3xl border border-white/5">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                <span className="text-3xl font-black text-emerald-400">{selectedPlaybook?.winRate}</span>
             </div>
             <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</span>
                <div className="flex gap-1 mt-1">
                   {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1.5 rounded-full ${i <= 4 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}></div>)}
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <DetailSection title="Primary Context" icon={<Shield size={18}/>} rules={selectedPlaybook?.rules.context || []} />
            <DetailSection title="Execution Phase" icon={<Zap size={18}/>} rules={selectedPlaybook?.rules.entry || []} />
            <DetailSection title="Risk Dissipation" icon={<Target size={18}/>} rules={selectedPlaybook?.rules.exit || []} />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsDetailOpen(false)}
              className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all tracking-widest"
            >
              Close
            </button>
            <button 
              onClick={() => { setIsDetailOpen(false); if(selectedPlaybook) openEdit(selectedPlaybook); }}
              className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-black bg-cyan-400 hover:opacity-90 transition-all tracking-widest shadow-lg shadow-cyan-500/20"
            >
              Modify Framework
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const RuleSection: React.FC<{ title: string; icon: React.ReactNode; rules: string[] }> = ({ title, icon, rules }) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2 mb-1 opacity-70">
      <span className="text-emerald-400">{icon}</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
    </div>
    <div className="space-y-2">
      {rules.slice(0, 2).map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 leading-tight">
          <div className="w-1 h-1 rounded-full bg-emerald-500/60 mt-1.5 flex-shrink-0"></div>
          <span className="truncate">{r}</span>
        </div>
      ))}
      {rules.length > 2 && (
        <p className="text-[8px] text-slate-500 font-black italic pl-3 uppercase tracking-widest">+{rules.length - 2} Supplementary Rules</p>
      )}
    </div>
  </div>
);

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; rules: string[] }> = ({ title, icon, rules }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400 border border-white/10">
        {icon}
      </div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</h4>
    </div>
    <div className="space-y-3 pl-12">
      {rules.map((r, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/[0.01] p-3 rounded-2xl border border-white/[0.03]">
          <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-200">{r}</span>
        </div>
      ))}
      {rules.length === 0 && (
         <div className="flex items-center gap-3 p-3 opacity-30">
           <AlertCircle size={14} />
           <span className="text-xs font-bold uppercase tracking-widest">No parameters defined</span>
         </div>
      )}
    </div>
  </div>
);

export default PlaybookView;
