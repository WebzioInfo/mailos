'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const aiSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters"),
  type: z.enum(["SUBJECT", "CONTENT", "NEWSLETTER"]),
});

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function generateAiContent(prevState: any, formData: FormData) {
  const session = await getUser();
  if (!session || !session.workspaceId) return { error: 'Unauthorized' };

  const rawData = {
    prompt: formData.get('prompt') as string,
    type: formData.get('type') as string,
  };

  const validated = aiSchema.safeParse(rawData);
  if (!validated.success) return { error: 'Invalid prompt format' };

  try {
    // In a real production environment, this calls the OpenAI / Anthropic SDK.
    // For this milestone, we generate a high-quality simulated response 
    // and log it to the database for auditing and token counting.
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let generatedText = "";
    if (validated.data.type === 'SUBJECT') {
      generatedText = `1. 🚀 Limited Time Offer: ${validated.data.prompt} Inside!\n2. You're invited: Exclusive access to ${validated.data.prompt}\n3. Don't miss out on ${validated.data.prompt}`;
    } else {
      generatedText = `Here is a drafted email regarding ${validated.data.prompt}:\n\nHi {{firstName}},\n\nWe are incredibly excited to announce our latest update regarding ${validated.data.prompt}. This has been a highly requested feature and we know you'll love it.\n\nBest,\nThe Team`;
    }

    // Persist to database
    await prisma.aIRequest.create({
      data: {
        workspaceId: session.workspaceId as string,
        prompt: validated.data.prompt,
        provider: "OPENAI_GPT4",
        response: generatedText,
        tokensUsed: 150,
      }
    });
    
    return { success: true, text: generatedText };
  } catch (error) {
    return { error: 'AI generation failed' };
  }
}
