'use client';

import { useState } from "react";
import { Play, Pause, XCircle, Copy, Loader2 } from "lucide-react";
import { updateCampaignStatus, duplicateCampaign } from "@/modules/campaigns/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CampaignDetailClient({ campaignId, currentStatus }: { campaignId: string, currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: 'PAUSED' | 'SCHEDULED' | 'ARCHIVED' | 'DRAFT') => {
    setIsLoading(true);
    const result = await updateCampaignStatus(campaignId, newStatus);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Campaign marked as ${newStatus}`);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    const result = await duplicateCampaign(campaignId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Campaign duplicated successfully");
      router.push(`/campaigns/${result.newCampaignId}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {(currentStatus === 'SCHEDULED' || currentStatus === 'SENDING') && (
        <button 
          disabled={isLoading}
          onClick={() => handleUpdateStatus('PAUSED')}
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 dark:hover:bg-yellow-900/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pause className="mr-2 h-4 w-4" />} Pause
        </button>
      )}

      {currentStatus === 'PAUSED' && (
        <button 
          disabled={isLoading}
          onClick={() => handleUpdateStatus('SCHEDULED')}
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} Resume
        </button>
      )}

      {(currentStatus === 'SCHEDULED' || currentStatus === 'PAUSED' || currentStatus === 'DRAFT') && (
        <button 
          disabled={isLoading}
          onClick={() => {
            if (confirm("Are you sure you want to cancel this campaign? It will be archived.")) {
              handleUpdateStatus('ARCHIVED');
            }
          }}
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />} Cancel
        </button>
      )}

      <button 
        disabled={isLoading}
        onClick={handleDuplicate}
        className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />} Duplicate
      </button>
    </div>
  );
}
