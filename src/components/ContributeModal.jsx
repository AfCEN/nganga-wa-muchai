import React, { useState } from 'react';
import { X, UserPlus, BookPlus, Link2, CalendarPlus, Loader2, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFamilyStore } from '../data/store';
import { useAuth } from '../data/auth';
import { useToast } from './Toast';
import { api, API_URL } from '../data/api';
import PhotoCrop from './PhotoCrop';

const TABS = [
  { id: 'person', label: 'Add Person', icon: UserPlus },
  { id: 'story', label: 'Add Story', icon: BookPlus },
  { id: 'connection', label: 'Add Connection', icon: Link2 },
  { id: 'event', label: 'Add Event', icon: CalendarPlus },
  { id: 'trail', label: 'Add Trail', icon: Route },
];

const ROLES = ['Elder', 'Parent', 'Storyteller', 'Historian', 'Pioneer', 'Caretaker', 'Other'];
const GENERATIONS = [1, 2, 3, 4, 5, 6];
const STORY_TYPES = ['memory', 'tradition', 'migration', 'milestone'];
const CONNECTION_TYPES = ['parent-child', 'spouse', 'sibling', 'grandparent-grandchild', 'uncle/aunt-nephew/niece', 'cousin'];
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
  const { addPerson, addConnection, people } = useFamilyStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropFile, setCropFile] = useState(null);
  const [connectTo, setConnectTo] = useState({ personId: '', type: 'parent-child', direction: 'child-of' });
  const [form, setForm] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
    location: '',
    bio: '',
    role: '',
    generation: 1,
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
  };

  const handleCropConfirm = (croppedFile) => {
    setPhotoFile(croppedFile);
    setPhotoPreview(URL.createObjectURL(croppedFile));
    setCropFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (photoFile) {
        const upload = await api.upload(photoFile);
        photoUrl = `${API_URL}${upload.url}`;
      }
      const created = await addPerson({
        id: `person-${Date.now()}`,
        name: form.name.trim(),
        birthYear: form.birthYear ? parseInt(form.birthYear) : null,
        deathYear: form.deathYear ? parseInt(form.deathYear) : null,
        location: form.location.trim(),
        bio: form.bio.trim(),
        role: form.role,
        generation: parseInt(form.generation),
        photo: photoUrl,
        stories: [],
      });

      // Create connection if specified
      if (connectTo.personId && created?.id) {
        const isParentOf = connectTo.direction === 'parent-of';
        await addConnection({
          id: `conn-${Date.now()}`,
          source: isParentOf ? created.id : connectTo.personId,
          target: isParentOf ? connectTo.personId : created.id,
          type: connectTo.type,
        });
      }

      toast.success('Person added!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add person');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Name *</label>
        <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
        {form.name.length >= 3 && people.some((p) => p.name.toLowerCase().includes(form.name.toLowerCase().trim())) && (
          <p className="mt-1.5 text-[11px] text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-md px-2 py-1.5">
            A person named "<strong>{people.find((p) => p.name.toLowerCase().includes(form.name.toLowerCase().trim()))?.name}</strong>" already exists. Make sure this is a new person.
          </p>
        )}
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
          <select
            value={ROLES.includes(form.role) || form.role === '' ? form.role : 'Other'}
            onChange={(e) => {
              if (e.target.value === 'Other') setForm({ ...form, role: 'Other' });
              else setForm({ ...form, role: e.target.value });
            }}
            className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="">Select role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {(form.role === 'Other' || (form.role && !ROLES.includes(form.role) && form.role !== '')) && (
            <input
              type="text"
              value={form.role === 'Other' ? '' : form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value || 'Other' })}
              placeholder="Type custom role..."
              className={`${inputClass()} mt-2`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          )}
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
        <label className={labelClass()}>Photo</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <div className="relative group">
              <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-[#e2c275]/20" />
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <X size={10} />
              </button>
            </div>
          ) : null}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handlePhotoChange}
            className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#e2c275]/10 file:text-[#e2c275] hover:file:bg-[#e2c275]/20 file:cursor-pointer"
          />
        </div>
        {photoPreview && (
          <p className="text-[11px] text-gray-500 mt-1.5">Hover photo to remove, or choose a new file to replace.</p>
        )}
      </div>

      {/* Connect to existing person */}
      {people.length > 0 && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
          <label className={labelClass()}>Connect to existing person (optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={connectTo.personId}
              onChange={(e) => setConnectTo({ ...connectTo, personId: e.target.value })}
              className={inputClass()}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">No connection</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={connectTo.type}
              onChange={(e) => setConnectTo({ ...connectTo, type: e.target.value })}
              className={inputClass()}
              style={{ fontFamily: 'Inter, sans-serif' }}
              disabled={!connectTo.personId}
            >
              {CONNECTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {connectTo.personId && ['parent-child', 'grandparent-grandchild', 'uncle/aunt-nephew/niece'].includes(connectTo.type) && (
            <div>
              <label className={labelClass()}>Direction</label>
              <select
                value={connectTo.direction}
                onChange={(e) => setConnectTo({ ...connectTo, direction: e.target.value })}
                className={inputClass()}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="child-of">
                  {form.name || 'New person'} is a child of {people.find((p) => p.id === connectTo.personId)?.name}
                </option>
                <option value="parent-of">
                  {form.name || 'New person'} is a parent of {people.find((p) => p.id === connectTo.personId)?.name}
                </option>
              </select>
            </div>
          )}
          {connectTo.personId && (
            <p className="text-[11px] text-gray-500">
              {['parent-child', 'grandparent-grandchild', 'uncle/aunt-nephew/niece'].includes(connectTo.type)
                ? connectTo.direction === 'parent-of'
                  ? <><strong className="text-gray-300">{form.name || 'New person'}</strong> → parent of → <strong className="text-[#e2c275]/70">{people.find((p) => p.id === connectTo.personId)?.name}</strong></>
                  : <><strong className="text-[#e2c275]/70">{people.find((p) => p.id === connectTo.personId)?.name}</strong> → parent of → <strong className="text-gray-300">{form.name || 'New person'}</strong></>
                : <>This person will be connected as <strong className="text-[#e2c275]/70">{connectTo.type}</strong> of <strong className="text-gray-300">{people.find((p) => p.id === connectTo.personId)?.name}</strong></>
              }
            </p>
          )}
        </div>
      )}

      <div>
        <label className={labelClass()}>Bio</label>
        <textarea value={form.bio} onChange={set('bio')} placeholder="A short description of this person..." rows={3} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Adding...' : 'Add Person'}
      </button>

      {cropFile && (
        <PhotoCrop
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}
    </form>
  );
}

function AddStoryForm({ onSuccess }) {
  const { addStory, people } = useFamilyStore();
  const { user } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: user?.displayName || '',
    personIds: [],
    tags: '',
    type: 'memory',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addStory({
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
      toast.success('Story added!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add story');
    } finally {
      setSubmitting(false);
    }
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
        disabled={submitting}
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Adding...' : 'Add Story'}
      </button>
    </form>
  );
}

function AddConnectionForm({ onSuccess }) {
  const { addConnection, people } = useFamilyStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ source: '', target: '', type: 'parent-child' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source || !form.target || form.source === form.target || submitting) return;
    setSubmitting(true);
    try {
      await addConnection({
        id: `conn-${Date.now()}`,
        source: form.source,
        target: form.target,
        type: form.type,
      });
      toast.success('Connection added!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add connection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Parent / Elder *</label>
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }}>
          <option value="">Select parent</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass()}>Child / Younger *</label>
        <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }}>
          <option value="">Select child</option>
          {people.filter((p) => p.id !== form.source).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {form.source && form.target && (
        <p className="text-[11px] text-gray-500">
          <strong className="text-[#e2c275]/70">{people.find((p) => p.id === form.source)?.name}</strong> → {form.type} → <strong className="text-gray-300">{people.find((p) => p.id === form.target)?.name}</strong>
        </p>
      )}

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
        disabled={submitting}
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Adding...' : 'Add Connection'}
      </button>
    </form>
  );
}

function AddEventForm({ onSuccess }) {
  const { addEvent, people } = useFamilyStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    year: '',
    personIds: [],
    type: 'milestone',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.year || submitting) return;
    setSubmitting(true);
    try {
      await addEvent({
        id: `event-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        year: parseInt(form.year),
        personIds: form.personIds,
        type: form.type,
      });
      toast.success('Event added!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add event');
    } finally {
      setSubmitting(false);
    }
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
        disabled={submitting}
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Adding...' : 'Add Event'}
      </button>
    </form>
  );
}

function StoryOrderList({ stories, selectedIds, onChange }) {
  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...selectedIds];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index) => {
    if (index === selectedIds.length - 1) return;
    const updated = [...selectedIds];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  const selectedStories = selectedIds.map((id) => stories.find((s) => s.id === id)).filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Story picker */}
      <div className="max-h-36 overflow-y-auto rounded-lg bg-[#12121f] border border-white/10 p-2 space-y-1">
        {stories.length === 0 && (
          <p className="text-xs text-gray-600 p-2">No stories added yet. Add stories first.</p>
        )}
        {stories.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedIds.includes(s.id)
                ? 'bg-[#e2c275]/15 text-[#e2c275]'
                : 'text-gray-400 hover:bg-white/5'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Ordered list with reorder buttons */}
      {selectedStories.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest text-gray-500">Order (drag to reorder)</p>
          {selectedStories.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-sm text-gray-300">
              <span className="text-[#e2c275]/60 text-xs font-bold w-5">{i + 1}.</span>
              <span className="flex-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{s.title}</span>
              <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-500 hover:text-[#e2c275] disabled:opacity-20 text-xs">&#9650;</button>
              <button type="button" onClick={() => moveDown(i)} disabled={i === selectedStories.length - 1} className="text-gray-500 hover:text-[#e2c275] disabled:opacity-20 text-xs">&#9660;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTrailForm({ onSuccess }) {
  const { addStoryTrail, stories } = useFamilyStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    storyIds: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.storyIds.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await addStoryTrail({
        id: `trail-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        storyIds: form.storyIds,
      });
      toast.success('Story trail created!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create trail');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass()}>Trail Title *</label>
        <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. The Migration Story" className={inputClass()} required style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div>
        <label className={labelClass()}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="What is this trail about?" rows={3} className={inputClass()} style={{ fontFamily: 'Inter, sans-serif' }} />
      </div>

      <div>
        <label className={labelClass()}>Select Stories * (click to add, use arrows to reorder)</label>
        <StoryOrderList stories={stories} selectedIds={form.storyIds} onChange={(ids) => setForm({ ...form, storyIds: ids })} />
      </div>

      <button
        type="submit"
        disabled={submitting || form.storyIds.length === 0}
        className="w-full py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Creating...' : 'Create Trail'}
      </button>
    </form>
  );
}

export default function ContributeModal({ onClose, initialTab = 'person' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { isAuthenticated } = useAuth();

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

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-gray-400 mb-4">Please sign in to contribute to the family tree.</p>
            <Link
              to="/login"
              onClick={onClose}
              className="inline-block px-6 py-2.5 bg-[#e2c275] rounded-lg font-semibold hover:bg-[#f0d68a] transition-all text-sm no-underline"
              style={{ color: '#1a1a2e' }}
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
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
              {activeTab === 'trail' && <AddTrailForm onSuccess={handleSuccess} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
