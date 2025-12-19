
import React from 'react';
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

  return (
    <aside className="w-[84px] glass-panel border-r-0 m-4 rounded-[32px] flex flex-col items-center py-8 gap-10 flex-shrink-0 z-20">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg glow-cyan">
        Z
      </div>

      <nav className="flex flex-col gap-6 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`p-4 rounded-2xl transition-all duration-300 group relative ${
              currentView === item.id 
              ? 'bg-white/10 text-cyan-400 ring-1 ring-white/20 nav-item-active' 
              : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={24} />
            <span className="sidebar-tooltip absolute left-20 border px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-6 pb-4 w-full px-2">
        {/* Theme Toggle Button - Perfectly aligned with Settings */}
        <button 
          onClick={onThemeToggle}
          className="p-4 rounded-2xl text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-all duration-300 group relative w-full flex justify-center"
        >
          <div className={`transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
            {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
          </div>
          <span className="sidebar-tooltip absolute left-20 border px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {theme === 'dark' ? 'Night Mode' : 'Day Mode'}
          </span>
        </button>
        
        {/* Settings Button - Now symmetrically aligned */}
        <button 
          className="p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-300 group relative w-full flex justify-center"
        >
          <Settings size={22} />
          <span className="sidebar-tooltip absolute left-20 border px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Settings
          </span>
        </button>
        
        {/* Dynamic Profile Section */}
        <div className="w-10 h-10 rounded-full bg-white/5 p-[1px] mt-2 group relative cursor-pointer">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-white border border-white/10 group-hover:border-cyan-500/50 transition-all overflow-hidden">
            <User size={18} className="text-slate-300" />
          </div>
          {/* Enhanced Profile Tooltip */}
          <div className="sidebar-tooltip absolute left-20 border px-4 py-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator Active</span>
            <span className="text-xs font-black text-white">{selectedAccount.name}</span>
            <div className="h-[1px] w-full bg-white/10 my-1"></div>
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Master Dashboard</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
