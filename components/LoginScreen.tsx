
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Dynamic Mesh Background for Auth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isLoading ? 'scale-95 opacity-0 blur-lg' : 'scale-100 opacity-100 blur-0'}`}>
        <div className={`glass-panel rounded-[40px] p-12 border-white/5 flex flex-col items-center gap-8 shadow-[0_32px_128px_-32px_rgba(0,0,0,1)] ${error ? 'animate-shake' : ''}`}>
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-3xl flex items-center justify-center text-black font-black text-4xl shadow-2xl shadow-emerald-500/20 animate-fade-in-up">
              <div className="relative flex items-center justify-center">
                <span className="relative z-10">T</span>
                <span className="absolute z-0 opacity-40 translate-x-[4px] translate-y-[2px]">N</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">TradeNexus</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Proprietary Terminal v3.1</p>
            </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} /> System Passcode
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Access Key"
                  className={`w-full bg-white/[0.03] border rounded-2xl px-6 py-4 text-sm font-black text-white focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-700 ${error ? 'border-rose-500/50' : 'border-white/10 group-hover:border-white/20'}`}
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center mt-2">Access Denied: Invalid Key</p>}
            </div>

            <button 
              disabled={!password || isLoading}
              className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all glow-cyan active:scale-[0.98] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{statusText}</span>
                </>
              ) : (
                <>
                  <span>Initialize Boot</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-8 w-full">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encryption Active</span>
            </div>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Hint: 5445</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          animation-iteration-count: 2;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
