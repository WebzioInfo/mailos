'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface DeliveryJob {
  id: string;
  name: string;
  type: 'CAMPAIGN' | 'QUICK_EMAIL';
  status: 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'SCHEDULED';
  totalRecipients: number;
  processedRecipients: number;
  successfulRecipients: number;
  failedRecipients: number;
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  updatedAt: string;
}

interface DeliveryProgressContextType {
  jobs: DeliveryJob[];
  activeJobs: DeliveryJob[];
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  isLoading: boolean;
}

const DeliveryProgressContext = createContext<DeliveryProgressContextType | undefined>(undefined);

export function DeliveryProgressProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/delivery/progress');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch delivery progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [pathname]); // Refresh on navigation

  useEffect(() => {
    const activeJobExists = jobs.some(j => j.status === 'QUEUED' || j.status === 'SENDING');
    
    if (activeJobExists) {
      const interval = setInterval(fetchProgress, 3000);
      return () => clearInterval(interval);
    }
  }, [jobs]);

  const activeJobs = jobs.filter(j => j.status === 'QUEUED' || j.status === 'SENDING');

  return (
    <DeliveryProgressContext.Provider value={{ jobs, activeJobs, isDrawerOpen, toggleDrawer: () => setIsDrawerOpen(!isDrawerOpen), isLoading }}>
      {children}
    </DeliveryProgressContext.Provider>
  );
}

export const useDeliveryProgress = () => {
  const context = useContext(DeliveryProgressContext);
  if (context === undefined) {
    throw new Error('useDeliveryProgress must be used within a DeliveryProgressProvider');
  }
  return context;
};
