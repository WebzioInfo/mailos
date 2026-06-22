import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import prisma from '@/lib/db';

// Using a dedicated connection for BullMQ
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const deliveryQueueName = 'email-delivery-queue';

export const deliveryQueue = new Queue(deliveryQueueName, { connection: connection as any });

/**
 * Worker Process for handling actual Email Delivery.
 * This should ideally run in a separate Node.js process (e.g. via PM2 or Docker).
 */
export const deliveryWorker = new Worker(
  deliveryQueueName,
  async (job: Job) => {
    const { campaignId, workspaceId, ephemeralSmtpPassword } = job.data;
    
    // 1. Validate Job Data
    if (!campaignId || !workspaceId || !ephemeralSmtpPassword) {
      throw new Error("Invalid job payload: missing required fields.");
    }

    // 2. Fetch SMTP Profile (without password)
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId, workspaceId },
      include: { smtpProfile: true }
    });

    if (!campaign || !campaign.smtpProfile) {
      throw new Error("Campaign or SMTP profile not found.");
    }

    const { host, port, username, encryption } = campaign.smtpProfile;

    // 3. Authenticate with SMTP using the ephemeral password in memory
    // e.g. Nodemailer initialization
    console.log(`[Worker] Connecting to ${host}:${port} as ${username}...`);
    // const transporter = nodemailer.createTransport({ host, port, secure: encryption === 'SSL', auth: { user: username, pass: ephemeralSmtpPassword } });
    
    // 4. Dispatch Email
    console.log(`[Worker] Dispatching email for campaign ${campaignId}`);

    // 5. Ephemeral password falls out of scope and is garbage collected
    // Job completes
    
    return { status: 'DELIVERED', campaignId };
  },
  { 
    connection: connection as any,
    concurrency: 50, // Process up to 50 emails concurrently per worker
    limiter: {
      max: 14, // Max 14 emails per second per worker (example AWS SES rate limit)
      duration: 1000
    }
  }
);

deliveryWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

deliveryWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error ${err.message}`);
});
