'use client';

import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateBranding } from "@/modules/profile/actions";
import { useState } from "react";
import { toast } from "sonner";

const brandingSchema = z.object({
  brandPrimaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  brandLogoUrl: z.string().url("Must be a valid URL").or(z.literal('')),
});

type FormValues = z.infer<typeof brandingSchema>;

export default function BrandingClient({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { 
      brandPrimaryColor: initialData?.profile?.brandPrimaryColor || "#2D151F", 
      brandLogoUrl: initialData?.profile?.brandLogoUrl || "" 
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('brandPrimaryColor', data.brandPrimaryColor);
    if (data.brandLogoUrl) formData.append('brandLogoUrl', data.brandLogoUrl);

    const result = await updateBranding({}, formData);
    if (result.error) toast.error(result.error);
    else toast.success("Branding updated successfully");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Brand Assets</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload your logo and define your brand colors.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-6 bg-background shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Brand Hex Color</label>
          <div className="flex gap-4">
            <input 
              {...register("brandPrimaryColor")}
              type="color" 
              className="h-10 w-20 border border-input rounded-md cursor-pointer"
            />
            <input 
              {...register("brandPrimaryColor")}
              type="text" 
              className="flex-1 h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase font-mono"
            />
          </div>
          {errors.brandPrimaryColor && <p className="text-xs text-red-500">{errors.brandPrimaryColor.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Footer Logo URL</label>
          <input 
            {...register("brandLogoUrl")}
            type="url" 
            placeholder="https://example.com/logo.png"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.brandLogoUrl && <p className="text-xs text-red-500">{errors.brandLogoUrl.message}</p>}
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button disabled={isSubmitting} type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Save className="mr-2 h-4 w-4" /> Save Branding
          </button>
        </div>
      </form>
    </div>
  );
}
