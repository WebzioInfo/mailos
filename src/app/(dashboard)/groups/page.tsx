import Link from "next/link";
import { Plus, Users, LayoutList } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const groups = await prisma.list.findMany({ 
    where: { workspaceId: session.workspaceId },
    include: { _count: { select: { contacts: true } } },
    take: 20 
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage your contact segments and audience lists.</p>
        </div>
        <Link href="/groups/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Link>
      </div>

      <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-zinc-900 border-b text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Group Name</th>
              <th className="px-6 py-3 font-medium">Members</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                  <LayoutList className="mx-auto h-8 w-8 mb-3 opacity-20" />
                  No groups found. Create a group to organize your contacts.
                </td>
              </tr>
            ) : (
              groups.map((group: any) => (
                <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-medium">{group.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {group._count.contacts} contacts
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/send-email?groupId=${group.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-primary transition-colors"
                        title="Send Email to Group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      </Link>
                      <Link 
                        href={`/groups/${group.id}/edit`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </Link>
                      <form action={async () => {
                        'use server';
                        const { deleteGroup } = await import('@/modules/groups/actions');
                        await deleteGroup(group.id);
                      }}>
                        <button 
                          type="submit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Group"
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
