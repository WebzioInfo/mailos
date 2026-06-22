import prisma from '@/lib/db';
import { z } from 'zod';

export interface AudienceConfig {
  selectAllContacts: boolean;
  includedLists: string[];
  includedTags: string[];
  includedContacts?: string[];
  manualEmails: string[];
}

export interface ResolvedAudience {
  totalEmails: number;
  invalidEmails: number;
  duplicateEmails: number;
  finalRecipients: { email: string; contactId?: string }[];
}

const emailSchema = z.string().email();

export async function resolveAudience(workspaceId: string, config: AudienceConfig): Promise<ResolvedAudience> {
  const allEmails = new Map<string, string | undefined>(); // email -> contactId
  let invalidCount = 0;
  let rawCount = 0;

  // 1. Fetch from Database if needed
  if (config.selectAllContacts || (config.includedLists && config.includedLists.length > 0) || (config.includedTags && config.includedTags.length > 0) || (config.includedContacts && config.includedContacts.length > 0)) {
    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId,
        OR: [
          config.selectAllContacts ? {} : undefined,
          config.includedLists && config.includedLists.length > 0 ? { lists: { some: { id: { in: config.includedLists } } } } : undefined,
          config.includedTags && config.includedTags.length > 0 ? { tags: { some: { id: { in: config.includedTags } } } } : undefined,
          config.includedContacts && config.includedContacts.length > 0 ? { id: { in: config.includedContacts } } : undefined,
        ].filter(Boolean) as any[]
      },
      select: { id: true, email: true }
    });

    for (const c of contacts) {
      rawCount++;
      const lower = c.email.toLowerCase().trim();
      if (emailSchema.safeParse(lower).success) {
        allEmails.set(lower, c.id);
      } else {
        invalidCount++;
      }
    }
  }

  // 2. Add Manual Emails
  if (config.manualEmails && config.manualEmails.length > 0) {
    for (const em of config.manualEmails) {
      const lower = em.toLowerCase().trim();
      if (!lower) continue;
      rawCount++;
      if (emailSchema.safeParse(lower).success) {
        if (!allEmails.has(lower)) {
          allEmails.set(lower, undefined); // No contactId associated
        }
      } else {
        invalidCount++;
      }
    }
  }

  const finalRecipients = Array.from(allEmails.entries()).map(([email, contactId]) => ({
    email,
    contactId
  }));

  return {
    totalEmails: rawCount,
    invalidEmails: invalidCount,
    duplicateEmails: rawCount - invalidCount - finalRecipients.length,
    finalRecipients
  };
}
