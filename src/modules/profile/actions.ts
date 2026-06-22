'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken, hashPassword, comparePasswords } from '@/lib/auth';
import { cookies } from 'next/headers';

// Schemas
const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const senderSchema = z.object({
  defaultSenderName: z.string().min(1, "Sender name is required"),
  defaultSenderEmail: z.string().email("Valid sender email is required"),
});

const brandingSchema = z.object({
  brandPrimaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  brandLogoUrl: z.string().url("Must be a valid URL").or(z.literal('')),
});

// Helper to get user
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// 1. Update Account
export async function updateAccount(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    companyName: formData.get('companyName') as string,
  };

  const validated = accountSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid fields' };

  try {
    await prisma.user.update({
      where: { id: session.userId as string },
      data: { name: validated.data.name }
    });

    await prisma.userProfile.upsert({
      where: { userId: session.userId as string },
      create: {
        userId: session.userId as string,
        companyName: validated.data.companyName,
      },
      update: {
        companyName: validated.data.companyName,
      }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update account' };
  }
}

// 2. Update Security
export async function updateSecurity(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
  };

  const validated = securitySchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid fields' };

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
    if (!user || !user.passwordHash) return { error: 'User not found' };

    const isValid = await comparePasswords(validated.data.currentPassword, user.passwordHash);
    if (!isValid) return { error: 'Incorrect current password' };

    const newHash = await hashPassword(validated.data.newPassword);

    await prisma.user.update({
      where: { id: session.userId as string },
      data: { passwordHash: newHash }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update password' };
  }
}

const newSenderSchema = z.object({
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  replyToEmail: z.string().optional(),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  brandColor: z.string().optional(),
  signature: z.string().optional(),
  footer: z.string().optional(),
});

export async function getSenderProfile(workspaceId: string) {
  try {
    return await prisma.senderProfile.findUnique({
      where: { workspaceId }
    });
  } catch (error) {
    return null;
  }
}

export async function upsertSenderProfile(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    senderName: formData.get('senderName') as string,
    senderEmail: formData.get('senderEmail') as string,
    replyToEmail: formData.get('replyToEmail') as string,
    companyName: formData.get('companyName') as string,
    designation: formData.get('designation') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    logoUrl: formData.get('logoUrl') as string,
    brandColor: formData.get('brandColor') as string,
    signature: formData.get('signature') as string,
    footer: formData.get('footer') as string,
  };

  const validated = newSenderSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid fields' };

  try {
    await prisma.senderProfile.upsert({
      where: { workspaceId: session.workspaceId as string },
      create: {
        workspaceId: session.workspaceId as string,
        ...validated.data
      },
      update: {
        ...validated.data
      }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update sender profile' };
  }
}

// 4. Update Branding
export async function updateBranding(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session) return { error: 'Unauthorized' };

  const rawData = {
    brandPrimaryColor: formData.get('brandPrimaryColor') as string,
    brandLogoUrl: formData.get('brandLogoUrl') as string,
  };

  const validated = brandingSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid fields' };

  try {
    await prisma.userProfile.upsert({
      where: { userId: session.userId as string },
      create: {
        userId: session.userId as string,
        brandPrimaryColor: validated.data.brandPrimaryColor,
        brandLogoUrl: validated.data.brandLogoUrl,
      },
      update: {
        brandPrimaryColor: validated.data.brandPrimaryColor,
        brandLogoUrl: validated.data.brandLogoUrl,
      }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update branding' };
  }
}
