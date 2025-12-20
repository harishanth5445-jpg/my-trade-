
import React, { useMemo } from 'react';
import { LayoutDashboard, Calendar, Newspaper, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { Account } from '../App';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  selectedAccount: Account;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, selectedAccount, onLogout }) => {
  const navItems = [
    { id: 'log', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'news', icon: Newspaper, label: 'Upcoming News' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  const activeIndex = useMemo(() => {
    return navItems.findIndex(item => item.id === currentView);
  }, [currentView]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[84px] glass-panel border-r-0 m-4 rounded-[32px] flex-col items-center py-8 gap-10 flex-shrink-0 z-[60] overflow-hidden relative group/sidebar h-[calc(100vh-32px)]">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform cursor-pointer relative z-10">
            <span>Z</span>
          </div>
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 -z-0 opacity-50"></div>
        </div>

        <nav className="flex flex-col items-center gap-4 flex-1 relative w-full">
          {activeIndex !== -1 && (
            <div 
              className="absolute w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl z-0 transition-all duration-500 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-white/5"
              style={{ 
                transform: `translateX(-50%) translateY(${activeIndex * 64}px)`,
                top: 0,
                transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
              }}
            />
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 group relative z-10 ${
                currentView === item.id 
                ? 'text-emerald-400' 
                : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <item.icon 
                size={22} 
                className={`transition-all duration-500 ${currentView === item.id ? 'scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'group-hover:scale-110'}`} 
              />
              <span className="sidebar-tooltip absolute left-16 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2 pointer-events-none bg-black/80 backdrop-blur-md whitespace-nowrap z-50 shadow-xl">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4 w-full relative z-10">
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={20} />
          </button>
          <div onClick={onLogout} className="w-10 h-10 rounded-full bg-white/5 p-[1px] mt-2 group relative cursor-pointer active:scale-90 transition-transform">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white border border-white/10 group-hover:border-rose-500/50 transition-all overflow-hidden shadow-inner">
              <User size={18} className="text-slate-300 group-hover:hidden" />
              <LogOut size={16} className="text-rose-400 hidden group-hover:block" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass-panel border-t border-white/10 z-[100] flex items-center justify-around px-6 rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === item.id ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <item.icon size={24} className={currentView === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
