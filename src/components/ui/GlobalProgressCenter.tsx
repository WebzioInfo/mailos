'use client';

import React from 'react';
import { useDeliveryProgress, DeliveryJob } from '@/components/providers/DeliveryProgressProvider';
import { Bell, X, Activity, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

export function GlobalProgressCenter() {
  const { jobs, activeJobs, isDrawerOpen, toggleDrawer } = useDeliveryProgress();

  if (jobs.length === 0) return null;

  const renderJobCard = (job: DeliveryJob) => {
    const isSending = job.status === 'SENDING' || job.status === 'QUEUED';
    const isFailed = job.status === 'FAILED';
    const isCompleted = job.status === 'COMPLETED';

    return (
      <div key={job.id} className="p-4 border rounded-xl bg-background shadow-sm hover:shadow-md transition-all mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-sm truncate max-w-[200px]">{job.name}</h4>
            <span className="text-xs text-muted-foreground uppercase">{job.type.replace('_', ' ')}</span>
          </div>
          <div>
            {isSending && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><Activity className="w-3 h-3 mr-1 animate-pulse" /> {job.status}</span>}
            {isCompleted && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED</span>}
            {isFailed && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" /> FAILED</span>}
          </div>
        </div>

        {isSending && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{job.processedRecipients} / {job.totalRecipients} emails</span>
              <span className="font-medium">{job.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${job.progressPercent}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-3 pt-3 border-t text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Successful</span>
            <span className="font-medium text-green-600">{job.successfulRecipients}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Failed</span>
            <span className="font-medium text-red-600">{job.failedRecipients}</span>
          </div>
          {job.startedAt && (
            <div className="flex flex-col ml-auto text-right">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">{new Date(job.startedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {job.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded text-xs text-red-600 border border-red-100 dark:border-red-900/50">
            {job.errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Indicator for active jobs (shows when drawer is closed) */}
      {!isDrawerOpen && activeJobs.length > 0 && (
        <div 
          onClick={toggleDrawer}
          className="fixed bottom-6 right-6 bg-background border shadow-xl rounded-full px-4 py-3 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform z-40 animate-in slide-in-from-bottom-5"
        >
          <div className="relative">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Sending {activeJobs.length} Job{activeJobs.length > 1 ? 's' : ''}</span>
            <span className="text-xs text-muted-foreground">{activeJobs[0].progressPercent}% Complete</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
        </div>
      )}

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={toggleDrawer} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Delivery Center</h3>
              </div>
              <button onClick={toggleDrawer} className="p-1 hover:bg-black/5 rounded-md text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-zinc-950/50">
              {activeJobs.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Deliveries</h4>
                  {activeJobs.map(renderJobCard)}
                </div>
              )}

              {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED').length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h4>
                  {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED').map(renderJobCard)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function ProgressNavIcon() {
  const { activeJobs, toggleDrawer } = useDeliveryProgress();
  
  return (
    <button 
      onClick={toggleDrawer}
      className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
      title="Delivery Center"
    >
      <Bell className="w-5 h-5" />
      {activeJobs.length > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-background"></span>
      )}
    </button>
  );
}
