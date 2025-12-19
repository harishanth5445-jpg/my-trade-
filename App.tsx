
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TradeLog from './components/TradeLog';
import TradeDetail from './components/TradeDetail';
import CalendarView from './components/CalendarView';
import PlaybookView from './components/PlaybookView';
import ReportsView from './components/ReportsView';
import Modal from './components/Modal';
import { Trade, Side, Status } from './types';
import { MOCK_TRADES, SETUPS } from './constants';
import { Trash2, AlertTriangle, Image as ImageIcon, X, Wallet, Building2, Layers, Globe, Pencil } from 'lucide-react';

export interface Account {
  id: string;
  name: string;
  type: string;
  provider: string;
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Apex Primary', type: '50K Rhythmic', provider: 'Apex Trader Funding' },
  { id: 'acc_2', name: 'Topstep Main', type: '150K XFA', provider: 'Topstep' },
  { id: 'acc_3', name: 'Personal Futures', type: 'Private Capital', provider: 'Tradovate' },
];

const BackgroundCandles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 select-none">
      {[1, 2, 3, 4].map((lane) => (
        <div 
          key={lane}
          className={`absolute h-full flex flex-col gap-8 animate-candle-drift-${(lane % 3) + 1}`}
          style={{ left: `${(lane - 1) * 25}%`, opacity: 0.03 + lane * 0.02 }}
        >
          {Array.from({ length: 30 }).map((_, i) => {
            const isBull = Math.random() > 0.45;
            const height = 15 + Math.random() * 80;
            const wickHeight = height + 10 + Math.random() * 40;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-[1px] bg-white/10`} style={{ height: `${wickHeight}px` }} />
                <div 
                  className={`w-2 rounded-sm ${isBull ? 'bg-emerald-500/30' : 'bg-rose-500/30'} border border-white/5 shadow-sm`}
                  style={{ height: `${height}px`, marginTop: `-${wickHeight / 2 + height / 2}px` }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tradenexus_trades');
    return saved ? JSON.parse(saved) : MOCK_TRADES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('tradenexus_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [selectedAccount, setSelectedAccount] = useState<Account>(() => {
    const savedId = localStorage.getItem('tradenexus_selected_account_id');
    const savedAccounts = localStorage.getItem('tradenexus_accounts');
    const currentAccounts = savedAccounts ? JSON.parse(savedAccounts) : INITIAL_ACCOUNTS;
    return currentAccounts.find((a: Account) => a.id === savedId) || currentAccounts[0];
  });

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [currentView, setCurrentView] = useState<'log' | 'reports' | 'calendar' | 'playbook'>('log');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    localStorage.setItem('tradenexus_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('tradenexus_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('tradenexus_selected_account_id', selectedAccount.id);
  }, [selectedAccount]);

  const accountTrades = useMemo(() => {
    return trades.filter(t => t.accountId === selectedAccount.id);
  }, [trades, selectedAccount.id]);

  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [accountToDeleteId, setAccountToDeleteId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('theme-transition');
    const timer = setTimeout(() => document.body.classList.remove('theme-transition'), 500);
    return () => clearTimeout(timer);
  }, [theme]);

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleBack = () => {
    setSelectedTrade(null);
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteTrade = () => {
    if (deleteConfirmId) {
      setTrades(prev => prev.filter(t => t.id !== deleteConfirmId));
      if (selectedTrade?.id === deleteConfirmId) {
        setSelectedTrade(null);
      }
      setDeleteConfirmId(null);
    }
  };

  const handleUpdateTrade = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    setSelectedTrade(updatedTrade);
  };

  const handleAddAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAccount: Account = {
      id: `acc_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.get('name') as string,
      provider: formData.get('provider') as string,
      type: formData.get('type') as string,
    };
    setAccounts(prev => [...prev, newAccount]);
    setSelectedAccount(newAccount);
    setIsAddAccountOpen(false);
  };

  const handleRenameAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountToEdit) return;
    const formData = new FormData(e.currentTarget);
    const updatedAccount = { ...accountToEdit, name: formData.get('name') as string, type: formData.get('type') as string };
    setAccounts(prev => prev.map(a => a.id === accountToEdit.id ? updatedAccount : a));
    if (selectedAccount.id === accountToEdit.id) setSelectedAccount(updatedAccount);
    setIsEditAccountOpen(false);
    setAccountToEdit(null);
  };

  const handleDeleteAccountConfirm = () => {
    if (!accountToDeleteId) return;
    const filteredAccounts = accounts.filter(a => a.id !== accountToDeleteId);
    setAccounts(filteredAccounts);
    setTrades(prev => prev.filter(t => t.accountId !== accountToDeleteId));
    if (selectedAccount.id === accountToDeleteId && filteredAccounts.length > 0) {
      setSelectedAccount(filteredAccounts[0]);
    }
    setAccountToDeleteId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddTrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawDate = formData.get('date') as string;
    const dateObj = new Date(rawDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      accountId: selectedAccount.id,
      date: formattedDate,
      symbol: (formData.get('symbol') as string).toUpperCase(),
      side: formData.get('side') as Side,
      status: formData.get('status') as Status,
      netPL: parseFloat(formData.get('netPL') as string) || 0,
      contracts: parseInt(formData.get('contracts') as string) || 1,
      duration: '0m',
      mae: 0,
      mfe: 0,
      setup: formData.get('setup') as string,
      rating: 0,
      screenshot: screenshotPreview || undefined
    };

    setTrades(prev => [newTrade, ...prev]);
    setIsNewTradeOpen(false);
    setScreenshotPreview(null);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const renderContent = () => {
    if (selectedTrade) {
      return (
        <TradeDetail 
          trade={selectedTrade} 
          onBack={handleBack} 
          onDelete={confirmDelete} 
          onUpdate={handleUpdateTrade} 
        />
      );
    }

    switch (currentView) {
      case 'calendar': return <CalendarView trades={accountTrades} onTradeClick={handleTradeClick} />;
      case 'playbook': return <PlaybookView />;
      case 'reports': return <ReportsView trades={accountTrades} />;
      case 'log':
      default:
        return (
          <TradeLog 
            trades={accountTrades}
            onTradeClick={handleTradeClick} 
            onDelete={confirmDelete} 
            onNewTrade={() => setIsNewTradeOpen(true)}
            currentAccount={selectedAccount}
            accounts={accounts}
            onAccountChange={setSelectedAccount}
            onAddAccount={() => setIsAddAccountOpen(true)}
            onEditAccount={(acc) => { setAccountToEdit(acc); setIsEditAccountOpen(true); }}
            onDeleteAccount={(id) => setAccountToDeleteId(id)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent text-white overflow-hidden selection:bg-cyan-500/30">
      <BackgroundCandles />
      
      <div className="animate-fade-in-up">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          theme={theme} 
          onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
          selectedAccount={selectedAccount}
        />
      </div>

      <main 
        key={selectedTrade ? `detail-${selectedTrade.id}` : currentView} 
        className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 view-transition-enter"
      >
        {renderContent()}
      </main>

      {/* Register Funded Account Modal */}
      <Modal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} title="Register Funded Account">
        <form onSubmit={handleAddAccount} className="space-y-6">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Wallet size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setup New Environment</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Building2 size={12} /> Account Nickname</label>
            <input name="name" required placeholder="e.g. Apex Master #1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Globe size={12} /> Provider</label>
              <select name="provider" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer">
                <option value="Apex Trader Funding" className="bg-slate-900">Apex Funding</option>
                <option value="Topstep" className="bg-slate-900">Topstep</option>
                <option value="MyFundedFutures" className="bg-slate-900">MFF</option>
                <option value="Personal Account" className="bg-slate-900">Personal / Private</option>
                <option value="Other" className="bg-slate-900">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12} /> Account Size</label>
              <input name="type" required placeholder="e.g. 150K XFA" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600" />
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all glow-cyan mt-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Create Profile
          </button>
        </form>
      </Modal>

      {/* Edit Funded Account Modal */}
      <Modal isOpen={isEditAccountOpen} onClose={() => { setIsEditAccountOpen(false); setAccountToEdit(null); }} title="Update Account Details">
        <form onSubmit={handleRenameAccount} className="space-y-6">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Pencil size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modify Active Environment</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Building2 size={12} /> Account Nickname</label>
            <input name="name" required defaultValue={accountToEdit?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={12} /> Account Type / Size</label>
            <input name="type" required defaultValue={accountToEdit?.type} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-400 to-cyan-400 text-black py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={!!accountToDeleteId} onClose={() => setAccountToDeleteId(null)} title="Delete Account Entry">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-[24px] bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black text-white tracking-tight">Decommission this account?</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">All historical linkages for this account profile will be removed from the primary view.</p>
          </div>
          <div className="flex w-full gap-4 pt-4">
            <button onClick={() => setAccountToDeleteId(null)} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest">Cancel</button>
            <button onClick={handleDeleteAccountConfirm} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-white bg-gradient-to-br from-rose-500 to-rose-700 hover:opacity-90 transition-all uppercase tracking-widest">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* New Trade Modal */}
      <Modal isOpen={isNewTradeOpen} onClose={() => { setIsNewTradeOpen(false); setScreenshotPreview(null); }} title="Log New Execution">
        <form onSubmit={handleAddTrade} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Symbol</label>
              <input name="symbol" required placeholder="e.g. MES or NQ" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600" />
            </div>
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date & Time</label>
              <input name="date" type="datetime-local" defaultValue={getCurrentDateTime()} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all [color-scheme:dark]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer">
                  <input type="radio" name="side" value="LONG" defaultChecked className="peer hidden" />
                  <div className="py-3 text-center rounded-xl border border-white/10 text-[10px] font-black text-slate-500 peer-checked:bg-cyan-500/20 peer-checked:text-cyan-400 peer-checked:border-cyan-500/50 transition-all uppercase tracking-widest">Long</div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="side" value="SHORT" className="peer hidden" />
                  <div className="py-3 text-center rounded-xl border border-white/10 text-[10px] font-black text-slate-500 peer-checked:bg-rose-500/20 peer-checked:text-rose-400 peer-checked:border-rose-500/50 transition-all uppercase tracking-widest">Short</div>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Outcome</label>
              <select name="status" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer">
                <option value="WIN" className="bg-slate-900">PROFIT (WIN)</option>
                <option value="LOSS" className="bg-slate-900">LOSS</option>
                <option value="BE" className="bg-slate-900">BREAKEVEN</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Net P&L ($)</label>
              <input name="netPL" type="number" step="0.01" required placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contracts / Size</label>
              <input name="contracts" type="number" required placeholder="1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Strategy Setup</label>
            <select name="setup" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer">
              {SETUPS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Attach Screenshot</label>
            {!screenshotPreview ? (
              <button 
                type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-white/5 transition-all group"
              >
                <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Click to upload chart</span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </button>
            ) : (
              <div className="relative group">
                <img src={screenshotPreview} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-white/10" />
                <button type="button" onClick={() => setScreenshotPreview(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors"><X size={14} /></button>
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all glow-cyan mt-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Finalize Entry
          </button>
        </form>
      </Modal>

      {/* Delete Trade Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Destruction">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-[24px] bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black text-white tracking-tight">Erase this trade record?</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px]">This action is irreversible. All performance metrics and charts will be adjusted immediately.</p>
          </div>
          <div className="flex w-full gap-4 pt-4">
            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all uppercase tracking-[0.15em]">Cancel</button>
            <button onClick={handleDeleteTrade} className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-white bg-gradient-to-br from-rose-500 to-rose-700 hover:opacity-90 transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.2)]"><Trash2 size={16} /> Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;