'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

export async function createGroup(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  if (!name) return { error: 'Name is required' };

  try {
    await prisma.list.create({
      data: {
        name,
        workspaceId: session.workspaceId as string
      }
    });
  } catch (error) {
    return { error: 'Failed to create group' };
  }
  
  redirect('/groups');
}

export async function updateGroup(id: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  if (!name) return { error: 'Name is required' };

  try {
    const existing = await prisma.list.findFirst({
      where: { id, workspaceId: session.workspaceId as string }
    });

    if (!existing) return { error: 'Group not found' };

    await prisma.list.update({
      where: { id },
      data: { name }
    });
  } catch (error) {
    return { error: 'Failed to update group' };
  }
  
  redirect('/groups');
}

export async function deleteGroup(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    const existing = await prisma.list.findFirst({
      where: { id, workspaceId: session.workspaceId as string }
    });

    if (!existing) return { error: 'Group not found' };

    await prisma.list.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete group' };
  }
}
