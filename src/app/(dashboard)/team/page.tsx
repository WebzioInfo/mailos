import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import TeamClient from "./client";

export default async function TeamPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: session.workspaceId },
    include: { user: { select: { email: true, name: true } } }
  });

  return <TeamClient members={members} />;
}
