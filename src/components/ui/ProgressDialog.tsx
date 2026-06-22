'use client';

import { CheckCircle2, XCircle, Send } from 'lucide-react';

export interface ProgressDialogProps {
  isOpen: boolean;
  title: string;
  currentValue: number;
  totalValue: number;
  currentLabel?: string;
  successCount: number;
  errorCount: number;
  isComplete?: boolean;
  onClose?: () => void;
  onViewReport?: () => void;
}

export function ProgressDialog({
  isOpen,
  title,
  currentValue,
  totalValue,
  currentLabel,
  successCount,
  errorCount,
  isComplete = false,
  onClose,
  onViewReport
}: ProgressDialogProps) {
  if (!isOpen) return null;

  const percentage = totalValue > 0 ? Math.round((currentValue / totalValue) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-6">
          
          <div className="flex justify-center">
            {isComplete ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Send className="w-8 h-8" />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold">{isComplete ? "Completed" : title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {isComplete 
                ? `Finished processing ${totalValue} recipients.` 
                : `Processing ${currentValue} of ${totalValue} recipients...`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isComplete && errorCount === 0 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-left">
            <div className="p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
              <span className="block text-xs text-muted-foreground uppercase">Successful</span>
              <span className="font-bold text-green-600">{successCount}</span>
            </div>
            <div className="p-3 border rounded-lg bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
              <span className="block text-xs text-muted-foreground uppercase">Failed</span>
              <span className="font-bold text-red-600">{errorCount}</span>
            </div>
          </div>

          {currentLabel && !isComplete && (
            <div className="text-xs text-muted-foreground truncate bg-slate-50 dark:bg-zinc-900/50 py-2 rounded-md">
              Current: <span className="font-mono text-foreground">{currentLabel}</span>
            </div>
          )}

          {isComplete && (
            <div className="pt-4 flex gap-3">
              {onClose && (
                <button 
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition"
                >
                  Close
                </button>
              )}
              {onViewReport && (
                <button 
                  onClick={onViewReport}
                  className="flex-1 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-md transition"
                >
                  View Report
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
