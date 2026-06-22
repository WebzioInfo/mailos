'use client';

import { useState } from "react";
import { Save, User, Building2, Phone, Globe, Palette, PenTool, Hash, Type } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertSenderProfile } from "@/modules/profile/actions";
import { toast } from "sonner";

const senderSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Valid sender email is required"),
  replyToEmail: z.string().email("Valid reply-to email is required").or(z.literal('')),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").or(z.literal('')),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal('')),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color like #FF0000").or(z.literal('')),
  signature: z.string().optional(),
  footer: z.string().optional(),
});

type FormValues = z.infer<typeof senderSchema>;

export default function SenderProfileClient({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(senderSchema),
    defaultValues: { 
      senderName: initialData?.senderName || "", 
      senderEmail: initialData?.senderEmail || "",
      replyToEmail: initialData?.replyToEmail || "",
      companyName: initialData?.companyName || "",
      designation: initialData?.designation || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      logoUrl: initialData?.logoUrl || "",
      brandColor: initialData?.brandColor || "#33BCAD",
      signature: initialData?.signature || "",
      footer: initialData?.footer || "",
    }
  });

  const previewValues = watch();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || '');
    });

    const result = await upsertSenderProfile({}, formData);
    if (result?.error) toast.error(result.error);
    else toast.success("Sender Profile saved securely!");
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div className="space-y-6">
        <form id="sender-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2"><User className="w-5 h-5"/> Basic Info</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Sender Name *</label>
                <input {...register("senderName")} className="w-full h-10 px-3 border rounded-md" placeholder="John Doe" />
                {errors.senderName && <p className="text-xs text-red-500 mt-1">{errors.senderName.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Sender Email *</label>
                <input {...register("senderEmail")} className="w-full h-10 px-3 border rounded-md" placeholder="john@company.com" />
                {errors.senderEmail && <p className="text-xs text-red-500 mt-1">{errors.senderEmail.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Reply-To Email</label>
                <input {...register("replyToEmail")} className="w-full h-10 px-3 border rounded-md" placeholder="support@company.com" />
                {errors.replyToEmail && <p className="text-xs text-red-500 mt-1">{errors.replyToEmail.message}</p>}
              </div>
            </div>
          </div>

          <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Building2 className="w-5 h-5"/> Professional Details</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name</label>
                <input {...register("companyName")} className="w-full h-10 px-3 border rounded-md" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Designation</label>
                <input {...register("designation")} className="w-full h-10 px-3 border rounded-md" placeholder="CEO" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</label>
                <input {...register("phone")} className="w-full h-10 px-3 border rounded-md" placeholder="+1 555 0199" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Globe className="w-3 h-3"/> Website</label>
                <input {...register("website")} className="w-full h-10 px-3 border rounded-md" placeholder="https://acme.com" />
                {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>}
              </div>
            </div>
          </div>

          <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Palette className="w-5 h-5"/> Branding & Identity</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Brand Logo URL</label>
                <input {...register("logoUrl")} className="w-full h-10 px-3 border rounded-md" placeholder="https://yourdomain.com/logo.png" />
                {errors.logoUrl && <p className="text-xs text-red-500 mt-1">{errors.logoUrl.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Hash className="w-3 h-3"/> Brand Color (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" {...register("brandColor")} className="h-10 w-12 cursor-pointer border rounded-md p-1" />
                  <input {...register("brandColor")} className="flex-1 h-10 px-3 border rounded-md font-mono" placeholder="#33BCAD" />
                </div>
                {errors.brandColor && <p className="text-xs text-red-500 mt-1">{errors.brandColor.message}</p>}
              </div>
              <div className="col-span-2 pt-4">
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><PenTool className="w-3 h-3"/> Email Signature (HTML)</label>
                <textarea {...register("signature")} className="w-full h-24 px-3 py-2 border rounded-md font-mono text-xs" placeholder="Best regards,<br/><b>John Doe</b>" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Type className="w-3 h-3"/> Email Footer (HTML)</label>
                <textarea {...register("footer")} className="w-full h-24 px-3 py-2 border rounded-md font-mono text-xs" placeholder="&copy; 2026 Acme Corp. All rights reserved." />
              </div>
            </div>
          </div>

        </form>

        <div className="flex justify-end pt-4 border-t">
          <button disabled={isSubmitting} type="submit" form="sender-form" className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-sm hover:bg-primary/90 transition-all shadow-md">
            <Save className="w-4 h-4" /> Save Sender Profile
          </button>
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="relative">
        <div className="sticky top-6">
          <h3 className="font-semibold text-lg mb-4 text-muted-foreground flex items-center gap-2">Live Preview</h3>
          <div className="bg-white border rounded-xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            
            {/* Mock Client Header */}
            <div className="bg-slate-100 border-b px-4 py-3 flex gap-4 text-sm items-center">
              <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-500">
                {previewValues.senderName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-black">{previewValues.senderName || 'Sender Name'}</div>
                <div className="text-slate-500 text-xs">to me <span className="opacity-50 mx-1">•</span> just now</div>
              </div>
            </div>

            {/* Email Body Preview */}
            <div className="flex-1 p-8 bg-[#f8fafc]">
              <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
                
                {/* Logo Area */}
                {previewValues.logoUrl && (
                  <div className="p-6 border-b text-center" style={{ backgroundColor: previewValues.brandColor || 'transparent' }}>
                    <img src={previewValues.logoUrl} alt="Logo" className="max-h-12 mx-auto object-contain bg-white/20 p-2 rounded" />
                  </div>
                )}

                <div className="p-8">
                  <div className="w-3/4 h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="w-full h-3 bg-slate-100 rounded mb-2"></div>
                  <div className="w-full h-3 bg-slate-100 rounded mb-2"></div>
                  <div className="w-5/6 h-3 bg-slate-100 rounded mb-8"></div>
                  
                  {/* Signature Area */}
                  {previewValues.signature ? (
                    <div className="mt-8 pt-6 border-t" dangerouslySetInnerHTML={{ __html: previewValues.signature }}></div>
                  ) : (
                    <div className="mt-8 pt-6 border-t text-sm text-slate-700">
                      <p className="font-bold" style={{ color: previewValues.brandColor || '#000' }}>{previewValues.senderName || 'Your Name'}</p>
                      <p>{previewValues.designation}</p>
                      <p>{previewValues.companyName}</p>
                      <p className="mt-2 text-xs">{previewValues.phone}</p>
                      <p className="text-xs">{previewValues.website}</p>
                    </div>
                  )}
                </div>

                {/* Footer Area */}
                <div className="p-6 bg-slate-50 border-t text-center text-xs text-slate-500">
                  {previewValues.footer ? (
                    <div dangerouslySetInnerHTML={{ __html: previewValues.footer }}></div>
                  ) : (
                    <>
                      <p>{previewValues.companyName}</p>
                      <p>This email was sent to you because you are subscribed.</p>
                    </>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
