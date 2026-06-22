import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('mailos_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session = await verifyToken(token);
    if (!session || !session.workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We consider a job "recent" if it completed/failed in the last 24 hours, or is currently active
    const activeStatuses: any[] = ['QUEUED', 'SENDING'];
    
    const [campaigns, quickEmails] = await Promise.all([
      (prisma.campaign.findMany({
        where: {
          workspaceId: session.workspaceId as string,
          OR: [
            { status: { in: activeStatuses } },
            { 
              status: { in: ['COMPLETED', 'FAILED'] as any[] },
              updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          status: true,
          totalRecipients: true,
          processedRecipients: true,
          successfulRecipients: true,
          failedRecipients: true,
          progressPercent: true,
          startedAt: true,
          completedAt: true,
          errorMessage: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' } as any
      }) as any),
      (prisma.quickEmail.findMany({
        where: {
          workspaceId: session.workspaceId as string,
          OR: [
            { status: { in: activeStatuses } },
            { 
              status: { in: ['COMPLETED', 'FAILED'] as any[] },
              updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
          ]
        } as any,
        select: {
          id: true,
          subject: true,
          status: true,
          totalRecipients: true,
          processedRecipients: true,
          successfulRecipients: true,
          failedRecipients: true,
          progressPercent: true,
          startedAt: true,
          completedAt: true,
          errorMessage: true,
          updatedAt: true,
        } as any,
        orderBy: { updatedAt: 'desc' } as any
      }) as any)
    ]);

    // Normalize QuickEmails to look like Campaigns for the unified UI
    const normalizedQuickEmails = quickEmails.map((qe: any) => ({
      ...qe,
      name: qe.subject || 'Quick Email',
      type: 'QUICK_EMAIL'
    }));

    const normalizedCampaigns = campaigns.map((c: any) => ({
      ...c,
      type: 'CAMPAIGN'
    }));

    const allJobs = [...normalizedCampaigns, ...normalizedQuickEmails].sort(
      (a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    return NextResponse.json({ jobs: allJobs });
  } catch (error) {
    console.error("Progress API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
