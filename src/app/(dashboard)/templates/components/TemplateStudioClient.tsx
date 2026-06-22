'use client';

import { useState } from "react";
import { Save, Code, Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createTemplate, updateTemplate } from "@/modules/templates/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  html: z.string().min(10, "Template must contain at least 10 characters of HTML"),
});

type FormValues = z.infer<typeof templateSchema>;

export default function TemplateStudioClient({ initialData }: { initialData?: { id?: string, name: string, html: string } }) {
  const router = useRouter();
  const [view, setView] = useState<'code' | 'preview'>('code');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: initialData?.name || "", html: initialData?.html || "" }
  });

  const htmlContent = watch('html');
  const isEditing = !!initialData?.id;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('html', data.html);

    let result;
    if (isEditing) {
      result = await updateTemplate(initialData!.id!, {}, formData);
    } else {
      result = await createTemplate({}, formData);
    }

    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success(isEditing ? "Template updated securely!" : "Template compiled and saved securely!");
      router.push('/templates');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-6rem)] -m-8">
      {/* Top Bar */}
      <div className="h-16 border-b bg-background flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="p-2 hover:bg-accent rounded-md transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <input 
            {...register("name")}
            placeholder="Template Name..."
            className="h-10 bg-transparent border-none text-lg font-semibold focus:outline-none focus:ring-0 placeholder:text-muted-foreground w-64"
          />
          {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg mr-4">
            <button type="button" onClick={() => setView('code')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'code' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Code className="h-4 w-4" /> Code
            </button>
            <button type="button" onClick={() => setView('preview')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Layout className="h-4 w-4" /> Preview
            </button>
          </div>
          <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {isEditing ? "Update Template" : "Save Template"}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-muted/30 overflow-hidden relative">
        {view === 'code' ? (
          <textarea
            {...register("html")}
            className="w-full h-full p-6 font-mono text-sm resize-none bg-zinc-950 text-emerald-400 focus:outline-none focus:ring-0"
            spellCheck={false}
          />
        ) : (
          <div className="w-full h-full flex justify-center p-8 overflow-auto">
            <iframe 
              className="w-full bg-white shadow-xl rounded-xl min-h-[600px] border overflow-hidden"
              srcDoc={htmlContent}
              title="Template Preview"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </form>
  );
}
