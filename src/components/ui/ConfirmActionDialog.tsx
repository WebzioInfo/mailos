'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  isLoading?: boolean;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  isLoading = false
}: ConfirmActionDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
          <h3 className={`font-bold text-lg flex items-center gap-2 ${danger ? 'text-red-600 dark:text-red-500' : 'text-foreground'}`}>
            {danger && <AlertTriangle className="w-5 h-5" />}
            {title}
          </h3>
          <button disabled={isLoading} onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-muted-foreground">
          {message}
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md disabled:opacity-50"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-sm font-bold rounded-md flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors ${
              danger 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
