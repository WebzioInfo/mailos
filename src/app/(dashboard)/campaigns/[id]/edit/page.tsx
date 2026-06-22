import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditCampaignClient from "./client";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const resolvedParams = await params;

  const [campaign, smtpProfiles, templates, contacts, lists, tags] = await Promise.all([
    prisma.campaign.findUnique({
      where: { 
        id: resolvedParams.id,
        workspaceId: session.workspaceId as string
      }
    }),
    prisma.sMTPProfile.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true, senderEmail: true }
    }),
    prisma.template.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true }
    }),
    prisma.contact.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, email: true, firstName: true, lastName: true }
    }),
    prisma.list.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true }
    }),
    prisma.tag.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true }
    })
  ]);

  if (!campaign) redirect('/campaigns');

  return (
    <div className="p-8 pb-20">
      <EditCampaignClient 
        campaign={campaign} 
        smtpProfiles={smtpProfiles}
        templates={templates}
        contacts={contacts}
        lists={lists}
        tags={tags}
      />
    </div>
  );
}
