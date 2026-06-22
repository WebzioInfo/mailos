'use client';

import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateAccount } from "@/modules/profile/actions";
import { useState } from "react";
import { toast } from "sonner";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().optional(),
});

type FormValues = z.infer<typeof accountSchema>;

export default function AccountClient({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { 
      name: initialData?.name || "", 
      companyName: initialData?.profile?.companyName || "" 
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.companyName) formData.append('companyName', data.companyName);

    const result = await updateAccount({}, formData);
    if (result.error) toast.error(result.error);
    else toast.success("Account updated successfully");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Account Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your personal profile information.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-6 bg-background shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <input 
            {...register("name")}
            type="text" 
            placeholder="John Doe"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name</label>
          <input 
            {...register("companyName")}
            type="text" 
            placeholder="Webzio International"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input 
            type="email" 
            disabled
            value={initialData?.email || ""}
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly for security reasons.</p>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button disabled={isSubmitting} type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
