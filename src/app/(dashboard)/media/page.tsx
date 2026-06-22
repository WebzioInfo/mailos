import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import MediaClient from "./client";

export default async function MediaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const mediaFiles = await prisma.media.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: 'desc' }
  });

  return <MediaClient initialMedia={mediaFiles} />;
}
