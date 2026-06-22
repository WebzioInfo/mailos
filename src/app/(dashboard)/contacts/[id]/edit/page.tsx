import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditContactClient from "./client";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const resolvedParams = await params;

  const contactId = resolvedParams.id;
  if (!contactId) redirect('/contacts');

  const contact = await prisma.contact.findFirst({
    where: { 
      id: contactId,
      workspaceId: session.workspaceId as string
    }
  });

  if (!contact) redirect('/contacts');

  return (
    <div className="p-8 pb-20">
      <EditContactClient contact={contact} />
    </div>
  );
}
