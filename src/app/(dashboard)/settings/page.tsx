import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./client";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspaceId as string },
  });

  if (!workspace) redirect('/login');

  return <SettingsClient initialData={workspace} />;
}
