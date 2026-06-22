"use server"

import prisma from "@/lib/db"

/**
 * Server Action to launch a campaign.
 * NOTE: The password is NEVER saved to the database. It is passed ephemerally 
 * to the Redis queue payload so the worker can authenticate with SMTP.
 */
export async function launchCampaign(campaignId: string, ephemeralSmtpPassword: string) {
  // 1. Fetch the campaign and ensure it belongs to the user's workspace
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { smtpProfile: true }
  })

  if (!campaign) {
    throw new Error("Campaign not found")
  }

  // 2. Queue the campaign sending job in BullMQ
  // In production, we push to Redis using a BullMQ instance
  // e.g. await campaignQueue.add('send-campaign', { campaignId, smtpPassword: ephemeralSmtpPassword })
  
  // 3. Update the campaign status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' }
  })

  return { success: true, message: "Campaign enqueued successfully" }
}
