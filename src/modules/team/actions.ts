'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function inviteTeamMember(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  };

  const validated = inviteSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid invite data' };

  try {
    // 1. Check if user already exists
    let targetUser = await prisma.user.findUnique({ where: { email: validated.data.email } });
    
    // 2. If not, create a shell user (they set password on first login via invite link)
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: { email: validated.data.email }
      });
    }

    // 3. Create Workspace Member relationship
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: targetUser.id,
          workspaceId: session.workspaceId as string
        }
      },
      update: { role: validated.data.role as any },
      create: {
        userId: targetUser.id,
        workspaceId: session.workspaceId as string,
        role: validated.data.role as any,
      }
    });

    return { success: true };
  } catch (error) {
    return { error: 'Failed to invite team member' };
  }
}
