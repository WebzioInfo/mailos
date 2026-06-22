import Link from "next/link";
import { Plus, Users } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ContactsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const contacts = await prisma.contact.findMany({ 
    where: { workspaceId: session.workspaceId },
    take: 10 
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your audience, groups, and tags.</p>
        </div>
        <Link href="/contacts/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Link>
      </div>

      <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-zinc-900 border-b text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">First Name</th>
              <th className="px-6 py-3 font-medium">Last Name</th>
              <th className="px-6 py-3 font-medium">Added</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-3 opacity-20" />
                  No contacts found. Get started by importing a CSV or adding one manually.
                </td>
              </tr>
            ) : (
              contacts.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4 font-medium">{contact.email}</td>
                  <td className="px-6 py-4">{contact.firstName || '-'}</td>
                  <td className="px-6 py-4">{contact.lastName || '-'}</td>
                  <td className="px-6 py-4">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/send-email?email=${encodeURIComponent(contact.email)}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-primary transition-colors"
                        title="Send Email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      </Link>
                      <Link 
                        href={`/contacts/${contact.id}/edit`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Contact"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </Link>
                      <form action={async () => {
                        'use server';
                        const { deleteContact } = await import('@/modules/contacts/actions');
                        await deleteContact(contact.id);
                      }}>
                        <button 
                          type="submit"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Contact"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
