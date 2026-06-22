'use client';

import { useState } from 'react';
import { Server, Plus, Edit2, Trash2, ShieldCheck, Mail, Save, X, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SmtpAuthDialog } from '@/components/modules/smtp/SmtpAuthDialog';
import { testSmtpConnection, updateSmtpProfile, deleteSmtpProfile, createSmtpProfile } from '@/modules/smtp/actions';

const PRESETS = {
  gmail: { provider: 'GMAIL', host: 'smtp.gmail.com', port: 587, encryption: 'STARTTLS' },
  hostinger: { provider: 'HOSTINGER', host: 'smtp.hostinger.com', port: 465, encryption: 'SSL' },
  outlook: { provider: 'OUTLOOK', host: 'smtp.office365.com', port: 587, encryption: 'STARTTLS' },
  zoho: { provider: 'ZOHO', host: 'smtp.zoho.com', port: 587, encryption: 'STARTTLS' },
  custom: { provider: 'CUSTOM', host: '', port: 587, encryption: 'STARTTLS' }
};

export default function SmtpDashboardClient({ initialProfiles }: { initialProfiles: any[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  
  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    provider: 'CUSTOM',
    senderName: '',
    senderEmail: '',
    host: '',
    port: 587,
    username: '',
    encryption: 'STARTTLS'
  });

  const openAddModal = () => {
    setFormData({
      id: '', name: '', provider: 'CUSTOM', senderName: '', senderEmail: '', host: '', port: 587, username: '', encryption: 'STARTTLS'
    });
    setShowEditModal(true);
  };

  const openEditModal = (profile: any) => {
    setFormData({
      id: profile.id,
      name: profile.name,
      provider: profile.provider || 'CUSTOM',
      senderName: profile.senderName,
      senderEmail: profile.senderEmail,
      host: profile.host,
      port: profile.port,
      username: profile.username,
      encryption: profile.encryption
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (profile: any) => {
    setActiveProfile(profile);
    setShowDeleteModal(true);
  };

  const openTestModal = (profile: any) => {
    setActiveProfile(profile);
    setShowAuthDialog(true);
  };

  const handlePresetSelect = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setFormData(prev => ({
      ...prev,
      provider: preset.provider,
      host: preset.host,
      port: preset.port,
      encryption: preset.encryption
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.host || !formData.port || !formData.username || !formData.senderEmail || !formData.senderName) {
      return toast.error("Please fill all required fields.");
    }
    
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('provider', formData.provider);
    fd.append('senderName', formData.senderName);
    fd.append('senderEmail', formData.senderEmail);
    fd.append('host', formData.host);
    fd.append('port', formData.port.toString());
    fd.append('username', formData.username);
    fd.append('encryption', formData.encryption);

    if (formData.id) {
      const res = await updateSmtpProfile(formData.id, {}, fd);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Profile updated");
        router.refresh(); // In a real app we might update local state, but router.refresh works
        setShowEditModal(false);
      }
    } else {
      await createSmtpProfile({}, fd);
      toast.success("Profile created");
      router.refresh();
      setShowEditModal(false);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!activeProfile) return;
    setIsSubmitting(true);
    const res = await deleteSmtpProfile(activeProfile.id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Profile deleted");
      setProfiles(profiles.filter(p => p.id !== activeProfile.id));
      setShowDeleteModal(false);
    }
    setIsSubmitting(false);
  };

  const handleTest = async (profileId: string, password: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) throw new Error("Profile not found");

    const result = await testSmtpConnection(profile, password);
    if (result.error) {
      throw new Error(result.error);
    } else {
      toast.success("Connection Successful! Test email sent.");
      setShowAuthDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openAddModal} className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add SMTP Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="border rounded-xl p-12 bg-background flex flex-col items-center justify-center text-center shadow-sm">
          <Server className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-semibold">No SMTP Profiles Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Create your first SMTP profile to start sending emails.</p>
          <button onClick={openAddModal} className="mt-6 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90">
            Add SMTP Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => (
            <div key={profile.id} className="border rounded-xl p-5 bg-background shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{profile.name}</h3>
                    <p className="text-xs text-muted-foreground">{profile.provider}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sender</span>
                  <span className="font-medium truncate max-w-[150px]">{profile.senderEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Host</span>
                  <span className="font-medium truncate max-w-[150px]">{profile.host}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Port</span>
                  <span className="font-medium">{profile.port} ({profile.encryption})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-4">
                <button onClick={() => openEditModal(profile)} className="flex flex-col items-center justify-center py-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">
                  <Edit2 className="w-4 h-4 mb-1" /> Edit
                </button>
                <button onClick={() => openTestModal(profile)} className="flex flex-col items-center justify-center py-2 px-1 text-xs font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                  <Activity className="w-4 h-4 mb-1" /> Test
                </button>
                <button onClick={() => openDeleteModal(profile)} className="flex flex-col items-center justify-center py-2 px-1 text-xs font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <Trash2 className="w-4 h-4 mb-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-background border shadow-2xl rounded-xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50 sticky top-0 rounded-t-xl z-10">
              <h3 className="font-bold text-lg">{formData.id ? 'Edit' : 'Add'} SMTP Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-black/5 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {!formData.id && (
                <div className="space-y-3 mb-6">
                  <label className="text-sm font-medium">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => handlePresetSelect('gmail')} className={`px-3 py-1.5 border rounded-md text-sm hover:bg-accent ${formData.provider === 'GMAIL' ? 'bg-primary/10 border-primary text-primary' : ''}`}>Gmail / Google Workspace</button>
                    <button type="button" onClick={() => handlePresetSelect('outlook')} className={`px-3 py-1.5 border rounded-md text-sm hover:bg-accent ${formData.provider === 'OUTLOOK' ? 'bg-primary/10 border-primary text-primary' : ''}`}>Outlook / Microsoft 365</button>
                    <button type="button" onClick={() => handlePresetSelect('zoho')} className={`px-3 py-1.5 border rounded-md text-sm hover:bg-accent ${formData.provider === 'ZOHO' ? 'bg-primary/10 border-primary text-primary' : ''}`}>Zoho Mail</button>
                    <button type="button" onClick={() => handlePresetSelect('hostinger')} className={`px-3 py-1.5 border rounded-md text-sm hover:bg-accent ${formData.provider === 'HOSTINGER' ? 'bg-primary/10 border-primary text-primary' : ''}`}>Hostinger</button>
                    <button type="button" onClick={() => handlePresetSelect('custom')} className={`px-3 py-1.5 border rounded-md text-sm hover:bg-accent ${formData.provider === 'CUSTOM' ? 'bg-primary/10 border-primary text-primary' : ''}`}>Custom</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Name</label>
                  <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="e.g. Support Inbox" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username / Auth Email</label>
                  <input required value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} placeholder="e.g. you@domain.com" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sender Name</label>
                  <input required value={formData.senderName} onChange={e=>setFormData({...formData, senderName: e.target.value})} placeholder="e.g. John Doe" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sender Email</label>
                  <input required type="email" value={formData.senderEmail} onChange={e=>setFormData({...formData, senderEmail: e.target.value})} placeholder="e.g. hello@domain.com" className="w-full h-10 px-3 border rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 space-y-2">
                  <label className="text-sm font-medium">SMTP Host</label>
                  <input required value={formData.host} onChange={e=>setFormData({...formData, host: e.target.value})} placeholder="e.g. smtp.gmail.com" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <input required type="number" value={formData.port} onChange={e=>setFormData({...formData, port: parseInt(e.target.value)})} placeholder="587" className="w-full h-10 px-3 border rounded-md" />
                </div>
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium">Encryption</label>
                  <select value={formData.encryption} onChange={e=>setFormData({...formData, encryption: e.target.value})} className="w-full h-10 px-3 border rounded-md bg-background">
                    <option value="STARTTLS">TLS / STARTTLS</option>
                    <option value="SSL">SSL</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 font-medium rounded-md hover:bg-accent text-sm" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 text-sm flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4"/> Save Profile</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border shadow-xl rounded-xl w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete SMTP Profile?</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete <strong>{activeProfile?.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 font-medium rounded-md border hover:bg-accent" disabled={isSubmitting}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 font-medium rounded-md bg-red-600 text-white hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SmtpAuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        smtpProfiles={[activeProfile]}
        defaultProfileId={activeProfile?.id}
        onConfirm={handleTest}
        title="Test SMTP Connection"
      />
    </div>
  );
}
