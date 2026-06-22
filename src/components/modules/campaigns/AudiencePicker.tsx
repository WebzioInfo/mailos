'use client';

import { useState } from 'react';
import { Users, Tag as TagIcon, List as ListIcon, Check, Plus, Trash2 } from 'lucide-react';

export interface AudiencePickerProps {
  lists: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  onChange: (config: any) => void;
}

export function AudiencePicker({ lists, tags, onChange }: AudiencePickerProps) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [manualEmails, setManualEmails] = useState<string[]>([]);

  const handleUpdate = (updates: any) => {
    onChange({
      selectAllContacts: selectAll,
      includedLists: selectedLists,
      includedTags: selectedTags,
      manualEmails: manualEmails,
      ...updates
    });
  };

  const toggleList = (id: string) => {
    const next = selectedLists.includes(id) 
      ? selectedLists.filter(x => x !== id)
      : [...selectedLists, id];
    setSelectedLists(next);
    handleUpdate({ includedLists: next });
  };

  const toggleTag = (id: string) => {
    const next = selectedTags.includes(id) 
      ? selectedTags.filter(x => x !== id)
      : [...selectedTags, id];
    setSelectedTags(next);
    handleUpdate({ includedTags: next });
  };

  const toggleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    handleUpdate({ selectAllContacts: next });
  };

  const addManualEmail = (e: React.KeyboardEvent | React.FocusEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'blur') {
      e.preventDefault();
      const val = manualEmailInput.trim();
      if (val && !manualEmails.includes(val)) {
        const next = [...manualEmails, val];
        setManualEmails(next);
        setManualEmailInput('');
        handleUpdate({ manualEmails: next });
      }
    }
  };

  const removeManualEmail = (email: string) => {
    const next = manualEmails.filter(e => e !== email);
    setManualEmails(next);
    handleUpdate({ manualEmails: next });
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-xl bg-slate-50 dark:bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Global Audience</h3>
            <p className="text-sm text-muted-foreground mt-1">Select all contacts in your workspace.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-background border px-4 py-2 rounded-md shadow-sm hover:bg-accent transition-colors">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 w-4 h-4 text-primary" 
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            <span className="font-medium text-sm">Select All Contacts</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 bg-background shadow-sm space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><ListIcon className="w-4 h-4 text-muted-foreground"/> Contact Lists</h3>
          {lists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lists found in this workspace.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {lists.map(list => (
                <label key={list.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors border border-transparent hover:border-border">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedLists.includes(list.id)}
                    onChange={() => toggleList(list.id)}
                    disabled={selectAll}
                  />
                  <span className={`text-sm ${selectAll ? 'text-muted-foreground' : 'text-foreground'}`}>{list.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-xl p-5 bg-background shadow-sm space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><TagIcon className="w-4 h-4 text-muted-foreground"/> Contact Tags</h3>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags found in this workspace.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={selectAll}
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-muted-foreground border-input hover:bg-accent disabled:opacity-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {tag.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-background shadow-sm space-y-4">
        <h3 className="font-semibold flex items-center gap-2">Manual Entry / CSV</h3>
        <p className="text-sm text-muted-foreground">Type email and press Enter to add individual recipients.</p>
        <div className="space-y-3">
          <input 
            type="email"
            value={manualEmailInput}
            onChange={(e) => setManualEmailInput(e.target.value)}
            onKeyDown={addManualEmail}
            onBlur={addManualEmail}
            placeholder="Add recipient email..."
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {manualEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-slate-50 dark:bg-zinc-900/30">
              {manualEmails.map(email => (
                <span key={email} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-background border text-xs font-medium">
                  {email}
                  <button type="button" onClick={() => removeManualEmail(email)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
