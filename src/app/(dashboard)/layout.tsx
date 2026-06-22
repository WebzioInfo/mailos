import Link from "next/link";
import { Mail } from "lucide-react";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { UserDropdown } from "@/components/ui/UserDropdown";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

async function getLayoutData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.userId || !session.workspaceId) redirect('/login');

  const [user, member, workspace] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId as string }, include: { profile: true } }),
    prisma.workspaceMember.findUnique({ where: { userId_workspaceId: { userId: session.userId as string, workspaceId: session.workspaceId as string } } }),
    prisma.workspace.findUnique({ where: { id: session.workspaceId as string } })
  ]);

  if (!user || !member || !workspace) redirect('/login');

  const displayName = user.name || 'User';
    
  const avatarInitials = displayName.substring(0, 2).toUpperCase();

  return {
    user: {
      name: user.name,
      email: user.email,
      role: member.role,
      avatarInitials,
      workspaceName: workspace.name
    },
    workspace,
    role: member.role
  };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await getLayoutData();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <span className="font-bold tracking-tight truncate">{data.workspace.name}</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <SidebarNav userRole={data.role as any} />
        </div>
        
        <div className="p-4 border-t">
          <UserDropdown user={data.user} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-0 overflow-hidden">
        <header className="h-16 border-b bg-background flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-8 border rounded-md px-3 flex items-center text-sm bg-slate-50 dark:bg-zinc-900 cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-medium truncate max-w-[200px]">{data.workspace.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/campaigns/new" className="h-8 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center hover:bg-primary/90 transition-colors shadow-sm">
              New Campaign
            </Link>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
