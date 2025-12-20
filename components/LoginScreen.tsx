
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Standby');

  const DEMO_PASSWORD = '5445';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      setIsLoading(true);
      setError(false);
      setStatusText('Validating Credentials...');
      
      // Artificial delay for cinematic effect
      setTimeout(() => {
        setStatusText('Synchronizing Telemetry...');
        setTimeout(() => {
          setStatusText('Access Granted');
          setTimeout(() => {
            onLogin();
          }, 500);
        }, 800);
      }, 1000);
    } else {
      setError(true);
      setPassword('');
      // Shake effect logic is handled via CSS
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050505] overflow-hidden font-sans">
      {/* Cinematic Theme-Aligned Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s] opacity-30"></div>
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-1000 ${isLoading ? 'scale-90 opacity-0 blur-2xl' : 'scale-100 opacity-100 blur-0'}`}>
        <div className={`glass-panel rounded-[48px] p-12 border-white/5 flex flex-col items-center gap-10 shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] ${error ? 'animate-shake' : ''}`}>
          
          {/* Advanced TN Prismatic Monogram Logo - THEME ALIGNED */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative group">
              {/* Massive Volumetric Theme Glow */}
              <div className="absolute inset-[-40px] bg-emerald-500/10 blur-[60px] rounded-full animate-pulse opacity-60"></div>
              
              <div className="w-28 h-28 bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,1)] relative overflow-hidden ring-1 ring-white/5 transition-all duration-700 group-hover:border-emerald-500/40">
                {/* Internal Ambient Light */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10"></div>
                
                {/* Custom SVG TN Monogram - Theme Gradient */}
                <div className="relative z-10 flex items-center justify-center select-none scale-[1.3] animate-fade-in-up">
                  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M8 24V8L16 18L24 8V24" 
                      stroke="url(#tn-gradient-theme)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M6 10H26M16 10V26" 
                      stroke="white" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                    />
                    <defs>
                      <linearGradient id="tn-gradient-theme" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10b981" />
                        <stop offset="1" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Sweeping Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_4s_infinite]"></div>
              </div>
            </div>

            <div className="text-center space-y-3">
              {/* BRAND TEXT: THEME GRADIENT APPLIED HERE */}
              <h1 className="text-4xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 animate-text-glow">
                TradeNexus
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="w-8 h-[1px] bg-white/10"></span>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-80">Terminal v3.1</p>
                <span className="w-8 h-[1px] bg-white/10"></span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-emerald-500" /> Security Access Key
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className={`w-full bg-white/[0.02] border rounded-2xl px-6 py-5 text-lg tracking-widest font-black text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-800 ${error ? 'border-rose-500/50' : 'border-white/10 group-hover:border-white/20'}`}
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center mt-3 animate-bounce">Verification Failed: Link Severed</p>}
            </div>

            <button 
              disabled={!password || isLoading}
              className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{statusText}</span>
                </>
              ) : (
                <>
                  <span>Initiate Uplink</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Secure Footer */}
          <div className="flex flex-col items-center gap-5 border-t border-white/5 pt-10 w-full">
            <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encrypted Quantum Tunnel</span>
            </div>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Identity Confirmation Key: 5445</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          animation-iteration-count: 2;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes text-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.2)); }
          50% { filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4)); }
        }
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
