'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { handleLogout } from '@/lib/logout';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function LogoutButton({ children, className }: LogoutButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await handleLogout();
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={className || "flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors w-full text-left"}
      >
        {children || (
          <>
            <LogOut className="h-4 w-4" /> 
            <span className="text-sm font-medium">Logout</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Logout</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to logout?
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                disabled={isLoggingOut}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isLoggingOut}
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
