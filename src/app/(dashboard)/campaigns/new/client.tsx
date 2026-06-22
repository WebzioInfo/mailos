'use client';

import { useState } from "react";
import { Send, Save, ArrowLeft, Rocket, CalendarClock, Users, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/modules/campaigns/actions";
import { EnterpriseAudienceBuilder } from "@/components/modules/campaigns/EnterpriseAudienceBuilder";
import { SmtpAuthDialog } from "@/components/modules/smtp/SmtpAuthDialog";

export default function CampaignWizardClient({ templates, smtpProfiles, contacts, lists, tags }: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [smtpProfileId, setSmtpProfileId] = useState("");

  // Audience State
  const [audienceConfig, setAudienceConfig] = useState<any>({
    selectAllContacts: false,
    includedLists: [],
    includedTags: [],
    manualEmails: [],
  });

  const nextStep = () => {
    if (step === 1) {
      if (!name || !subject || !templateId || !smtpProfileId) {
        return toast.error("Please fill all required details first.");
      }
    }
    if (step === 2) {
      const hasRecipients = audienceConfig.selectAllContacts || 
                            (audienceConfig.manualEmails?.length || 0) > 0 || 
                            (audienceConfig.includedLists?.length || 0) > 0 || 
                            (audienceConfig.includedTags?.length || 0) > 0 ||
                            (audienceConfig.includedContacts?.length || 0) > 0;
      if (!hasRecipients) {
        return toast.error("Please select at least one recipient.");
      }
    }
    if (step === 3) {
      // jump from 3 (Preview) to 4 (Launch) because Schedule was removed
      setStep(4);
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handlePreLaunch = () => {
    setShowAuthDialog(true);
  };

  const onSubmit = async (status: 'DRAFT' | 'SCHEDULED' | 'SENDING', finalProfileId?: string, finalPassword?: string) => {
    if (status === 'SENDING' && (!finalProfileId || !finalPassword)) {
      throw new Error("SMTP Password is required to launch the campaign securely.");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('subject', subject);
    formData.append('templateId', templateId);
    formData.append('smtpProfileId', finalProfileId || smtpProfileId);
    formData.append('status', status);
    formData.append('audience', JSON.stringify(audienceConfig));
    if (status === 'SENDING') {
      formData.append('smtpPassword', finalPassword as string);
    }

    const result = await createCampaign({}, formData);
    if (result?.error) {
      setIsSubmitting(false);
      throw new Error(result.error);
    } 

    if (status === 'DRAFT' || status === 'SCHEDULED') {
      toast.success("Draft Saved!");
      router.push('/campaigns');
      return;
    }

    if (status === 'SENDING') {
      setShowAuthDialog(false);
      toast.success("Campaign Queued for Delivery!");
      router.push('/campaigns');
    }
  };

  const executeSend = async (profileId: string, password: string) => {
    await onSubmit('SENDING', profileId, password);
  };

  const getRecipientSummary = () => {
    if (audienceConfig.totalRecipients !== undefined) {
      return `${audienceConfig.totalRecipients} exact recipient(s)`;
    }
    // Fallback if not calculated yet
    return `0 recipient(s)`;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={step === 1 ? () => router.push('/campaigns') : prevStep} className="p-2 border rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
          <p className="text-muted-foreground mt-1">Step {step} of 4</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground">
        <span className={step >= 1 ? 'text-primary' : ''}>1. Details</span>
        <span className="opacity-50">&rsaquo;</span>
        <span className={step >= 2 ? 'text-primary' : ''}>2. Audience</span>
        <span className="opacity-50">&rsaquo;</span>
        <span className={step >= 3 ? 'text-primary' : ''}>3. Preview</span>
        <span className="opacity-50">&rsaquo;</span>
        <span className={step === 4 ? 'text-primary' : ''}>4. Launch</span>
      </div>

      <div className="border rounded-xl bg-background shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold border-b pb-4">Campaign Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Campaign Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Summer Sale 2026" className="w-full h-10 px-3 border rounded-md text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Subject Line *</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Don't miss out on these deals..." className="w-full h-10 px-3 border rounded-md text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select HTML Template *</label>
                <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full h-10 px-3 border rounded-md text-sm">
                  <option value="">-- Choose Template --</option>
                  {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select SMTP Delivery Profile *</label>
                <select value={smtpProfileId} onChange={e => setSmtpProfileId(e.target.value)} className="w-full h-10 px-3 border rounded-md text-sm">
                  <option value="">-- Choose Sender --</option>
                  {smtpProfiles.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.senderEmail})</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold border-b pb-4">Target Audience</h2>
              <EnterpriseAudienceBuilder 
                contacts={contacts || []}
                lists={lists || []} 
                tags={tags || []} 
                initialSelections={audienceConfig}
                onChange={setAudienceConfig} 
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold border-b pb-4">Preview & Summary</h2>
              <div className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-xl space-y-4 border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs uppercase font-semibold">Campaign Name</span>
                    <p className="font-medium">{name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs uppercase font-semibold">Subject Line</span>
                    <p className="font-medium">{subject}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs uppercase font-semibold">Template Selected</span>
                    <p className="font-medium">{templates.find((t: any) => t.id === templateId)?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-xs uppercase font-semibold">Audience Size</span>
                    <p className="font-medium text-primary">{getRecipientSummary()}</p>
                  </div>
                </div>
              </div>
              {audienceConfig.resolvedRecipients && audienceConfig.resolvedRecipients.length > 0 && (
                <div className="border rounded-xl p-4 bg-background">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Selected Recipients Preview</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded p-4 bg-slate-50 dark:bg-zinc-900">
                    {audienceConfig.resolvedRecipients.slice(0, 20).map((r: any, i: number) => (
                      <div key={i} className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                        {r.name && <div className="font-medium">{r.name}</div>}
                        <div className="text-muted-foreground">{r.email}</div>
                      </div>
                    ))}
                    {audienceConfig.resolvedRecipients.length > 20 && (
                      <div className="text-xs text-muted-foreground text-center pt-2">
                        + {audienceConfig.resolvedRecipients.length - 20} more recipients
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border rounded-xl p-4 bg-background">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4"/> Template Content Preview</h3>
                <div className="p-4 border rounded bg-slate-50 overflow-hidden h-64 text-xs font-mono text-muted-foreground">
                   {templates.find((t: any) => t.id === templateId)?.html?.substring(0, 500)}...
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready for Liftoff</h2>
              <p className="text-muted-foreground max-w-md text-center mb-8">
                You are about to launch <span className="font-semibold text-foreground">"{name}"</span> securely to <span className="font-semibold text-foreground">{getRecipientSummary()}</span>.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-sm max-w-md text-center">
                To launch this campaign securely, you will need to authenticate with your SMTP Provider. Click the Launch button below to proceed.
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 dark:bg-zinc-900/50 flex justify-between">
          <button 
            disabled={isSubmitting} 
            onClick={() => {
              onSubmit('DRAFT').catch(e => toast.error(e.message));
            }}
            className="h-10 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-muted-foreground disabled:opacity-50"
          >
            Save as Draft
          </button>
          
          <div className="flex gap-3">
            {step < 4 ? (
              <button onClick={nextStep} className="h-10 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                Next Step
              </button>
            ) : (
              <button 
                disabled={isSubmitting} 
                onClick={handlePreLaunch}
                className="h-10 px-8 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4"/> Launch Campaign Now
              </button>
            )}
          </div>
        </div>
      </div>

      <SmtpAuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        smtpProfiles={smtpProfiles}
        defaultProfileId={smtpProfileId}
        onConfirm={executeSend}
        title="Launch Campaign"
      />
    </div>
  );
}
