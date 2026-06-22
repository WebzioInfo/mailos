'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Users, Tag as TagIcon, List as ListIcon, Check, User, Plus } from 'lucide-react';

export interface RecipientPickerProps {
  contacts: any[];
  lists: any[];
  tags: any[];
  onChange: (config: any) => void;
  initialSelections?: any;
}

export function AdvancedRecipientPicker({ contacts, lists, tags, onChange, initialSelections }: RecipientPickerProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedContacts, setSelectedContacts] = useState<any[]>(initialSelections?.contacts || []);
  const [selectedLists, setSelectedLists] = useState<any[]>(initialSelections?.lists || []);
  const [selectedTags, setSelectedTags] = useState<any[]>(initialSelections?.tags || []);
  const [manualEmails, setManualEmails] = useState<string[]>(initialSelections?.manualEmails || []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onChange({
      includedContacts: selectedContacts.map(c => c.id),
      includedLists: selectedLists.map(l => l.id),
      includedTags: selectedTags.map(t => t.id),
      manualEmails: manualEmails,
      selectAllContacts: false
    });
  }, [selectedContacts, selectedLists, selectedTags, manualEmails]);

  const searchResults = () => {
    if (!query) return { c: [], l: [], t: [] };
    const q = query.toLowerCase();

    const c = contacts.filter(x =>
      x.email.toLowerCase().includes(q) ||
      (x.firstName && x.firstName.toLowerCase().includes(q)) ||
      (x.lastName && x.lastName.toLowerCase().includes(q))
    ).slice(0, 5);

    const l = lists.filter(x => x.name.toLowerCase().includes(q)).slice(0, 3);
    const t = tags.filter(x => x.name.toLowerCase().includes(q)).slice(0, 3);

    return { c, l, t };
  };

  const { c, l, t } = searchResults();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);

  const addContact = (contact: any) => {
    if (!selectedContacts.find(x => x.id === contact.id)) setSelectedContacts([...selectedContacts, contact]);
    setQuery('');
    setIsOpen(false);
  };

  const addList = (list: any) => {
    if (!selectedLists.find(x => x.id === list.id)) setSelectedLists([...selectedLists, list]);
    setQuery('');
    setIsOpen(false);
  };

  const addTag = (tag: any) => {
    if (!selectedTags.find(x => x.id === tag.id)) setSelectedTags([...selectedTags, tag]);
    setQuery('');
    setIsOpen(false);
  };

  const addManual = () => {
    if (isEmail && !manualEmails.includes(query)) {
      setManualEmails([...manualEmails, query]);
      setQuery('');
      setIsOpen(false);
    }
  };

  const removeContact = (id: string) => setSelectedContacts(selectedContacts.filter(x => x.id !== id));
  const removeList = (id: string) => setSelectedLists(selectedLists.filter(x => x.id !== id));
  const removeTag = (id: string) => setSelectedTags(selectedTags.filter(x => x.id !== id));
  const removeManual = (email: string) => setManualEmails(manualEmails.filter(x => x !== email));

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="min-h-[40px] w-full border border-input rounded-md bg-background px-3 py-1.5 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
        {selectedLists.map(list => (
          <span key={list.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <ListIcon className="w-3 h-3" /> {list.name}
            <button type="button" onClick={() => removeList(list.id)} className="hover:text-blue-950 dark:hover:text-blue-100"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {selectedTags.map(tag => (
          <span key={tag.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <TagIcon className="w-3 h-3" /> {tag.name}
            <button type="button" onClick={() => removeTag(tag.id)} className="hover:text-purple-950 dark:hover:text-purple-100"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {selectedContacts.map(contact => (
          <span key={contact.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">
            <User className="w-3 h-3" /> {contact.firstName ? `${contact.firstName} ${contact.lastName || ''}` : contact.email}
            <button type="button" onClick={() => removeContact(contact.id)} className="hover:text-slate-950 dark:hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {manualEmails.map(email => (
          <span key={email} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-300">
            <User className="w-3 h-3" /> {email}
            <button type="button" onClick={() => removeManual(email)} className="hover:text-slate-950 dark:hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[200px] bg-transparent border-none outline-none focus:ring-0 p-0 text-sm h-7"
          placeholder="Search contacts, groups, tags or type email..."
        />
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">

          {isEmail && (
            <div className="p-2 border-b">
              <button
                type="button"
                onClick={addManual}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-primary" /> Add <span className="font-semibold">{query}</span>
              </button>
            </div>
          )}

          {c.length > 0 && (
            <div className="p-2 border-b">
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacts</div>
              {c.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => addContact(contact)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.firstName ? `${contact.firstName} ${contact.lastName || ''}` : contact.email}</span>
                    {contact.firstName && <span className="text-xs text-muted-foreground">{contact.email}</span>}
                  </div>
                  {selectedContacts.find(x => x.id === contact.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {l.length > 0 && (
            <div className="p-2 border-b">
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Groups</div>
              {l.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => addList(list)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2"><ListIcon className="w-4 h-4 text-blue-500" /> <span className="font-medium">{list.name}</span></div>
                  {selectedLists.find(x => x.id === list.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {t.length > 0 && (
            <div className="p-2 border-b">
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</div>
              {t.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2"><TagIcon className="w-4 h-4 text-purple-500" /> <span className="font-medium">{tag.name}</span></div>
                  {selectedTags.find(x => x.id === tag.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          {c.length === 0 && l.length === 0 && t.length === 0 && !isEmail && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

        </div>
      )}
    </div>
  );
}
