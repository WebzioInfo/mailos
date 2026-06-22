import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuickEmailClient from "./client";

async function getPageData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const [smtpProfiles, contacts, lists, tags, templates, senderProfile] = await Promise.all([
    prisma.sMTPProfile.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true, senderEmail: true }
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
    }),
    prisma.template.findMany({
      where: { workspaceId: session.workspaceId as string },
      select: { id: true, name: true, html: true }
    }),
    prisma.senderProfile.findUnique({
      where: { workspaceId: session.workspaceId as string }
    })
  ]);

  return { smtpProfiles, contacts, lists, tags, templates, senderProfile };
}

export default async function SendEmailPage() {
  const data = await getPageData();
  
  return <QuickEmailClient {...data} />;
}
