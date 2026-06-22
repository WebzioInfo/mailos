'use server';

import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function removeMedia(id: string) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    await prisma.media.deleteMany({
      where: { id, workspaceId: session.workspaceId }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Delete failed' };
  }
}
