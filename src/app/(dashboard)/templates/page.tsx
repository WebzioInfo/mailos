import Link from "next/link";
import { Plus, LayoutTemplate } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function TemplatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const templates = await prisma.template.findMany({ 
    where: { workspaceId: session.workspaceId },
    take: 10 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">Design and manage your email templates with the drag-and-drop builder.</p>
        </div>
        <Link href="/templates/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-3 p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
            <LayoutTemplate className="h-8 w-8 mb-3 opacity-20" />
            <p>No templates created yet.</p>
          </div>
        ) : (
          templates.map((tpl: any) => (
            <div key={tpl.id} className="border rounded-xl p-4 bg-background shadow-sm hover:shadow transition-shadow">
              <div className="aspect-video bg-white rounded-lg mb-4 overflow-hidden relative border border-slate-200 dark:border-zinc-800">
                <div className="w-[400%] h-[400%] absolute top-0 left-0 origin-top-left pointer-events-none" style={{ transform: 'scale(0.25)' }}>
                  <iframe 
                    className="w-full h-full border-none bg-white"
                    srcDoc={tpl.html}
                    title={`${tpl.name} Preview`}
                    sandbox="allow-same-origin"
                    scrolling="no"
                    tabIndex={-1}
                  />
                </div>
              </div>
              <h3 className="font-semibold">{tpl.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Updated {new Date(tpl.updatedAt).toLocaleDateString()}</p>
                <div className="flex items-center gap-3">
                  <Link href={`/templates/${tpl.id}/edit`} className="text-xs text-primary font-medium hover:underline">
                    Edit
                  </Link>
                  <DeleteButton 
                    itemType="Template"
                    itemName={tpl.name}
                    iconOnly={true}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    onDelete={async () => {
                      'use server';
                      const { deleteTemplate } = await import('@/modules/templates/actions');
                      await deleteTemplate(tpl.id);
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
