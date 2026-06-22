'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Tag as TagIcon, List as ListIcon, Check, Search, Upload, Mail, CheckCircle2, UserCircle } from 'lucide-react';

export interface AudienceConfig {
  selectAllContacts?: boolean;
  includedLists?: string[];
  includedTags?: string[];
  includedContacts?: string[];
  manualEmails?: string[];
  excludedContacts?: string[];
  totalRecipients?: number;
  resolvedRecipients?: { email: string; name: string }[];
}

interface EnterpriseAudienceBuilderProps {
  contacts: any[];
  lists: any[];
  tags: any[];
  initialSelections?: any;
  onChange: (config: AudienceConfig) => void;
}

export function EnterpriseAudienceBuilder({ contacts, lists, tags, initialSelections, onChange }: EnterpriseAudienceBuilderProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups' | 'tags' | 'manual' | 'all'>('contacts');
  
  // Selection State
  const [selectAllContacts, setSelectAllContacts] = useState<boolean>(initialSelections?.selectAllContacts || false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(initialSelections?.includedContacts || []);
  const [selectedLists, setSelectedLists] = useState<string[]>(initialSelections?.includedLists || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelections?.includedTags || []);
  const [manualEmailsInput, setManualEmailsInput] = useState<string>(initialSelections?.manualEmails?.join('\n') || '');

  // Search State
  const [contactSearch, setContactSearch] = useState('');

  // Parsed Manual Emails
  const manualEmails = useMemo(() => {
    return manualEmailsInput
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  }, [manualEmailsInput]);

  // Derived Audience Resolution
  const resolvedAudience = useMemo(() => {
    const finalRecipients = new Map<string, any>(); // email -> source info
    let duplicatesRemoved = 0;
    
    // Add All Contacts
    if (selectAllContacts) {
      contacts.forEach(c => {
        if (!finalRecipients.has(c.email)) {
          finalRecipients.set(c.email, { name: c.firstName ? `${c.firstName} ${c.lastName || ''}` : '', source: 'All Contacts' });
        } else {
          duplicatesRemoved++;
        }
      });
    } else {
      // Add Groups
      if (selectedLists.length > 0) {
        contacts.forEach(c => {
          const inGroup = c.lists?.some((l: any) => selectedLists.includes(l.id));
          if (inGroup) {
            if (!finalRecipients.has(c.email)) {
              finalRecipients.set(c.email, { name: c.firstName ? `${c.firstName} ${c.lastName || ''}` : '', source: 'Group' });
            } else {
              duplicatesRemoved++;
            }
          }
        });
      }
      
      // Add Tags
      if (selectedTags.length > 0) {
        contacts.forEach(c => {
          const hasTag = c.tags?.some((t: any) => selectedTags.includes(t.id));
          if (hasTag) {
            if (!finalRecipients.has(c.email)) {
              finalRecipients.set(c.email, { name: c.firstName ? `${c.firstName} ${c.lastName || ''}` : '', source: 'Tag' });
            } else {
              duplicatesRemoved++;
            }
          }
        });
      }

      // Add Individual Contacts
      if (selectedContacts.length > 0) {
        contacts.forEach(c => {
          if (selectedContacts.includes(c.id)) {
            if (!finalRecipients.has(c.email)) {
              finalRecipients.set(c.email, { name: c.firstName ? `${c.firstName} ${c.lastName || ''}` : '', source: 'Direct Selection' });
            } else {
              duplicatesRemoved++;
            }
          }
        });
      }
    }

    // Add Manual Emails
    manualEmails.forEach(email => {
      if (!finalRecipients.has(email)) {
        finalRecipients.set(email, { name: '', source: 'Manual Entry' });
      } else {
        duplicatesRemoved++;
      }
    });

    return {
      recipients: Array.from(finalRecipients.entries()).map(([email, info]) => ({ email, ...info })),
      duplicatesRemoved
    };
  }, [contacts, selectAllContacts, selectedLists, selectedTags, selectedContacts, manualEmails]);

  // Sync to parent whenever anything changes
  useEffect(() => {
    onChange({
      selectAllContacts,
      includedLists: selectedLists,
      includedTags: selectedTags,
      includedContacts: selectedContacts,
      manualEmails: manualEmails,
      totalRecipients: resolvedAudience.recipients.length,
      resolvedRecipients: resolvedAudience.recipients
    });
  }, [selectAllContacts, selectedLists, selectedTags, selectedContacts, manualEmails, resolvedAudience]);

  // Toggles
  const toggleContact = (id: string) => {
    setSelectedContacts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleList = (id: string) => {
    setSelectedLists(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectAllContacts(prev => !prev);
  };

  const handleManualChange = (val: string) => {
    setManualEmailsInput(val);
  };

  const filteredContacts = contacts.filter(c => {
    const q = contactSearch.toLowerCase();
    return c.email.toLowerCase().includes(q) || 
           (c.firstName?.toLowerCase().includes(q)) || 
           (c.lastName?.toLowerCase().includes(q)) ||
           (c.attributes?.company?.toLowerCase().includes(q));
  }).slice(0, 50); // limit to 50 for perf

  return (
    <div className="flex flex-col md:flex-row border border-border rounded-xl overflow-hidden bg-background shadow-sm h-[600px]">
      
      {/* LEFT PANEL: Audience Sources */}
      <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-border flex flex-col">
        {/* Source Navigation Tabs */}
        <div className="flex border-b border-border bg-slate-50 dark:bg-zinc-900/50 overflow-x-auto no-scrollbar">
          <button 
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Contacts
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Groups
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'tags' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Tags
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Manual / CSV
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Select All
          </button>
        </div>

        {/* Source Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-background">
          
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search name, email, or company..." 
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  disabled={selectAllContacts}
                />
              </div>
              
              {selectAllContacts && (
                <div className="p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-md text-sm">
                  "Select All Contacts" is enabled. Individual selections are ignored.
                </div>
              )}

              <div className="space-y-1 mt-2">
                {filteredContacts.map(c => (
                  <label key={c.id} className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer ${selectAllContacts ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedContacts.includes(c.id)}
                        onChange={() => toggleContact(c.id)}
                        className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-medium">{c.firstName ? `${c.firstName} ${c.lastName || ''}` : c.email}</div>
                        {c.firstName && <div className="text-xs text-muted-foreground">{c.email}</div>}
                      </div>
                    </div>
                    {c.attributes?.company && <div className="text-xs text-muted-foreground">{c.attributes.company}</div>}
                  </label>
                ))}
                {filteredContacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No contacts found.</p>}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              {selectAllContacts && (
                <div className="p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-md text-sm">
                  "Select All Contacts" is enabled. Group selections are ignored.
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                {lists.length === 0 && <p className="text-sm text-muted-foreground">No groups found in this workspace.</p>}
                {lists.map(list => {
                  // Calculate member count for this list client-side
                  const count = contacts.filter(c => c.lists?.some((l:any) => l.id === list.id)).length;
                  return (
                    <label key={list.id} className={`flex items-center justify-between p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors ${selectedLists.includes(list.id) ? 'border-primary bg-primary/5' : ''} ${selectAllContacts ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedLists.includes(list.id)}
                          onChange={() => toggleList(list.id)}
                          className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{list.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3"/> {count} contacts</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4">
              {selectAllContacts && (
                <div className="p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-md text-sm">
                  "Select All Contacts" is enabled. Tag selections are ignored.
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags found.</p>}
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  const count = contacts.filter(c => c.tags?.some((t:any) => t.id === tag.id)).length;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={selectAllContacts}
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-muted-foreground border-input hover:bg-accent disabled:opacity-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <TagIcon className="w-3 h-3 opacity-70" />
                      {tag.name} <span className="opacity-50 text-xs">({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Manual Entry</h3>
                <span className="text-xs text-muted-foreground">Paste comma or line separated emails</span>
              </div>
              <textarea 
                value={manualEmailsInput}
                onChange={(e) => handleManualChange(e.target.value)}
                placeholder="john@example.com&#10;jane@example.com"
                className="w-full flex-1 min-h-[200px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{manualEmails.length} valid emails parsed</span>
              </div>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="space-y-6 flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Select All Contacts</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Send this campaign to every single contact ({contacts.length}) in your workspace. This will override individual, group, and tag selections.
                </p>
              </div>
              <button 
                type="button"
                onClick={toggleSelectAll}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${selectAllContacts ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'}`}
              >
                {selectAllContacts ? 'Disable Select All' : 'Enable Select All'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL: Live Summary & Preview */}
      <div className="w-full md:w-2/5 flex flex-col bg-slate-50 dark:bg-zinc-900/30">
        <div className="p-6 border-b border-border bg-white dark:bg-zinc-900/50">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5 text-green-500"/> Audience Summary</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground font-medium uppercase">Final Recipients</div>
              <div className="text-2xl font-bold text-primary mt-1">{resolvedAudience.recipients.length}</div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground font-medium uppercase">Duplicates Removed</div>
              <div className="text-2xl font-bold text-orange-500 mt-1">{resolvedAudience.duplicatesRemoved}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectAllContacts && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">All Contacts</span>}
            {!selectAllContacts && selectedLists.length > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">{selectedLists.length} Groups</span>}
            {!selectAllContacts && selectedTags.length > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">{selectedTags.length} Tags</span>}
            {!selectAllContacts && selectedContacts.length > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">{selectedContacts.length} Contacts</span>}
            {manualEmails.length > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">{manualEmails.length} Manual</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recipient Preview (First 20)</h4>
          <div className="space-y-1">
            {resolvedAudience.recipients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recipients selected yet.
              </div>
            ) : (
              resolvedAudience.recipients.slice(0, 20).map((r, i) => (
                <div key={i} className="flex flex-col p-2 bg-white dark:bg-zinc-900 rounded border border-transparent shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">{r.name || r.email}</div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-muted-foreground rounded uppercase">{r.source}</span>
                  </div>
                  {r.name && <div className="text-xs text-muted-foreground">{r.email}</div>}
                </div>
              ))
            )}
            {resolvedAudience.recipients.length > 20 && (
              <div className="text-center py-2 text-xs font-medium text-muted-foreground">
                + {resolvedAudience.recipients.length - 20} more...
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
