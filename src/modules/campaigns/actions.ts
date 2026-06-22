'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

import nodemailer from 'nodemailer';
import { resolveAudience } from '@/modules/campaigns/audience';

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Email subject is required"),
  templateId: z.string().min(1, "Template selection is required"),
  smtpProfileId: z.string().min(1, "SMTP Profile is required"),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING"]),
  scheduledAt: z.string().optional(),
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function createCampaign(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    templateId: formData.get('templateId') as string,
    smtpProfileId: formData.get('smtpProfileId') as string,
    status: formData.get('status') as string || 'DRAFT',
    scheduledAt: formData.get('scheduledAt') as string,
    audience: formData.get('audience') as string,
    smtpPassword: formData.get('smtpPassword') as string,
  };

  const validated = campaignSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid campaign data' };

  if (validated.data.status === 'SENDING' && !rawData.smtpPassword) {
    return { error: 'SMTP Password is required to send campaign securely' };
  }

  try {
    const audienceJson = rawData.audience ? JSON.parse(rawData.audience) : null;
    if (!audienceJson && validated.data.status !== 'DRAFT') {
      return { error: 'You must select at least one recipient.' };
    }

    const template = await prisma.template.findUnique({
      where: { id: validated.data.templateId }
    });
    if (!template) return { error: 'Template not found' };

    const smtpProfile = await prisma.sMTPProfile.findUnique({
      where: { id: validated.data.smtpProfileId }
    });
    if (!smtpProfile) return { error: 'SMTP Profile not found' };

    let audience;
    if (audienceJson) {
       audience = await resolveAudience(session.workspaceId as string, audienceJson);
       if (validated.data.status === 'SENDING' && audience.finalRecipients.length === 0) {
         return { error: 'No valid recipients found' };
       }
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: session.workspaceId as string,
        name: validated.data.name,
        subject: validated.data.subject,
        templateId: validated.data.templateId,
        smtpProfileId: validated.data.smtpProfileId,
        status: validated.data.status as any,
        scheduledAt: validated.data.status === 'SCHEDULED' && validated.data.scheduledAt ? new Date(validated.data.scheduledAt) : null,
        audience: audienceJson,
      }
    });
    
    // Inline Sending for Phase 1
    if (validated.data.status === 'SENDING' && audience) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpProfile.host,
          port: smtpProfile.port,
          secure: smtpProfile.port === 465, // true for 465, false for 587 and other ports (STARTTLS)
          auth: {
            user: smtpProfile.username,
            pass: rawData.smtpPassword,
          },
          tls: { rejectUnauthorized: false }
        });
        
        await transporter.sendMail({
          from: `"${smtpProfile.senderName}" <${smtpProfile.senderEmail}>`,
          to: audience.finalRecipients.map(r => r.email),
          subject: validated.data.subject,
          html: template.html,
        });

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'COMPLETED' }
        });
      } catch (sendError: any) {
        console.error("Campaign Dispatch Error:", sendError);
        let errorMessage = "Dispatch failed.";
        if (sendError.responseCode === 535) {
          errorMessage = "Authentication Failed: Invalid SMTP Password.";
        } else if (sendError.code === 'ECONNREFUSED') {
          errorMessage = "Connection Refused: SMTP host unreachable.";
        } else if (sendError.message) {
          errorMessage = sendError.message;
        }

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'PAUSED' }
        });

        return { error: errorMessage };
      }
    }
    
    return { success: true, campaignId: campaign.id };
  } catch (error) {
    return { error: 'Failed to launch campaign' };
  }
}

export async function updateCampaignStatus(campaignId: string, status: 'PAUSED' | 'SCHEDULED' | 'ARCHIVED' | 'DRAFT') {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    await prisma.campaign.update({
      where: { id: campaignId, workspaceId: session.workspaceId as string },
      data: { status }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update campaign status' };
  }
}

export async function duplicateCampaign(campaignId: string) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    const original = await prisma.campaign.findUnique({
      where: { id: campaignId, workspaceId: session.workspaceId as string }
    });

    if (!original) return { error: 'Campaign not found' };

    const duplicate = await prisma.campaign.create({
      data: {
        workspaceId: session.workspaceId as string,
        name: `${original.name} (Copy)`,
        subject: original.subject,
        smtpProfileId: original.smtpProfileId,
        templateId: original.templateId,
        status: 'DRAFT',
      }
    });

    return { success: true, newCampaignId: duplicate.id };
  } catch (error) {
    return { error: 'Failed to duplicate campaign' };
  }
}

export async function updateCampaign(campaignId: string, prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    templateId: formData.get('templateId') as string,
    smtpProfileId: formData.get('smtpProfileId') as string,
    status: formData.get('status') as string || 'DRAFT',
    scheduledAt: formData.get('scheduledAt') as string,
    audience: formData.get('audience') as string,
  };

  const validated = campaignSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid campaign data' };

  try {
    const audienceJson = rawData.audience ? JSON.parse(rawData.audience) : null;
    
    await prisma.campaign.update({
      where: { id: campaignId, workspaceId: session.workspaceId as string },
      data: {
        name: validated.data.name,
        subject: validated.data.subject,
        templateId: validated.data.templateId,
        smtpProfileId: validated.data.smtpProfileId,
        status: validated.data.status as any,
        scheduledAt: validated.data.status === 'SCHEDULED' && validated.data.scheduledAt ? new Date(validated.data.scheduledAt) : null,
        audience: audienceJson,
      }
    });

    return { success: true };
  } catch (error) {
    return { error: 'Failed to update campaign' };
  }
}

export async function deleteCampaign(campaignId: string) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    await prisma.campaign.delete({
      where: { id: campaignId, workspaceId: session.workspaceId as string }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete campaign' };
  }
}
