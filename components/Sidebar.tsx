
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
    <aside className="w-[84px] glass-panel border-r-0 m-4 rounded-[32px] flex flex-col items-center py-8 gap-10 flex-shrink-0 z-20 overflow-hidden relative group/sidebar">
      {/* Centered Logo Area */}
      <div className="relative flex flex-col items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform cursor-pointer relative z-10">
          <span>Z</span>
        </div>
        {/* Subtle background glow for logo */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 -z-0 opacity-50"></div>
      </div>

      {/* Navigation Track */}
      <nav className="flex flex-col items-center gap-4 flex-1 relative w-full">
        {/* Liquid Elastic Indicator */}
        {activeIndex !== -1 && (
          <>
            {/* The "Bloom" Layer - Soft background glow */}
            <div 
              className="absolute w-14 h-14 bg-emerald-500/5 blur-xl rounded-full z-0 transition-all duration-700 ease-out left-1/2 -translate-x-1/2"
              style={{ 
                transform: `translateX(-50%) translateY(${activeIndex * 64}px)`,
                top: 0
              }}
            />
            {/* The "Main Pill" Layer - Liquid Elastic Motion */}
            <div 
              className="absolute w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl z-0 transition-all duration-500 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-white/5"
              style={{ 
                transform: `translateX(-50%) translateY(${activeIndex * 64}px)`,
                top: 0,
                transitionTimingFunction: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
              }}
            >
              {/* Inner light glint */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
            </div>
          </>
        )}

        {navItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 group relative z-10 ${
              currentView === item.id 
              ? 'text-emerald-400' 
              : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {/* Magnetic Icon Effect */}
            <item.icon 
              size={22} 
              className={`transition-all duration-500 ${
                currentView === item.id 
                ? 'scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse-subtle' 
                : 'group-hover:scale-110 group-hover:text-white'
              }`} 
            />
            
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
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-emerald-400 hover:bg-white/5 transition-all duration-500 group relative overflow-hidden"
        >
          <div className={`transition-transform duration-700 ${theme === 'dark' ? 'rotate-0' : 'rotate-[360deg]'}`}>
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
        </button>
        
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-500 group relative overflow-hidden"
        >
          <Settings size={20} className="group-hover:rotate-180 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-white/5 p-[1px] mt-2 group relative cursor-pointer active:scale-90 transition-transform">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white border border-white/10 group-hover:border-emerald-500/50 transition-all overflow-hidden shadow-inner">
            <User size={18} className="text-slate-300 group-hover:scale-110 group-hover:text-white transition-all duration-500" />
          </div>
          {/* Status Indicator Dot */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1.1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
