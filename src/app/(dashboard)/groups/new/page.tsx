'use client';

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createGroup } from "@/modules/groups/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

export default function NewGroupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "" }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);

    const result = await createGroup({}, formData);
    
    if (result && result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Group created successfully!");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/groups" className="p-2 border rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Group</h1>
          <p className="text-muted-foreground">Create a new audience segment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border rounded-xl p-8 bg-background shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Group Name <span className="text-red-500">*</span></label>
          <input 
            {...register("name")}
            type="text"
            placeholder="e.g. VIP Customers"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>}
        </div>

        <div className="pt-4 border-t flex justify-end gap-4">
          <Link href="/groups" className="h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
