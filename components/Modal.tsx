
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with sophisticated blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-[8px] transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content - Perfectly Centered */}
      <div className="relative glass-panel w-full max-w-lg rounded-[40px] overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,1)]">
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
