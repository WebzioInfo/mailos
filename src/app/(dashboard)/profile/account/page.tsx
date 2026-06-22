import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountClient from "./client";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { profile: true }
  });

  if (!user) redirect('/login');

  return <AccountClient initialData={user} />;
}
