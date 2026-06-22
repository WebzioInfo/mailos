'use server';

import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const workspaceSettingsSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function updateWorkspaceSettings(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    workspaceName: formData.get('workspaceName') as string,
    timezone: formData.get('timezone') as string,
    language: formData.get('language') as string,
  };

  const validated = workspaceSettingsSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid settings data' };

  try {
    const currentWorkspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId as string },
    });
    
    if (!currentWorkspace) return { error: 'Workspace not found' };

    const currentSettings = typeof currentWorkspace.settings === 'object' && currentWorkspace.settings !== null 
      ? currentWorkspace.settings as any 
      : {};

    const newSettings = {
      ...currentSettings,
      timezone: validated.data.timezone,
      language: validated.data.language,
    };

    await prisma.workspace.update({
      where: { id: session.workspaceId as string },
      data: {
        name: validated.data.workspaceName,
        settings: newSettings,
      }
    });

    return { success: true };
  } catch (error) {
    return { error: 'Failed to update workspace settings' };
  }
}
