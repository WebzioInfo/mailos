'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import nodemailer from 'nodemailer';

const smtpSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  provider: z.string().default("CUSTOM"),
  host: z.string().min(1, "SMTP host is required"),
  port: z.coerce.number().min(1, "Valid port is required"),
  username: z.string().min(1, "SMTP username is required"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Valid sender email is required"),
  encryption: z.enum(["TLS", "SSL", "STARTTLS", "NONE"]),
});

export async function createSmtpProfile(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name') as string,
    provider: formData.get('provider') as string || 'CUSTOM',
    host: formData.get('host') as string,
    port: formData.get('port'),
    username: formData.get('username') as string,
    senderName: formData.get('senderName') as string,
    senderEmail: formData.get('senderEmail') as string,
    encryption: formData.get('encryption') as string,
  };

  const validatedFields = smtpSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: 'Invalid fields: ' + JSON.stringify(validatedFields.error.flatten().fieldErrors) };
  }

  try {
    await prisma.sMTPProfile.create({
      data: {
        name: validatedFields.data.name,
        provider: validatedFields.data.provider,
        host: validatedFields.data.host,
        port: validatedFields.data.port,
        username: validatedFields.data.username,
        senderName: validatedFields.data.senderName,
        senderEmail: validatedFields.data.senderEmail,
        encryption: validatedFields.data.encryption as any,
        workspaceId: session.workspaceId as string,
      }
    });
    // Force TS re-evaluation after prisma generate
  } catch (error: any) {
    return { error: 'Failed to create SMTP profile.' };
  }
  
  redirect('/smtp');
}

export async function updateSmtpProfile(id: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    provider: formData.get('provider') as string || 'CUSTOM',
    host: formData.get('host') as string,
    port: formData.get('port'),
    username: formData.get('username') as string,
    senderName: formData.get('senderName') as string,
    senderEmail: formData.get('senderEmail') as string,
    encryption: formData.get('encryption') as string,
  };

  const validatedFields = smtpSchema.safeParse(rawData);
  if (!validatedFields.success) return { error: 'Invalid fields' };

  try {
    await prisma.sMTPProfile.update({
      where: { id, workspaceId: session.workspaceId as string },
      data: {
        name: validatedFields.data.name,
        provider: validatedFields.data.provider,
        host: validatedFields.data.host,
        port: validatedFields.data.port,
        username: validatedFields.data.username,
        senderName: validatedFields.data.senderName,
        senderEmail: validatedFields.data.senderEmail,
        encryption: validatedFields.data.encryption as any,
      }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update SMTP profile.' };
  }
}

export async function deleteSmtpProfile(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);

  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    await prisma.sMTPProfile.delete({
      where: { id, workspaceId: session.workspaceId as string }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete SMTP profile.' };
  }
}

export async function testSmtpConnection(data: any, password: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  try {
    const transporter = nodemailer.createTransport({
      host: data.host,
      port: Number(data.port),
      secure: Number(data.port) === 465, // true for 465, false for 587 and other ports (STARTTLS)
      auth: {
        user: data.username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    
    // Optional: send a test email
    await transporter.sendMail({
      from: `"${data.senderName}" <${data.senderEmail}>`,
      to: data.senderEmail, // send to self as test
      subject: "Webzio MailOS - SMTP Test Connection",
      text: "Your SMTP connection is working perfectly!",
      html: "<h3>Success!</h3><p>Your SMTP connection is working perfectly in Webzio MailOS.</p>"
    });

    return { success: true };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    let errorMessage = "Connection failed.";
    if (error.responseCode === 535) {
      errorMessage = "Authentication Failed: Invalid Username or Password.";
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Connection Refused: Check your host and port.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Connection Timeout: Server is unreachable or port is blocked.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}
