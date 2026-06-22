import { Meilisearch } from 'meilisearch';
import prisma from '@/lib/db';

const client = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
});

/**
 * Sync Contacts to Meilisearch Index for ultra-fast CRM searches.
 */
export async function syncContactsToSearch(workspaceId: string) {
  const indexUid = `contacts_${workspaceId}`;
  
  // Ensure index exists
  await client.createIndex(indexUid, { primaryKey: 'id' });
  const index = client.index(indexUid);

  // Fetch all contacts (In production, process in chunks)
  const contacts = await prisma.contact.findMany({
    where: { workspaceId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      attributes: true,
      createdAt: true
    }
  });

  // Push to Meilisearch
  if (contacts.length > 0) {
    const task = await index.addDocuments(contacts);
    console.log(`[Meilisearch] Queued sync for workspace ${workspaceId}: Task ${task.taskUid}`);
  }
}

/**
 * Search Contacts
 */
export async function searchContacts(workspaceId: string, query: string) {
  const indexUid = `contacts_${workspaceId}`;
  const index = client.index(indexUid);
  
  return await index.search(query, { limit: 50 });
}
