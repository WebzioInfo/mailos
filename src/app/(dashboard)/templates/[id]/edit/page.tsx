import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import TemplateStudioClient from "../../components/TemplateStudioClient";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const template = await prisma.template.findUnique({
    where: { 
      id: id,
      workspaceId: session.workspaceId as string
    }
  });

  if (!template) {
    redirect('/templates');
  }

  return (
    <TemplateStudioClient 
      initialData={{ 
        id: template.id, 
        name: template.name, 
        html: template.html 
      }} 
    />
  );
}
