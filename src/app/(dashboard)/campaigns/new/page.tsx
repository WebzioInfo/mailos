import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import CampaignWizardClient from "./client";

export default async function NewCampaignPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  // Fetch available templates and SMTP profiles for the dropdowns
  const [templates, smtpProfiles] = await Promise.all([
    prisma.template.findMany({ where: { workspaceId: session.workspaceId }, select: { id: true, name: true } }),
    prisma.sMTPProfile.findMany({ where: { workspaceId: session.workspaceId }, select: { id: true, name: true } })
  ]);

  return <CampaignWizardClient templates={templates} smtpProfiles={smtpProfiles} />;
}
