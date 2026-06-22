'use client';

import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateSecurity } from "@/modules/profile/actions";
import { useState } from "react";
import { toast } from "sonner";

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type FormValues = z.infer<typeof securitySchema>;

export default function SecurityPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "" }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('currentPassword', data.currentPassword);
    formData.append('newPassword', data.newPassword);

    const result = await updateSecurity({}, formData);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Password updated successfully");
      reset();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Security Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your password and authentication methods.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-6 bg-background shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Password</label>
          <input 
            {...register("currentPassword")}
            type="password" 
            placeholder="••••••••"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <input 
            {...register("newPassword")}
            type="password" 
            placeholder="••••••••"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button disabled={isSubmitting} type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" /> Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
