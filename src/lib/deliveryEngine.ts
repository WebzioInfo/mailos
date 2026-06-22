import prisma from '@/lib/db';
import nodemailer from 'nodemailer';

export async function startCampaignDelivery(campaignId: string, smtpPassword: string) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { template: true, smtpProfile: true }
    });

    if (!campaign || !campaign.template || !campaign.audience) {
      console.error(`Campaign ${campaignId} not found or missing configuration.`);
      return;
    }

    const audience = campaign.audience as any;
    const recipients = audience.finalRecipients || [];
    const totalRecipients = recipients.length;

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENDING',
        totalRecipients,
        startedAt: new Date(),
        processedRecipients: 0,
        successfulRecipients: 0,
        failedRecipients: 0,
        progressPercent: 0
      }
    });

    if (totalRecipients === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED', completedAt: new Date(), progressPercent: 100 }
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: campaign.smtpProfile.host,
      port: campaign.smtpProfile.port,
      secure: campaign.smtpProfile.port === 465,
      auth: {
        user: campaign.smtpProfile.username,
        pass: smtpPassword,
      },
      tls: { rejectUnauthorized: false }
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < totalRecipients; i++) {
      const recipient = recipients[i];
      let status: 'DELIVERED' | 'FAILED' = 'DELIVERED';
      let errorMsg: string | undefined = undefined;
      let messageId: string | undefined = undefined;

      try {
        const info = await transporter.sendMail({
          from: `"${campaign.smtpProfile.senderName}" <${campaign.smtpProfile.senderEmail}>`,
          to: recipient.email,
          subject: campaign.subject,
          html: campaign.template.html,
        });
        successCount++;
        messageId = info.messageId;
      } catch (err: any) {
        console.error(`Failed to send to ${recipient.email}:`, err);
        failCount++;
        status = 'FAILED';
        errorMsg = err.message || 'Unknown error';

        if (err.responseCode === 535 || err.code === 'ECONNREFUSED') {
          // Critical SMTP failure, abort remaining
          await prisma.campaign.update({
            where: { id: campaignId },
            data: {
              status: 'FAILED',
              errorMessage: `Critical SMTP Error: ${errorMsg}`,
              completedAt: new Date(),
            }
          });
          return;
        }
      }

      await prisma.emailLog.create({
        data: {
          campaignId: campaign.id,
          contactId: recipient.contactId || null,
          recipientEmail: recipient.email,
          status,
          messageId,
          error: errorMsg,
        }
      });

      const processed = i + 1;
      const progressPercent = Math.round((processed / totalRecipients) * 100);

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          processedRecipients: processed,
          successfulRecipients: successCount,
          failedRecipients: failCount,
          progressPercent
        }
      });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: failCount === totalRecipients ? 'FAILED' : (failCount > 0 ? 'COMPLETED' : 'COMPLETED'), // Can add COMPLETED_WITH_ERRORS if needed later
        completedAt: new Date(),
        progressPercent: 100
      }
    });

  } catch (err) {
    console.error("Delivery Engine Error:", err);
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'FAILED', errorMessage: String(err) }
    }).catch(console.error);
  }
}

export async function startQuickEmailDelivery(quickEmailId: string, smtpPassword: string, recipients: any[]) {
  try {
    const email = await prisma.quickEmail.findUnique({
      where: { id: quickEmailId },
      include: { smtpProfile: true }
    });

    if (!email) {
      console.error(`QuickEmail ${quickEmailId} not found.`);
      return;
    }

    const totalRecipients = recipients.length;

    await prisma.quickEmail.update({
      where: { id: quickEmailId },
      data: {
        status: 'SENDING',
        totalRecipients,
        startedAt: new Date(),
        processedRecipients: 0,
        successfulRecipients: 0,
        failedRecipients: 0,
        progressPercent: 0
      }
    });

    if (totalRecipients === 0) {
      await prisma.quickEmail.update({
        where: { id: quickEmailId },
        data: { status: 'COMPLETED', completedAt: new Date(), progressPercent: 100 }
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: email.smtpProfile.host,
      port: email.smtpProfile.port,
      secure: email.smtpProfile.port === 465,
      auth: {
        user: email.smtpProfile.username,
        pass: smtpPassword,
      },
      tls: { rejectUnauthorized: false }
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < totalRecipients; i++) {
      const recipient = recipients[i];

      try {
        await transporter.sendMail({
          from: `"${email.smtpProfile.senderName}" <${email.smtpProfile.senderEmail}>`,
          to: recipient.email,
          subject: email.subject,
          html: email.body,
        });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to send quick email to ${recipient.email}:`, err);
        failCount++;

        if (err.responseCode === 535 || err.code === 'ECONNREFUSED') {
          // Critical SMTP failure, abort remaining
          await prisma.quickEmail.update({
            where: { id: quickEmailId },
            data: {
              status: 'FAILED',
              errorMessage: `Critical SMTP Error: ${err.message}`,
              completedAt: new Date(),
            }
          });
          return;
        }
      }

      const processed = i + 1;
      const progressPercent = Math.round((processed / totalRecipients) * 100);

      await prisma.quickEmail.update({
        where: { id: quickEmailId },
        data: {
          processedRecipients: processed,
          successfulRecipients: successCount,
          failedRecipients: failCount,
          progressPercent
        }
      });
    }

    await prisma.quickEmail.update({
      where: { id: quickEmailId },
      data: {
        status: failCount === totalRecipients ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        progressPercent: 100
      }
    });

  } catch (err) {
    console.error("Delivery Engine Error (QuickEmail):", err);
    await prisma.quickEmail.update({
      where: { id: quickEmailId },
      data: { status: 'FAILED', errorMessage: String(err) }
    }).catch(console.error);
  }
}
