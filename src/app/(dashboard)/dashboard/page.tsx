import Link from "next/link";
import { Users, Mail, Percent, Zap, Plus, ArrowRight, LayoutTemplate, Send, Calendar, ListIcon, Activity, Upload, Settings } from "lucide-react";
import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Extract session to securely filter by workspaceId
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');
  
  const workspaceId = session.workspaceId;

  // Execute Live Prisma Queries in parallel
  const [
    totalContacts, 
    totalCampaigns, 
    totalTemplates, 
    totalLists,
    recentActivity,
    upcomingCampaigns,
    draftCampaigns,
    totalSmtpProfiles
  ] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
    prisma.template.count({ where: { workspaceId } }),
    prisma.list.count({ where: { workspaceId } }),
    prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.campaign.findMany({
      where: { workspaceId, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
      include: { template: true }
    }),
    prisma.campaign.findMany({
      where: { workspaceId, status: 'DRAFT' },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: { template: true }
    }),
    prisma.sMTPProfile.count({ where: { workspaceId } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here is your live workspace snapshot.</p>
        
        {totalSmtpProfiles === 0 && (
          <div className="mt-4 bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 p-4 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4"/> SMTP Setup Required</h3>
              <p className="text-sm mt-1">Configure your email delivery profile before you can send any campaigns or emails.</p>
            </div>
            <Link href="/smtp/setup" className="px-4 py-2 bg-orange-600 text-white font-medium text-sm rounded hover:bg-orange-700 transition">
              Setup SMTP
            </Link>
          </div>
        )}

        {totalContacts > 0 && totalSmtpProfiles > 0 && (
          <div className="mt-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-800 text-sm font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Onboarding completed! Your workspace is fully configured.
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 border rounded-xl bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Contacts</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalContacts.toLocaleString()}</div>
        </div>
        <div className="p-6 border rounded-xl bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Groups</h3>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalLists.toLocaleString()}</div>
        </div>
        <div className="p-6 border rounded-xl bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Templates</h3>
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalTemplates.toLocaleString()}</div>
        </div>
        <div className="p-6 border rounded-xl bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Campaigns</h3>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalCampaigns.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Upcoming Campaigns */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="w-5 h-5"/> Upcoming Campaigns</h2>
            <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
              {upcomingCampaigns.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No upcoming campaigns scheduled.
                </div>
              ) : (
                <div className="divide-y">
                  {upcomingCampaigns.map((camp: any) => (
                    <div key={camp.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <div>
                        <div className="font-medium">{camp.name}</div>
                        <div className="text-xs text-muted-foreground">Template: {camp.template?.name || '-'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : 'Pending'}
                        </div>
                        <div className="text-xs text-muted-foreground">Scheduled</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Draft Campaigns */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Mail className="w-5 h-5"/> Draft Campaigns</h2>
            <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
              {draftCampaigns.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No drafts found.
                </div>
              ) : (
                <div className="divide-y">
                  {draftCampaigns.map((camp: any) => (
                    <div key={camp.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <div>
                        <div className="font-medium">{camp.name}</div>
                        <div className="text-xs text-muted-foreground">Subject: {camp.subject}</div>
                      </div>
                      <div className="text-right">
                        <Link href={`/campaigns/${camp.id}/edit`} className="text-sm font-medium text-primary hover:underline">
                          Edit Draft &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="w-5 h-5"/> Recent Activity</h2>
            <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No recent activity.
                </div>
              ) : (
                <div className="divide-y">
                  {recentActivity.map((log: any) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <div className="text-sm"><span className="font-medium">{log.action}</span> on <span className="font-medium">{log.entity}</span></div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/contacts/new" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Create Contact</div>
              </div>
            </Link>
            <Link href="/contacts/import" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Upload className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Import Contacts</div>
              </div>
            </Link>
            <Link href="/templates/new" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><LayoutTemplate className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Create Template</div>
              </div>
            </Link>
            <Link href="/campaigns/new" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Send className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Create Campaign</div>
              </div>
            </Link>
            <Link href="/campaigns" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Schedule Campaign</div>
              </div>
            </Link>
            <Link href="/smtp" className="flex items-center gap-3 p-4 border rounded-xl bg-background hover:bg-accent transition-colors shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings className="h-5 w-5" /></div>
              <div>
                <div className="font-medium text-sm">Test SMTP</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
