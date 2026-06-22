import Link from "next/link";
import { Plus, Send } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CampaignsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const campaigns = await prisma.campaign.findMany({ 
    where: { workspaceId: session.workspaceId },
    take: 10, 
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Create, schedule, and track your email broadcasts.</p>
        </div>
        <Link href="/campaigns/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Link>
      </div>

      <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-zinc-900 border-b text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <Send className="mx-auto h-8 w-8 mb-3 opacity-20" />
                  No campaigns yet. Launch your first broadcast to see it here.
                </td>
              </tr>
            ) : (
              campaigns.map((camp: any) => (
                <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/campaigns/${camp.id}`} className="hover:underline text-primary">
                      {camp.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 truncate max-w-[200px]">{camp.subject}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    camp.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    camp.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' :
                    camp.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{camp.status}</span></td>
                  <td className="px-6 py-4">{new Date(camp.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/campaigns/${camp.id}/edit`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Campaign"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </Link>
                      <form action={async () => {
                        'use server';
                        const { duplicateCampaign } = await import('@/modules/campaigns/actions');
                        await duplicateCampaign(camp.id);
                        const { revalidatePath } = await import('next/cache');
                        revalidatePath('/campaigns');
                      }}>
                        <button 
                          type="submit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
                          title="Duplicate Campaign"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        const { deleteCampaign } = await import('@/modules/campaigns/actions');
                        await deleteCampaign(camp.id);
                        const { revalidatePath } = await import('next/cache');
                        revalidatePath('/campaigns');
                      }}>
                        <button 
                          type="submit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Campaign"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
