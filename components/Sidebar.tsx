
import React, { useMemo } from 'react';
import { LayoutDashboard, Calendar, BookOpen, BarChart3, Settings, Moon, Sun, User } from 'lucide-react';
import { Account } from '../App';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  selectedAccount: Account;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, theme, onThemeToggle, selectedAccount }) => {
  const navItems = [
    { id: 'log', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'playbook', icon: BookOpen, label: 'Playbook' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  const activeIndex = useMemo(() => {
    return navItems.findIndex(item => item.id === currentView);
  }, [currentView]);

  return (
    <aside className="w-[84px] glass-panel border-r-0 m-4 rounded-[32px] flex flex-col items-center py-8 gap-10 flex-shrink-0 z-20 overflow-hidden relative">
      {/* Centered Logo Area */}
      <div className="relative flex flex-col items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform cursor-pointer relative z-10">
          <span>Z</span>
        </div>
      </div>

      {/* Navigation Track */}
      <nav className="flex flex-col items-center gap-4 flex-1 relative w-full">
        {/* Animated Sliding Active Pill - Perfectly Centered */}
        <div 
          className="absolute w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl z-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          style={{ 
            top: activeIndex !== -1 ? `${activeIndex * 64}px` : '0px',
            opacity: activeIndex === -1 ? 0 : 1
          }}
        />

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative z-10 ${
              currentView === item.id 
              ? 'text-emerald-400' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={22} className={`${currentView === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} transition-transform`} />
            <span className="sidebar-tooltip absolute left-16 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2 pointer-events-none bg-black/80 backdrop-blur-md whitespace-nowrap z-50 shadow-xl">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom Utilities */}
      <div className="flex flex-col items-center gap-4 w-full relative z-10">
        <button 
          onClick={onThemeToggle}
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-emerald-400 hover:bg-white/5 transition-all duration-300 group relative"
        >
          <div className={`transition-transform duration-700 ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
        </button>
        
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-300 group relative"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-700" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-white/5 p-[1px] mt-2 group relative cursor-pointer">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-white border border-white/10 group-hover:border-emerald-500/50 transition-all overflow-hidden shadow-inner">
            <User size={18} className="text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
