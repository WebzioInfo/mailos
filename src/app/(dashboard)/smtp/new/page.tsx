'use client';

import Link from "next/link";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSmtpProfile } from "@/modules/smtp/actions";
import { useState } from "react";
import { toast } from "sonner";

const smtpSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  host: z.string().min(1, "SMTP host is required"),
  port: z.number().min(1, "Valid port is required"),
  username: z.string().min(1, "SMTP username is required"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Valid sender email is required"),
  encryption: z.enum(["TLS", "SSL", "STARTTLS", "NONE"]),
});

type SmtpFormValues = z.infer<typeof smtpSchema>;

export default function NewSmtpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      name: "",
      host: "",
      port: 587,
      username: "",
      senderName: "",
      senderEmail: "",
      encryption: "TLS",
    }
  });

  const onSubmit = async (data: SmtpFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value.toString()));

    const result = await createSmtpProfile({}, formData);
    
    if (result && result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.error("Please check the form for errors.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/smtp" className="p-2 border rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add SMTP Profile</h1>
          <p className="text-muted-foreground">Configure your outgoing email provider.</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-lg p-4 flex gap-3 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-300">
        <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Zero-Trust Security Policy</h4>
          <p className="text-xs mt-1">
            Webzio MailOS operates on a zero-trust architecture. We will <strong>NEVER</strong> ask for or store your SMTP password in our database. You will only provide your password momentarily in memory right before you launch a campaign.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border rounded-xl p-8 bg-background shadow-sm">
        {serverError && (
          <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm font-medium">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Profile Details</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Name</label>
            <input 
              {...register("name")}
              type="text"
              placeholder="e.g. Amazon SES - Main"
              className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Sender Name</label>
              <input 
                {...register("senderName")}
                type="text"
                placeholder="Webzio Support"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.senderName && <p className="text-xs text-red-500 mt-1">{errors.senderName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Sender Email</label>
              <input 
                {...register("senderEmail")}
                type="email"
                placeholder="hello@webzio.com"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.senderEmail && <p className="text-xs text-red-500 mt-1">{errors.senderEmail.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg border-b pb-2">SMTP Connection</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">SMTP Host</label>
              <input 
                {...register("host")}
                type="text"
                placeholder="email-smtp.us-east-1.amazonaws.com"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.host && <p className="text-xs text-red-500 mt-1">{errors.host.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <input 
                {...register("port", { valueAsNumber: true })}
                type="number"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.port && <p className="text-xs text-red-500 mt-1">{errors.port.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Username</label>
              <input 
                {...register("username")}
                type="text"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Encryption</label>
              <select 
                {...register("encryption")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="TLS">TLS</option>
                <option value="STARTTLS">STARTTLS</option>
                <option value="SSL">SSL</option>
                <option value="NONE">None</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-4">
          <Link href="/smtp" className="h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
