'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  html: z.string().min(1, "HTML content is required"),
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function createTemplate(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    html: formData.get('html') as string,
  };

  const validated = templateSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid template data' };

  try {
    const template = await prisma.template.create({
      data: {
        workspaceId: session.workspaceId as string,
        name: validated.data.name,
        html: validated.data.html,
        content: {}, // Raw JSON representation if we add block builder later
      }
    });
    
    return { success: true, templateId: template.id };
  } catch (error) {
    return { error: 'Failed to save template to database' };
  }
}

export async function updateTemplate(templateId: string, prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    html: formData.get('html') as string,
  };

  const validated = templateSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid template data' };

  try {
    const template = await prisma.template.update({
      where: { id: templateId, workspaceId: session.workspaceId as string },
      data: {
        name: validated.data.name,
        html: validated.data.html,
      }
    });
    
    return { success: true, templateId: template.id };
  } catch (error) {
    return { error: 'Failed to update template' };
  }
}
