'use server';

import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { resolveAudience } from '@/modules/campaigns/audience';
import { startQuickEmailDelivery } from '@/lib/deliveryEngine';

import nodemailer from 'nodemailer';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function sendQuickEmail(data: {
  smtpProfileId: string;
  smtpPassword?: string;
  subject: string;
  body: string;
  audienceConfig: any;
}) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  if (!data.smtpPassword) {
    return { error: 'SMTP Password is required for live dispatch.' };
  }

  try {
    // 1. Verify SMTP Profile belongs to Workspace
    const smtpProfile = await prisma.sMTPProfile.findUnique({
      where: { id: data.smtpProfileId, workspaceId: session.workspaceId as string }
    });

    if (!smtpProfile) return { error: 'Invalid SMTP Profile' };

    // 2. Resolve Audience (flatten contacts, lists, tags into emails)
    const audience = await resolveAudience(session.workspaceId as string, data.audienceConfig);

    if (audience.finalRecipients.length === 0) {
      return { error: 'No valid recipients found' };
    }

    // 3. Save to QuickEmail model
    const quickEmail = await prisma.quickEmail.create({
      data: {
        workspaceId: session.workspaceId as string,
        subject: data.subject,
        body: data.body,
        to: audience.finalRecipients.map(r => r.email),
        smtpProfileId: data.smtpProfileId,
        status: 'SENDING'
      }
    });

    // 4. Initialize Nodemailer with DB profile + memory password
    const transporter = nodemailer.createTransport({
      host: smtpProfile.host,
      port: smtpProfile.port,
      secure: smtpProfile.port === 465, // true for 465, false for 587 and other ports (STARTTLS)
      auth: {
        user: smtpProfile.username,
        pass: data.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify SMTP before starting delivery
    try {
      await transporter.verify();
    } catch (sendError: any) {
      console.error("SMTP Setup Error:", sendError);
      let errorMessage = "Dispatch setup failed.";
      if (sendError.responseCode === 535) {
        errorMessage = "Authentication Failed: Invalid SMTP Password.";
      } else if (sendError.code === 'ECONNREFUSED') {
        errorMessage = "Connection Refused: SMTP host unreachable.";
      } else if (sendError.message) {
        errorMessage = sendError.message;
      }
      
      await prisma.quickEmail.update({
        where: { id: quickEmail.id },
        data: { status: 'PAUSED' }
      });

      return { error: errorMessage };
    }

    // Set to QUEUED initially
    await prisma.quickEmail.update({
      where: { id: quickEmail.id },
      data: { status: 'QUEUED' as any }
    });

    // Fire and forget background process
    startQuickEmailDelivery(quickEmail.id, data.smtpPassword, audience.finalRecipients).catch(console.error);

    return { 
      success: true, 
      emailId: quickEmail.id 
    };

  } catch (error) {
    console.error('Failed to send quick email:', error);
    return { error: 'Failed to process email request' };
  }
}


