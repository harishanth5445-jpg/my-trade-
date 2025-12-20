
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative glass-panel w-full max-w-lg rounded-[32px] md:rounded-[40px] overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 border-white/10 shadow-2xl">
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full text-slate-500 transition-all">
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-8 md:p-10 max-h-[80vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
