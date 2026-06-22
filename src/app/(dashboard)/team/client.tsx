'use client';

import { useState } from "react";
import { UserPlus, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { inviteTeamMember } from "@/modules/team/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});

type FormValues = z.infer<typeof inviteSchema>;

export default function TeamClient({ members }: { members: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "VIEWER" }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('role', data.role);

    const result = await inviteTeamMember({}, formData);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Team member invited successfully!");
      reset();
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-1">Manage workspace access and roles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 border rounded-xl bg-background shadow-sm overflow-hidden h-fit">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-zinc-900 border-b text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{m.user.name || "Pending User"}</div>
                        <div className="text-xs text-muted-foreground">{m.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <Shield className="h-3 w-3 text-muted-foreground" /> {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-6 bg-background shadow-sm space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Invite Member
            </h3>
            <p className="text-xs text-muted-foreground">Send an email invitation to collaborate in this workspace.</p>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                {...register("email")}
                type="email" 
                placeholder="colleague@company.com"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace Role</label>
              <select 
                {...register("role")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 mt-2">
              Send Invitation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
