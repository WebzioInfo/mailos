'use client';

import Link from "next/link";
import { ArrowLeft, Save, Calendar, Globe, Server, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateCampaign } from "@/modules/campaigns/actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdvancedRecipientPicker } from "@/components/modules/campaigns/AdvancedRecipientPicker";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  templateId: z.string().min(1, "Template is required"),
  smtpProfileId: z.string().min(1, "SMTP Profile is required"),
  status: z.enum(["DRAFT", "SCHEDULED", "PAUSED", "ARCHIVED"]),
  scheduledAt: z.string().optional()
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function EditCampaignClient({ campaign, smtpProfiles, templates, contacts, lists, tags }: any) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audienceConfig, setAudienceConfig] = useState<any>(campaign.audience || {});

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign.name || "",
      subject: campaign.subject || "",
      templateId: campaign.templateId || "",
      smtpProfileId: campaign.smtpProfileId || "",
      status: (campaign.status === "SENDING" || campaign.status === "COMPLETED") ? "DRAFT" : campaign.status,
      scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0,16) : ""
    }
  });

  const watchStatus = watch('status');

  // Reconstruct initial selections for AudiencePicker
  const initialSelections = {
    contacts: campaign.audience?.includedContacts ? contacts.filter((c:any) => campaign.audience.includedContacts.includes(c.id)) : [],
    lists: campaign.audience?.includedLists ? lists.filter((l:any) => campaign.audience.includedLists.includes(l.id)) : [],
    tags: campaign.audience?.includedTags ? tags.filter((t:any) => campaign.audience.includedTags.includes(t.id)) : [],
    manualEmails: campaign.audience?.manualEmails || []
  };

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('subject', data.subject);
    formData.append('templateId', data.templateId);
    formData.append('smtpProfileId', data.smtpProfileId);
    formData.append('status', data.status);
    if (data.scheduledAt) formData.append('scheduledAt', new Date(data.scheduledAt).toISOString());
    formData.append('audience', JSON.stringify(audienceConfig));

    const result = await updateCampaign(campaign.id, {}, formData);
    
    if (result && result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Campaign updated successfully!");
      router.push('/campaigns');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/campaigns" className="p-2 border rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign: {campaign.name}</h1>
          <p className="text-muted-foreground">Manage your settings and audience.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Core Settings */}
        <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">Core Details</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Campaign Name *</label>
              <input 
                {...register("name")}
                type="text"
                placeholder="Summer Sale Blast"
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Subject Line *</label>
              <input 
                {...register("subject")}
                type="text"
                placeholder="You don't want to miss this..."
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Template *</label>
              <select 
                {...register("templateId")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-transparent"
              >
                <option value="">Select a template...</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.templateId && <p className="text-xs text-red-500">{errors.templateId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Profile *</label>
              <select 
                {...register("smtpProfileId")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-transparent"
              >
                <option value="">Select an SMTP sender...</option>
                {smtpProfiles.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.senderEmail} ({p.name})</option>
                ))}
              </select>
              {errors.smtpProfileId && <p className="text-xs text-red-500">{errors.smtpProfileId.message}</p>}
            </div>
          </div>
        </div>

        {/* Audience Settings */}
        <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">Recipients</h3>
          </div>
          <div className="p-6">
            <AdvancedRecipientPicker 
              contacts={contacts}
              lists={lists}
              tags={tags}
              initialSelections={initialSelections}
              onChange={(config) => setAudienceConfig(config)}
            />
          </div>
        </div>

        {/* Schedule & Status Settings */}
        <div className="border rounded-xl bg-background shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">Publishing & Status</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Status</label>
              <select 
                {...register("status")}
                className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-transparent"
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {watchStatus === 'SCHEDULED' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Time</label>
                <input 
                  {...register("scheduledAt")}
                  type="datetime-local"
                  className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-4">
          <Link href="/campaigns" className="h-10 px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
