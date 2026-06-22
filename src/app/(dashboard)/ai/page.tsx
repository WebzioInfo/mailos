'use client';

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateAiContent } from "@/modules/ai/actions";
import { toast } from "sonner";

const aiSchema = z.object({
  prompt: z.string().min(5, "Prompt is required"),
  type: z.enum(["SUBJECT", "CONTENT", "NEWSLETTER"]),
});

type FormValues = z.infer<typeof aiSchema>;

export default function AiStudioPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(aiSchema),
    defaultValues: { prompt: "", type: "SUBJECT" }
  });

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    setResponse(null);
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('type', data.type);

    const result = await generateAiContent({}, formData);
    if (result.error) toast.error(result.error);
    else if (result.text) {
      setResponse(result.text);
      toast.success("Content generated successfully!");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Content Studio</h1>
        <p className="text-muted-foreground mt-1">Generate high-converting subject lines and email copy instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="border rounded-xl p-6 bg-background shadow-sm h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Generation Type</label>
              <select 
                {...register("type")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              >
                <option value="SUBJECT">Subject Lines</option>
                <option value="CONTENT">Email Body Content</option>
                <option value="NEWSLETTER">Full Newsletter</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt / Topic</label>
              <textarea 
                {...register("prompt")}
                placeholder="Describe your email topic (e.g., 'A 20% off black friday sale for returning customers')"
                className="w-full h-32 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.prompt && <p className="text-xs text-red-500">{errors.prompt.message}</p>}
            </div>

            <button disabled={isGenerating} type="submit" className="w-full inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {isGenerating ? (
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-pulse" /> Generating...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate Magic</span>
              )}
            </button>
          </form>
        </div>

        {/* Output Area */}
        <div className="border rounded-xl p-6 bg-slate-50 dark:bg-zinc-900 shadow-inner h-full min-h-[400px] flex flex-col relative">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
            <h3 className="text-sm font-medium">Generated Output</h3>
            {response && (
              <button onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto whitespace-pre-wrap text-sm leading-relaxed">
            {response ? (
              response
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Sparkles className="h-12 w-12 mb-4" />
                <p>Output will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
