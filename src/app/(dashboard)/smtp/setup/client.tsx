'use client';

import { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, Server, Key, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createSmtpProfile, testSmtpConnection } from '@/modules/smtp/actions';

const PRESETS = {
  gmail: { host: 'smtp.gmail.com', port: 587, encryption: 'TLS' },
  hostinger: { host: 'smtp.hostinger.com', port: 465, encryption: 'SSL' },
  zoho: { host: 'smtp.zoho.com', port: 587, encryption: 'TLS' },
  outlook: { host: 'smtp.office365.com', port: 587, encryption: 'STARTTLS' },
};

export default function SmtpSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [encryption, setEncryption] = useState('TLS');
  const [username, setUsername] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const selectPreset = (key: string) => {
    setProvider(key);
    if (key !== 'custom') {
      const preset = PRESETS[key as keyof typeof PRESETS];
      setHost(preset.host);
      setPort(preset.port);
      setEncryption(preset.encryption);
    }
    setStep(2);
  };

  const validateStep2 = () => {
    if (!name || !host || !port || !username || !senderName || !senderEmail) {
      return toast.error("All fields are required.");
    }
    setStep(3);
  };

  const validateStep3 = () => {
    if (!password) {
      return toast.error("Password is required to test connection.");
    }
    setStep(4);
  };

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const data = {
      name, host, port, username, senderName, senderEmail, encryption
    };

    const res = await testSmtpConnection(data, password);
    setIsTesting(false);

    if (res?.error) {
      setTestResult({ success: false, error: res.error });
    } else {
      setTestResult({ success: true });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('host', host);
    formData.append('port', port.toString());
    formData.append('username', username);
    formData.append('senderName', senderName);
    formData.append('senderEmail', senderEmail);
    formData.append('encryption', encryption);

    const res = await createSmtpProfile({}, formData);
    if (res?.error) {
      toast.error(typeof res.error === 'string' ? res.error : "Failed to save profile");
    } else {
      toast.success("SMTP Profile Saved Successfully!");
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Server className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Email Delivery</h1>
        <p className="text-muted-foreground">Setup your SMTP profile to start sending campaigns and emails.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 text-sm font-medium relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
        {[
          { num: 1, label: 'Provider' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'Password' },
          { num: 4, label: 'Test' },
        ].map((s) => (
          <div key={s.num} className={`flex flex-col items-center gap-2 bg-background px-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s.num ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
              {s.num}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-background border rounded-xl shadow-lg p-8 min-h-[400px]">

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-6">Select your email provider</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button onClick={() => selectPreset('gmail')} className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition flex flex-col items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="w-10 h-10" />
                <span className="font-semibold text-sm">Gmail / Workspace</span>
              </button>
              <button onClick={() => selectPreset('outlook')} className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition flex flex-col items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-10 h-10" />
                <span className="font-semibold text-sm">Microsoft 365</span>
              </button>
              <button onClick={() => selectPreset('zoho')} className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">Z</div>
                <span className="font-semibold text-sm">Zoho Mail</span>
              </button>
              <button onClick={() => selectPreset('hostinger')} className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xl">H</div>
                <span className="font-semibold text-sm">Hostinger</span>
              </button>
              <button onClick={() => selectPreset('custom')} className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition flex flex-col items-center gap-3 col-span-2 md:col-span-2">
                <Server className="w-10 h-10 text-muted-foreground" />
                <span className="font-semibold text-sm">Custom SMTP Server</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">Connection Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Profile Name (Internal)</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sales Gmail, Main Marketing" className="w-full h-10 px-3 border rounded" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Host</label>
                <input value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.example.com" className="w-full h-10 px-3 border rounded" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Port</label>
                <input type="number" value={port} onChange={e => setPort(Number(e.target.value))} className="w-full h-10 px-3 border rounded" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Encryption</label>
                <select value={encryption} onChange={e => setEncryption(e.target.value)} className="w-full h-10 px-3 border rounded">
                  <option value="TLS">TLS</option>
                  <option value="STARTTLS">STARTTLS</option>
                  <option value="SSL">SSL</option>
                  <option value="NONE">None</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="hello@domain.com" className="w-full h-10 px-3 border rounded" />
              </div>
              <div className="col-span-2 mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sender Name (Shown to Recipient)</label>
                  <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="John from Webzio" className="w-full h-10 px-3 border rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sender Email (Shown to Recipient)</label>
                  <input value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="hello@domain.com" className="w-full h-10 px-3 border rounded" />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="px-4 py-2 border rounded font-medium hover:bg-accent text-sm">Back</button>
              <button onClick={validateStep2} className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 text-sm">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">SMTP Password</h2>
              <p className="text-muted-foreground">Enter your SMTP password or App Password to verify the connection.</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold text-sm mb-2">
                <ShieldCheck className="w-4 h-4" /> Security Guarantee
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Webzio MailOS operates on a strict zero-knowledge policy for email passwords.
                <br /><br />
                <strong>Your password is NEVER stored in our database, local storage, or server logs.</strong> It is only held in temporary memory during the exact moment of dispatch and immediately destroyed.
              </p>
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter SMTP or App Password..."
                className="w-full h-12 px-4 border-2 rounded-lg text-lg focus:border-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">If using Gmail or Microsoft 365, you MUST use an App Password, not your account password.</p>
            </div>

            <div className="flex justify-between pt-8">
              <button onClick={() => setStep(2)} className="px-4 py-2 border rounded font-medium hover:bg-accent text-sm">Back</button>
              <button onClick={validateStep3} className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 text-sm flex items-center gap-2">
                Test Connection <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 flex flex-col h-[350px]">
            <h2 className="text-xl font-bold border-b pb-4 mb-6">Test & Save</h2>

            <div className="flex-1 flex flex-col items-center justify-center">
              {!testResult && !isTesting && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-6">Click below to test your SMTP credentials. This will attempt an authentication handshake and send a test email to {senderEmail}.</p>
                  <button onClick={runTest} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition shadow-lg flex items-center gap-2 mx-auto">
                    <Server className="w-5 h-5" /> Test SMTP Connection
                  </button>
                </div>
              )}

              {isTesting && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  <h3 className="font-semibold text-lg">Authenticating with {host}...</h3>
                  <p className="text-sm text-muted-foreground mt-2">Please wait while we verify your credentials.</p>
                </div>
              )}

              {testResult && testResult.success && (
                <div className="flex flex-col items-center text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-2xl text-green-600 mb-2">Connection Successful!</h3>
                  <p className="text-muted-foreground">Your SMTP profile is fully configured and ready to send emails.</p>
                </div>
              )}

              {testResult && !testResult.success && (
                <div className="w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-6 animate-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-red-600 flex items-center gap-2 mb-2">
                    <X className="w-5 h-5" /> Authentication Failed
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-400 font-mono bg-white/50 dark:bg-black/20 p-3 rounded">{testResult.error}</p>
                  <button onClick={() => setStep(3)} className="mt-4 px-4 py-2 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20">
                    Fix Password
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 mt-auto border-t">
              <button disabled={isTesting} onClick={() => setStep(3)} className="px-4 py-2 border rounded font-medium hover:bg-accent text-sm disabled:opacity-50">Back</button>
              {testResult && testResult.success && (
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-lg flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
