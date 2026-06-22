'use server';
// Cache bust 1

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function uploadMedia(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };
  
  if (file.size > 5 * 1024 * 1024) return { error: 'File exceeds 5MB limit' };
  if (!file.type.startsWith('image/')) return { error: 'Only images are supported currently' };

  try {
    // In a production environment, this streams to AWS S3 or Cloudflare R2
    // using the @aws-sdk/client-s3 package. 
    // We simulate the secure upload and generate a UUID URL.
    
    const fakeS3Url = `https://cdn.webzio.com/${session.workspaceId}/${crypto.randomUUID()}-${file.name}`;

    await prisma.media.create({
      data: {
        workspaceId: session.workspaceId as string,
        url: fakeS3Url,
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
      }
    });

    return { success: true };
  } catch (error) {
    return { error: 'Media upload failed' };
  }
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
