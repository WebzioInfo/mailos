import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Pause, XCircle, Copy, Clock, Activity, Send } from "lucide-react";
import CampaignDetailClient from "./client";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const campaign = await prisma.campaign.findUnique({
    where: { id: id, workspaceId: session.workspaceId as string },
    include: {
      template: true,
      smtpProfile: true,
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!campaign) {
    redirect('/campaigns');
  }

  // Calculate queue status
  const queuedCount = await prisma.emailLog.count({ where: { campaignId: campaign.id, status: 'QUEUED' } });
  const sentCount = await prisma.emailLog.count({ where: { campaignId: campaign.id, status: 'SENT' } });
  const failedCount = await prisma.emailLog.count({ where: { campaignId: campaign.id, status: 'FAILED' } });
  const deliveredCount = await prisma.emailLog.count({ where: { campaignId: campaign.id, status: 'DELIVERED' } });

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                campaign.status === 'SENDING' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' :
                campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {campaign.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {campaign.scheduledAt ? `Scheduled for ${new Date(campaign.scheduledAt).toLocaleString()}` : 'No schedule set'}
              </span>
            </div>
          </div>
        </div>

        <CampaignDetailClient campaignId={campaign.id} currentStatus={campaign.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6 bg-background shadow-sm space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Queue Status</h3>
          <div className="text-3xl font-bold">{queuedCount} <span className="text-lg font-normal text-muted-foreground">queued</span></div>
        </div>
        <div className="border rounded-xl p-6 bg-background shadow-sm space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Send className="w-4 h-4"/> Delivered</h3>
          <div className="text-3xl font-bold">{deliveredCount} <span className="text-lg font-normal text-muted-foreground">delivered</span></div>
        </div>
        <div className="border rounded-xl p-6 bg-background shadow-sm space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4"/> Failed/Bounced</h3>
          <div className="text-3xl font-bold">{failedCount} <span className="text-lg font-normal text-muted-foreground">failed</span></div>
        </div>
      </div>

      <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold">Campaign Details</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Subject</div>
            <div>{campaign.subject}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Template</div>
            <div>{campaign.template?.name || '-'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">SMTP Profile</div>
            <div>{campaign.smtpProfile?.name || '-'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Created At</div>
            <div>{new Date(campaign.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold">Recent History & Logs</h3>
        </div>
        {campaign.logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No delivery logs found. Campaign has not started sending yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {campaign.logs.map(log => (
              <div key={log.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Contact ID: {log.contactId}</span>
                  <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
