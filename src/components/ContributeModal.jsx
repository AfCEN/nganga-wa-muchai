import React, { useState } from 'react';
import { X, UserPlus, BookPlus, Link2, CalendarPlus } from 'lucide-react';
import { useFamilyStore } from '../data/store';

const TABS = [
  { id: 'person', label: 'Add Person', icon: UserPlus },
  { id: 'story', label: 'Add Story', icon: BookPlus },
  { id: 'connection', label: 'Add Connection', icon: Link2 },
  { id: 'event', label: 'Add Event', icon: CalendarPlus },
];

const ROLES = ['Elder', 'Parent', 'Storyteller', 'Historian', 'Pioneer', 'Caretaker', 'Other'];
const GENERATIONS = [1, 2, 3, 4, 5, 6];
const STORY_TYPES = ['memory', 'tradition', 'migration', 'milestone'];
const CONNECTION_TYPES = ['parent-child', 'spouse', 'sibling'];
const EVENT_TYPES = ['birth', 'death', 'marriage', 'migration', 'milestone', 'tradition', 'other'];

function inputClass() {
  return 'w-full px-3 py-2.5 rounded-lg bg-[#12121f] border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:border-[#e2c275]/40 focus:ring-1 focus:ring-[#e2c275]/20 focus:outline-none transition-colors';
}

function labelClass() {
  return 'block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5';
}

function MultiSelect({ people, selected, onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className="max-h-40 overflow-y-auto rounded-lg bg-[#12121f] border border-white/10 p-2 space-y-1">
      {people.length === 0 && (
        <p className="text-xs text-gray-600 p-2">No people added yet.</p>
      )}
      {people.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => toggle(p.id)}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
            selected.includes(p.id)
              ? 'bg-[#e2c275]/15 text-[#e2c275]'
              : 'text-gray-400 hover:bg-white/5'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

function AddPersonForm({ onSuccess }) {
  const { addPerson } = useFamilyStore();
  const [form, setForm] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
    location: '',
    bio: '',
    role: '',
    generation: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    addPerson({
      id: `person-${Date.now()}`,
      name: form.name.trim(),
      birthYear: form.birthYear ? parseInt(form.birthYear) : null,
      deathYear: form.deathYear ? parseInt(form.deathYear) : null,
      location: form.location.trim(),
      bio: form.bio.trim(),
      role: form.role,
      generation: parseInt(form.generation),
      photo: null,
      stories: [],
    });
    onSuccess();
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Name *</label>
        <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass()}>Birth Year</label>
          <input type="number" value={form.birthYear} onChange={set('birthYear')} placeholder="e.g. 1940" className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label className={labelClass()}>Death Year</label>
          <input type="number" value={form.deathYear} onChange={set('deathYear')} placeholder="Optional" className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
        </div>
      </div>

      <div>
        <label className={labelClass()}>Location</label>
        <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Nairobi, Kenya" className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass()}>Role</label>
          <select value={form.role} onChange={set('role')} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}>
            <option value="">Select role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass()}>Generation</label>
          <select value={form.generation} onChange={set('generation')} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}>
            {GENERATIONS.map((g) => (
              <option key={g} value={g}>Generation {g}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass()}>Bio</label>
        <textarea value={form.bio} onChange={set('bio')} placeholder="A short description of this person..." rows={3} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Add Person
      </button>
    </form>
  );
}

function AddStoryForm({ onSuccess }) {
  const { addStory, people } = useFamilyStore();
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    personIds: [],
    tags: '',
    type: 'memory',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    addStory({
      id: `story-${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim(),
      date: new Date().toISOString().split('T')[0],
      personIds: form.personIds,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      type: form.type,
    });
    onSuccess();
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Title *</label>
        <input type="text" value={form.title} onChange={set('title')} placeholder="Story title" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div>
        <label className={labelClass()}>Content *</label>
        <textarea value={form.content} onChange={set('content')} placeholder="Tell the story..." rows={5} className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass()}>Author</label>
          <input type="text" value={form.author} onChange={set('author')} placeholder="Your name" className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label className={labelClass()}>Type</label>
          <select value={form.type} onChange={set('type')} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}>
            {STORY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass()}>Linked People</label>
        <MultiSelect people={people} selected={form.personIds} onChange={(ids) => setForm({ ...form, personIds: ids })} />
      </div>

      <div>
        <label className={labelClass()}>Tags (comma separated)</label>
        <input type="text" value={form.tags} onChange={set('tags')} placeholder="e.g. childhood, Nairobi, farming" className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Add Story
      </button>
    </form>
  );
}

function AddConnectionForm({ onSuccess }) {
  const { addConnection, people } = useFamilyStore();
  const [form, setForm] = useState({ source: '', target: '', type: 'parent-child' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.source || !form.target || form.source === form.target) return;

    addConnection({
      id: `conn-${Date.now()}`,
      source: form.source,
      target: form.target,
      type: form.type,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>From Person *</label>
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }}>
          <option value="">Select person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass()}>To Person *</label>
        <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }}>
          <option value="">Select person</option>
          {people.filter((p) => p.id !== form.source).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass()}>Relationship Type *</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}>
          {CONNECTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Add Connection
      </button>
    </form>
  );
}

function AddEventForm({ onSuccess }) {
  const { addEvent, people } = useFamilyStore();
  const [form, setForm] = useState({
    title: '',
    description: '',
    year: '',
    personIds: [],
    type: 'milestone',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.year) return;

    addEvent({
      id: `event-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      year: parseInt(form.year),
      personIds: form.personIds,
      type: form.type,
    });
    onSuccess();
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Title *</label>
        <input type="text" value={form.title} onChange={set('title')} placeholder="Event title" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass()}>Year *</label>
          <input type="number" value={form.year} onChange={set('year')} placeholder="e.g. 1965" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
        </div>
        <div>
          <label className={labelClass()}>Type</label>
          <select value={form.type} onChange={set('type')} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass()}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="What happened..." rows={3} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div>
        <label className={labelClass()}>Linked People</label>
        <MultiSelect people={people} selected={form.personIds} onChange={(ids) => setForm({ ...form, personIds: ids })} />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Add Event
      </button>
    </form>
  );
}

export default function ContributeModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('person');

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-[#1a1a2e] border border-[#e2c275]/15 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2
            className="text-xl text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Contribute
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#e2c275] border-[#e2c275]'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'person' && <AddPersonForm onSuccess={handleSuccess} />}
          {activeTab === 'story' && <AddStoryForm onSuccess={handleSuccess} />}
          {activeTab === 'connection' && <AddConnectionForm onSuccess={handleSuccess} />}
          {activeTab === 'event' && <AddEventForm onSuccess={handleSuccess} />}
        </div>
      </div>
    </div>
  );
}
