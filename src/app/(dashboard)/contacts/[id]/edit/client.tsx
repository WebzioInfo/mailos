'use client';

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateContact } from "@/modules/contacts/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const contactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function EditContactClient({ contact }: { contact: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: contact.email || "",
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      company: contact.attributes?.company || "",
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    
    const formData = new FormData();
    formData.append('email', data.email);
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.company) formData.append('company', data.company);

    const result = await updateContact(contact.id, {}, formData);
    
    if (result && result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.error("Please check the form for errors.");
      }
      setIsSubmitting(false);
    } else {
      toast.success("Contact updated successfully!");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/contacts" className="p-2 border rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
          <p className="text-muted-foreground">Update subscriber details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border rounded-xl p-8 bg-background shadow-sm">
        {serverError && (
          <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm font-medium">
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
          <input 
            {...register("email")}
            type="email"
            placeholder="john@example.com"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <input 
              {...register("firstName")}
              type="text"
              placeholder="John"
              className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <input 
              {...register("lastName")}
              type="text"
              placeholder="Doe"
              className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <input 
            {...register("company")}
            type="text"
            placeholder="Webzio International"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="pt-4 border-t flex justify-end gap-4">
          <Link href="/contacts" className="h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
