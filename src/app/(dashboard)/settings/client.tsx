'use client';

import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateWorkspaceSettings } from "@/modules/settings/actions";
import { useState } from "react";
import { toast } from "sonner";

const workspaceSettingsSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

type FormValues = z.infer<typeof workspaceSettingsSchema>;

export default function SettingsClient({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: { 
      workspaceName: initialData?.name || "", 
      timezone: initialData?.settings?.timezone || "UTC",
      language: initialData?.settings?.language || "en",
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('workspaceName', data.workspaceName);
    if (data.timezone) formData.append('timezone', data.timezone);
    if (data.language) formData.append('language', data.language);

    const result = await updateWorkspaceSettings({}, formData);
    if (result.error) toast.error(result.error);
    else toast.success("Workspace settings updated successfully");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global preferences for this workspace.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-6 bg-background shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Workspace Name</label>
          <input 
            {...register("workspaceName")}
            type="text" 
            placeholder="My Workspace"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.workspaceName && <p className="text-xs text-red-500">{errors.workspaceName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Timezone</label>
          <select 
            {...register("timezone")}
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Chicago">Central Time (US & Canada)</option>
            <option value="America/Denver">Mountain Time (US & Canada)</option>
            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Kolkata">India Standard Time</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Default Language</label>
          <select 
            {...register("language")}
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button disabled={isSubmitting} type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
