import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditGroupClient from "./client";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const resolvedParams = await params;

  const groupId = resolvedParams.id;
  if (!groupId) redirect('/groups');

  const group = await prisma.list.findFirst({
    where: { 
      id: groupId,
      workspaceId: session.workspaceId as string
    }
  });

  if (!group) redirect('/groups');

  return (
    <div className="p-8 pb-20">
      <EditGroupClient group={group} />
    </div>
  );
}
