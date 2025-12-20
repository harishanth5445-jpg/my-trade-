
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
        
        {/* Prismatic Vector Monogram Logo - THEME ALIGNED (Emerald/Cyan) */}
        <div className="relative flex flex-col items-center group cursor-pointer">
          <div className="w-14 h-14 relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 active:scale-95">
            
            {/* Orbital Rings - Theme Emerald */}
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors duration-700"></div>
            <div className="absolute inset-[-4px] rounded-[20px] border-t-2 border-l-2 border-emerald-500/20 animate-[spin_6s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Main Logo Body */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#020617] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative shadow-2xl group-hover:border-emerald-500/40 transition-all duration-500">
              
              {/* Internal Shimmer Scanning Line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

              {/* Custom SVG TN Glyph - Theme Emerald/Cyan */}
              <div className="relative z-10 scale-[0.85] group-hover:scale-100 transition-transform duration-500">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M8 24V8L16 18L24 8V24" 
                    stroke="url(#tn-gradient-sidebar)" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <path 
                    d="M6 10H26M16 10V26" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                  <defs>
                    <linearGradient id="tn-gradient-sidebar" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#10b981" />
                      <stop offset="1" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Core Volumetric Glow - Emerald */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 opacity-40 group-hover:opacity-100 group-hover:bg-emerald-400/30 transition-all duration-700"></div>
          </div>
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

      {/* Mobile Bottom Nav - UPDATED TO INCLUDE SETTINGS & LOGOUT */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass-panel border-t border-white/10 z-[100] flex items-center justify-between px-4 rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-all flex-1 ${currentView === item.id ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              <item.icon size={22} className={currentView === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
              <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          
          {/* Settings Button (Mobile) */}
          <button className="flex flex-col items-center gap-1 transition-all text-slate-500 hover:text-white flex-1">
            <Settings size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Settings</span>
          </button>

          {/* Logout Button (Mobile) */}
          <button 
            onClick={onLogout}
            className="flex flex-col items-center gap-1 transition-all text-slate-500 hover:text-rose-400 flex-1"
          >
            <LogOut size={22} />
            <span className="text-[7px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
