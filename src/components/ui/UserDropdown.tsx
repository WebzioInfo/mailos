'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Settings, Shield, HelpCircle, LogOut } from 'lucide-react';
import { handleLogout } from '@/lib/logout';

interface UserDropdownProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
    avatarInitials: string;
    workspaceName: string;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await handleLogout();
  };

  const displayName = user.name || 'User';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border text-left"
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
          {user.avatarInitials}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate">{user.role} &bull; {user.workspaceName}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[240px] bg-background border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <div className="p-4 border-b bg-slate-50 dark:bg-zinc-900/50">
            <div className="font-semibold text-sm truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          
          <div className="p-1">
            <Link href="/profile/account" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
              <User className="h-4 w-4 text-muted-foreground" /> Profile
            </Link>
            <Link href="/profile/sender-profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
              <Mail className="h-4 w-4 text-muted-foreground" /> Sender Profile
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" /> Workspace Settings
            </Link>
            <Link href="/profile/security" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
              <Shield className="h-4 w-4 text-muted-foreground" /> Security
            </Link>
          </div>

          <div className="p-1 border-t">
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground"
            >
              <HelpCircle className="h-4 w-4" /> Help & Support
            </button>
            <button 
              disabled={isLoggingOut}
              onClick={confirmLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors text-destructive disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" /> {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
