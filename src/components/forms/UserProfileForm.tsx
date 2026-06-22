"use client"

import { useTransition } from "react"
import { updateUserProfile } from "@/modules/auth/actions/profile"

export function UserProfileForm({ userId, initialData }: { userId: string, initialData?: any }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateUserProfile(userId, formData);
      // add toast success here
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200 dark:border-zinc-800">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-primary">Webzio Sender Identity</h2>
        <p className="text-sm text-slate-500 mb-6">Manage how you appear to your recipients across all Webzio MailOS campaigns.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Sender Name</label>
            <input name="defaultSenderName" defaultValue={initialData?.defaultSenderName} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g. John from Webzio" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Sender Email</label>
            <input name="defaultSenderEmail" type="email" defaultValue={initialData?.defaultSenderEmail} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="john@webziointernational.in" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-primary">Brand Kit</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" name="brandPrimaryColor" defaultValue={initialData?.brandPrimaryColor || "#2D151F"} className="h-8 w-8 rounded cursor-pointer" />
              <input type="text" readOnly value={initialData?.brandPrimaryColor || "#2D151F"} className="border rounded-md px-3 py-1 text-sm w-24 bg-slate-50 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Secondary Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" name="brandSecondaryColor" defaultValue={initialData?.brandSecondaryColor || "#F4F3DC"} className="h-8 w-8 rounded cursor-pointer" />
              <input type="text" readOnly value={initialData?.brandSecondaryColor || "#F4F3DC"} className="border rounded-md px-3 py-1 text-sm w-24 bg-slate-50 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-primary">Email Footers & Signatures</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Signature</label>
            <textarea name="signature" defaultValue={initialData?.signature} className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]" placeholder="Best regards,&#10;John Doe&#10;CEO, Webzio International" />
          </div>
        </div>
      </div>

      <button disabled={isPending} type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
        {isPending ? "Saving Profile..." : "Save Identity Settings"}
      </button>
    </form>
  )
}
