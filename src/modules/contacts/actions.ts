'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
});

export async function createContact(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    company: formData.get('company') as string,
  };

  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.contact.create({
      data: {
        email: validatedFields.data.email,
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        workspaceId: session.workspaceId as string,
        attributes: validatedFields.data.company ? { company: validatedFields.data.company } : undefined,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A contact with this email already exists in your workspace.' };
    }
    return { error: 'Failed to create contact.' };
  }
  
  redirect('/contacts');
}

export async function updateContact(id: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    company: formData.get('company') as string,
  };

  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId: session.workspaceId as string }
    });

    if (!existing) return { error: 'Contact not found or unauthorized' };

    await prisma.contact.update({
      where: { id },
      data: {
        email: validatedFields.data.email,
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        attributes: validatedFields.data.company ? { company: validatedFields.data.company } : undefined,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A contact with this email already exists in your workspace.' };
    }
    return { error: 'Failed to update contact.' };
  }
  
  redirect('/contacts');
}

export async function deleteContact(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) {
    return { error: 'Unauthorized' };
  }

  try {
    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId: session.workspaceId as string }
    });

    if (!existing) return { error: 'Contact not found or unauthorized' };

    await prisma.contact.delete({
      where: { id }
    });
    
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/contacts');
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete contact.' };
  }
}
