import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SmtpDashboardClient from './client';

export default async function SmtpPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const profiles = await prisma.sMTPProfile.findMany({
    where: { workspaceId: session.workspaceId as string },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SMTP Profiles</h1>
        <p className="text-muted-foreground mt-1">Manage your email delivery providers.</p>
      </div>
      <SmtpDashboardClient initialProfiles={profiles} />
    </div>
  );
}
