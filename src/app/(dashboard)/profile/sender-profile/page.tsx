import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SenderProfileClient from "./client";
import { getSenderProfile } from "@/modules/profile/actions";

export default async function SenderProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');

  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const profile = await getSenderProfile(session.workspaceId as string);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sender Profile</h1>
        <p className="text-muted-foreground mt-1">Configure your global sender identity and brand settings.</p>
      </div>
      <SenderProfileClient initialData={profile || {}} />
    </div>
  );
}
