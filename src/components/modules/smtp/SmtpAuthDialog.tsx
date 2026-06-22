'use client';

import { useState } from 'react';
import { X, ShieldCheck, Eye, EyeOff, Send } from 'lucide-react';
import { toast } from 'sonner';

interface SmtpAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  smtpProfiles: any[];
  defaultProfileId?: string;
  onConfirm: (profileId: string, password: string) => Promise<void>;
  title?: string;
}

export function SmtpAuthDialog({ 
  isOpen, 
  onClose, 
  smtpProfiles, 
  defaultProfileId, 
  onConfirm,
  title = "Authenticate to Send"
}: SmtpAuthDialogProps) {
  const [profileId, setProfileId] = useState(defaultProfileId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!profileId) return toast.error("Please select an SMTP Profile.");
    if (!password) return toast.error("SMTP Password is required.");

    setIsAuthenticating(true);
    try {
      await onConfirm(profileId, password);
      // The parent will handle closing on success
    } catch (err: any) {
      toast.error(err.message || "Authentication Failed.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const selectedProfile = smtpProfiles.find(p => p.id === profileId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
            For security, your SMTP password is <strong>never stored</strong>. Please provide it to authenticate this session.
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP Profile</label>
            <select 
              value={profileId} 
              onChange={e => setProfileId(e.target.value)}
              className="w-full h-11 px-3 border rounded-md bg-background"
            >
              <option value="">Select a Profile...</option>
              {smtpProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.senderEmail})</option>
              ))}
            </select>
          </div>

          {selectedProfile && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input 
                type="text" 
                value={selectedProfile.username} 
                disabled 
                className="w-full h-11 px-3 border rounded-md bg-slate-100 dark:bg-zinc-900 text-muted-foreground cursor-not-allowed"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP / App Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full h-11 pl-3 pr-10 border rounded-md focus:border-primary outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">If using Gmail or Office365, use an App Password.</p>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
            disabled={isAuthenticating}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isAuthenticating || !profileId || !password}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Authenticate & Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
