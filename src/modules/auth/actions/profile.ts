"use server"

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(userId: string, formData: FormData) {
  // In production, validate user session matches userId
  
  const data = {
    companyName: formData.get("companyName") as string,
    jobTitle: formData.get("jobTitle") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    timezone: formData.get("timezone") as string,
    language: formData.get("language") as string,
    defaultSenderName: formData.get("defaultSenderName") as string,
    defaultSenderEmail: formData.get("defaultSenderEmail") as string,
    signature: formData.get("signature") as string,
    brandPrimaryColor: formData.get("brandPrimaryColor") as string || "#2D151F",
    brandSecondaryColor: formData.get("brandSecondaryColor") as string || "#F4F3DC",
    emailFooter: formData.get("emailFooter") as string,
  };

  await prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    }
  });

  revalidatePath("/settings/profile");
  return { success: true };
}
