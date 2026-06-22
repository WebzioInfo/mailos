'use client';

import { useState } from 'react';
import { Send, Paperclip, Sparkles, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EnterpriseAudienceBuilder } from '@/components/modules/campaigns/EnterpriseAudienceBuilder';
import { sendQuickEmail } from '@/modules/emails/actions';
import { SmtpAuthDialog } from '@/components/modules/smtp/SmtpAuthDialog';

export default function QuickEmailClient({ smtpProfiles, contacts, lists, tags, templates, senderProfile }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const initialEmail = searchParams.get('email');
  const initialGroupId = searchParams.get('groupId');
  
  const initialSelections = {
    contacts: initialEmail ? contacts.filter((c: any) => c.email === initialEmail) : [],
    lists: initialGroupId ? lists.filter((l: any) => l.id === initialGroupId) : [],
    tags: [],
    manualEmails: []
  };

  const [subject, setSubject] = useState('');
  
  const [body, setBody] = useState(() => {
    let initialHtml = '';
    if (senderProfile?.signature) {
      initialHtml += `<br><br>--<br>${senderProfile.signature}`;
    }
    if (senderProfile?.footer) {
      initialHtml += `<br><br><div style="font-size:12px;color:gray;border-top:1px solid #eee;padding-top:10px;">${senderProfile.footer}</div>`;
    }
    return initialHtml;
  });

  const [smtpProfileId, setSmtpProfileId] = useState('');
  const [templateId, setTemplateId] = useState('');
  
  const [audienceConfig, setAudienceConfig] = useState<any>({
    selectAllContacts: false,
    includedLists: [],
    includedTags: [],
    manualEmails: [],
  });

  const getRecipientSummary = () => {
    if (audienceConfig.totalRecipients !== undefined) {
      return `${audienceConfig.totalRecipients} exact recipient(s) selected`;
    }
    return '';
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setTemplateId(id);
    if (id) {
      const template = templates.find((t: any) => t.id === id);
      if (template) {
        setBody(template.html);
      }
    }
  };

  const handlePreSend = () => {
    if (!smtpProfileId) return toast.error('Select an SMTP sender profile');
    if (!subject) return toast.error('Subject is required');
    if (!body) return toast.error('Email body is required');

    const hasRecipients = audienceConfig.selectAllContacts || 
                          (audienceConfig.manualEmails?.length || 0) > 0 || 
                          (audienceConfig.includedLists?.length || 0) > 0 || 
                          (audienceConfig.includedTags?.length || 0) > 0 ||
                          (audienceConfig.includedContacts?.length || 0) > 0;
                          
    if (!hasRecipients) return toast.error('Please select at least one recipient');

    setShowAuthDialog(true);
  };

  const executeSend = async (profileId: string, password: string) => {
    const result = await sendQuickEmail({
      smtpProfileId: profileId,
      smtpPassword: password,
      subject,
      body,
      audienceConfig
    });

    if (result?.error) {
      throw new Error(result.error);
    } 

    setShowAuthDialog(false);
    toast.success("Quick Email Queued for Delivery!");
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Message</h1>
          <p className="text-muted-foreground mt-1">Send a quick email to individuals or groups.</p>
        </div>
      </div>

      <div className="border rounded-xl bg-background shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Header Fields */}
        <div className="p-4 border-b space-y-3 bg-slate-50/50 dark:bg-zinc-900/20">
          
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm font-medium text-muted-foreground text-right">From:</span>
            <div className="flex-1 flex items-center gap-2">
              <select 
                value={smtpProfileId}
                onChange={(e) => setSmtpProfileId(e.target.value)}
                className="flex-1 h-9 px-3 py-1 border rounded bg-transparent focus:ring-0 text-sm font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <option value="">Select Sender...</option>
                {smtpProfiles.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.senderEmail} ({p.name})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground">Select Audience:</span>
            <div className="w-full">
              <EnterpriseAudienceBuilder 
                contacts={contacts || []} 
                lists={lists || []} 
                tags={tags || []} 
                initialSelections={initialSelections}
                onChange={(config) => setAudienceConfig(config)} 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-16 text-sm font-medium text-muted-foreground text-right">Subject:</span>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1 h-9 px-3 border-none bg-transparent focus:ring-0 text-sm font-medium placeholder:font-normal"
            />
          </div>
        </div>

        {/* AI Toolbar */}
        <div className="px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2 overflow-x-auto">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded border bg-background hover:bg-accent transition-colors whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Generate Draft
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded border bg-background hover:bg-accent transition-colors whitespace-nowrap">
            Improve Writing
          </button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <select 
            value={templateId}
            onChange={handleTemplateChange}
            className="h-8 px-2 text-xs border rounded bg-background hover:bg-accent transition-colors cursor-pointer outline-none"
          >
            <option value="">Insert Template...</option>
            {templates.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Body Editor */}
        <div className="flex-1 p-4">
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            className="w-full h-full min-h-[300px] resize-none border-none focus:ring-0 text-sm bg-transparent"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              onClick={() => router.push('/dashboard')}
            >
              Discard
            </button>
            <button 
              onClick={handlePreSend}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      <SmtpAuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        smtpProfiles={smtpProfiles}
        defaultProfileId={smtpProfileId}
        onConfirm={executeSend}
        title="Send Quick Email"
      />
    </div>
  );
}
