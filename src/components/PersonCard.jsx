import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, BookOpen, Users, PlusCircle, Award, Pencil, Check, Loader2, Trash2, Link2, Route, GitBranch } from 'lucide-react';
import { useFamilyStore } from '../data/store';
import { useAuth } from '../data/auth';
import { useToast } from './Toast';
import { api, API_URL } from '../data/api';

export default function PersonCard({ personId, onClose, onSelectPerson, onAddStory }) {
  const { getPersonById, getStoriesForPerson, getConnectionsForPerson, updatePerson, deletePerson, addConnection, deleteConnection, addPerson, people, connections } = useFamilyStore();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showAddConn, setShowAddConn] = useState(false);
  const [connForm, setConnForm] = useState({ targetId: '', type: 'parent-child', direction: 'parent' });
  const [savingConn, setSavingConn] = useState(false);
  const [newPersonMode, setNewPersonMode] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonGen, setNewPersonGen] = useState(1);
  const [showPathFinder, setShowPathFinder] = useState(false);
  const [pathTargetId, setPathTargetId] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [showSubtree, setShowSubtree] = useState(false);

  const person = personId ? getPersonById(personId) : null;

  useEffect(() => {
    if (personId && !person) {
      onClose?.();
    }
  }, [personId, person, onClose]);

  if (!personId || !person) return null;

  const personStories = getStoriesForPerson(personId);
  const personConnections = getConnectionsForPerson(personId);

  const connectedPeople = personConnections.map((conn) => {
    const otherId = conn.source === personId ? conn.target : conn.source;
    const other = getPersonById(otherId);
    return { ...conn, person: other };
  }).filter((c) => c.person);

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getRelationLabel = (type, connSource) => {
    switch (type) {
      case 'parent-child':
        return connSource === personId ? 'Child' : 'Parent';
      case 'spouse':
        return 'Spouse';
      case 'sibling':
        return 'Sibling';
      case 'grandparent-grandchild':
        return connSource === personId ? 'Grandchild' : 'Grandparent';
      case 'uncle/aunt-nephew/niece':
        return connSource === personId ? 'Nephew/Niece' : 'Uncle/Aunt';
      case 'cousin':
        return 'Cousin';
      default:
        return type;
    }
  };

  const startEditing = () => {
    setEditForm({
      name: person.name || '',
      birthYear: person.birthYear || '',
      deathYear: person.deathYear || '',
      location: person.location || '',
      bio: person.bio || '',
      role: person.role || '',
      generation: person.generation || 1,
    });
    setPhotoPreview(person.photo || null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      let photoUrl = photoPreview;  // null if removed, existing URL if unchanged
      if (photoFile) {
        const upload = await api.upload(photoFile);
        photoUrl = `${API_URL}${upload.url}`;
      }
      updatePerson({
        id: person.id,
        name: editForm.name.trim(),
        birthYear: editForm.birthYear ? parseInt(editForm.birthYear) : null,
        deathYear: editForm.deathYear ? parseInt(editForm.deathYear) : null,
        location: editForm.location.trim(),
        bio: editForm.bio.trim(),
        role: editForm.role,
        generation: parseInt(editForm.generation),
        photo: photoUrl,
      });
      toast.success('Person updated!');
      setEditing(false);
      setPhotoFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const editSet = (key) => (e) => setEditForm({ ...editForm, [key]: e.target.value });
  const inputCls = 'w-full px-3 py-2 rounded-lg bg-[#12121f] border border-white/10 text-sm text-gray-200 focus:border-[#e2c275]/40 focus:outline-none transition-colors';

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 animate-in slide-in-from-right duration-300">
      {/* Backdrop on mobile */}
      <div className="absolute inset-0 sm:hidden bg-black/50" onClick={onClose} />

      <div className="relative h-full bg-[#1a1a2e] border-l border-[#e2c275]/15 shadow-2xl overflow-y-auto">
        {/* Header gradient */}
        <div className="relative h-48 bg-gradient-to-b from-[#e2c275]/20 to-[#1a1a2e] flex items-end px-6 pb-6">
          <div className="absolute top-4 right-4 flex gap-2">
            {isAuthenticated && !editing && (
              <>
                <button
                  onClick={startEditing}
                  className="w-9 h-9 rounded-full bg-[#1a1a2e]/70 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#e2c275] hover:border-[#e2c275]/30 transition-all"
                  title="Edit person"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-9 h-9 rounded-full bg-[#1a1a2e]/70 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all"
                  title="Delete person"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button
              onClick={() => { setEditing(false); setConfirmDelete(false); onClose(); }}
              className="w-9 h-9 rounded-full bg-[#1a1a2e]/70 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-end gap-4">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#e2c275]/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e2c275] to-[#c4a35a] flex items-center justify-center shadow-lg">
                <span
                  className="text-[#1a1a2e] text-2xl font-bold"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {getInitials(person.name)}
                </span>
              </div>
            )}
            <div className="pb-1">
              <h2
                className="text-2xl text-white leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {person.name}
              </h2>
              {person.role && (
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#e2c275]/15 text-[#e2c275] text-xs font-medium">
                  <Award size={12} />
                  {person.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {confirmDelete && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-300 mb-3">Remove <strong>{person.name}</strong> from the family tree? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await deletePerson(person.id);
                    toast.success(`${person.name} removed`);
                    onClose();
                  } catch (err) {
                    toast.error(err.message || 'Failed to delete');
                  }
                }}
                className="flex-1 py-2 bg-red-500/80 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="px-6 py-5 space-y-6">
          {editing ? (
            /* ---- EDIT FORM ---- */
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Name *</label>
                <input type="text" value={editForm.name} onChange={editSet('name')} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Birth Year</label>
                  <input type="number" value={editForm.birthYear} onChange={editSet('birthYear')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Death Year</label>
                  <input type="number" value={editForm.deathYear} onChange={editSet('deathYear')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Location</label>
                <input type="text" value={editForm.location} onChange={editSet('location')} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Role</label>
                  <select value={editForm.role} onChange={editSet('role')} className={inputCls}>
                    <option value="">Select role</option>
                    {['Elder', 'Parent', 'Storyteller', 'Historian', 'Pioneer', 'Caretaker', 'Other'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {(editForm.role === 'Other' || (editForm.role && !['Elder', 'Parent', 'Storyteller', 'Historian', 'Pioneer', 'Caretaker', 'Other'].includes(editForm.role))) && (
                    <input
                      type="text"
                      value={editForm.role === 'Other' ? '' : editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value || 'Other' })}
                      placeholder="Type custom role..."
                      className={`${inputCls} mt-2`}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Generation</label>
                  <select value={editForm.generation} onChange={editSet('generation')} className={inputCls}>
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>Generation {g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Photo</label>
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <div className="relative group">
                      <img src={photoPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-[#e2c275]/20" />
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >✕</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#e2c275]/10 file:text-[#e2c275] file:cursor-pointer" />
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="mt-1.5 text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Bio</label>
                <textarea value={editForm.bio} onChange={editSet('bio')} rows={3} className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setPhotoFile(null); }}
                  className="px-4 py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ---- VIEW MODE ---- */
            <>
          {/* Added by */}
          {person.createdBy && (
            <p className="text-[11px] text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Added by {person.createdBy}
            </p>
          )}

          {/* Vital Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {(person.birthYear || person.deathYear) && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#e2c275]/60" />
                {person.birthYear || '?'}
                {person.deathYear ? ` \u2013 ${person.deathYear}` : ' \u2013 present'}
              </span>
            )}
            {person.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#e2c275]/60" />
                {person.location}
              </span>
            )}
          </div>

          {/* Bio */}
          {person.bio && (
            <div>
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {person.bio}
              </p>
            </div>
          )}

          {/* Connected People */}
          <div>
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-3">
              <Users size={13} />
              Family Connections ({connectedPeople.length})
            </h3>
            {connectedPeople.length > 0 && (
              <div className="space-y-2 mb-3">
                {connectedPeople.map((conn) => (
                  <div key={conn.id} className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectPerson?.(conn.person.id)}
                      className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#e2c275]/20 transition-all group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e2c275]/30 to-[#e2c275]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#e2c275] text-[10px] font-bold">
                          {getInitials(conn.person.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 group-hover:text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {conn.person.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {getRelationLabel(conn.type, conn.source)}
                      </p>
                    </div>
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await deleteConnection(conn.id);
                            toast.success('Connection removed');
                          } catch { toast.error('Failed to remove'); }
                        }}
                        className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                        title="Remove connection"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Connection */}
            {isAuthenticated && !showAddConn && (
              <button
                onClick={() => setShowAddConn(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e2c275]/30 text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/50 hover:bg-[#e2c275]/5 transition-all text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Link2 size={16} />
                Add Connection
              </button>
            )}

            {showAddConn && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[#e2c275]/15 space-y-3 mt-2">
                <p className="text-[11px] uppercase tracking-widest text-gray-500">
                  Connect {person.name} to...
                </p>

                {!newPersonMode ? (
                  <div className="space-y-2">
                    <select
                      value={connForm.targetId}
                      onChange={(e) => setConnForm({ ...connForm, targetId: e.target.value })}
                      className={inputCls}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Select a person</option>
                      {people
                        .filter((p) => p.id !== personId && !connectedPeople.some((c) => c.person.id === p.id))
                        .map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setNewPersonMode(true); setConnForm({ ...connForm, targetId: '' }); }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-dashed border-[#e2c275]/20 text-[#e2c275]/60 hover:text-[#e2c275] hover:border-[#e2c275]/40 text-sm transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      + Add a new person
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="New person's name"
                      className={inputCls}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <select
                      value={newPersonGen}
                      onChange={(e) => setNewPersonGen(parseInt(e.target.value))}
                      className={inputCls}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>Generation {g}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setNewPersonMode(false); setNewPersonName(''); }}
                      className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      ← Pick existing person instead
                    </button>
                  </div>
                )}

                <select
                  value={connForm.type}
                  onChange={(e) => setConnForm({ ...connForm, type: e.target.value })}
                  className={inputCls}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="parent-child">Parent → Child</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandparent-grandchild">Grandparent → Grandchild</option>
                  <option value="uncle/aunt-nephew/niece">Uncle/Aunt → Nephew/Niece</option>
                  <option value="cousin">Cousin</option>
                </select>

                {['parent-child', 'grandparent-grandchild', 'uncle/aunt-nephew/niece'].includes(connForm.type) && (
                  <select
                    value={connForm.direction || 'parent'}
                    onChange={(e) => setConnForm({ ...connForm, direction: e.target.value })}
                    className={inputCls}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="parent">
                      {person.name} is parent/elder of {newPersonMode ? (newPersonName.trim() || 'new person') : (people.find((p) => p.id === connForm.targetId)?.name || 'selected person')}
                    </option>
                    <option value="child">
                      {person.name} is child of {newPersonMode ? (newPersonName.trim() || 'new person') : (people.find((p) => p.id === connForm.targetId)?.name || 'selected person')}
                    </option>
                  </select>
                )}

                {(connForm.targetId || (newPersonMode && newPersonName.trim())) && (() => {
                  const targetName = newPersonMode ? newPersonName.trim() : people.find((p) => p.id === connForm.targetId)?.name;
                  const isDirectional = ['parent-child', 'grandparent-grandchild', 'uncle/aunt-nephew/niece'].includes(connForm.type);
                  const isChild = connForm.direction === 'child';
                  const parentName = isDirectional && isChild ? targetName : person.name;
                  const childName = isDirectional && isChild ? person.name : targetName;
                  return (
                    <p className="text-[11px] text-gray-500">
                      <strong className="text-gray-300">{parentName}</strong>
                      {' → '}
                      <strong className="text-[#e2c275]/70">{connForm.type}</strong>
                      {' → '}
                      <strong className="text-gray-300">{childName}</strong>
                    </p>
                  );
                })()}

                <div className="flex gap-2">
                  <button
                    disabled={(!connForm.targetId && !(newPersonMode && newPersonName.trim())) || savingConn}
                    onClick={async () => {
                      setSavingConn(true);
                      try {
                        let targetId = connForm.targetId;

                        // Create new person first if needed
                        if (newPersonMode && newPersonName.trim()) {
                          const created = await addPerson({
                            id: `person-${Date.now()}`,
                            name: newPersonName.trim(),
                            generation: newPersonGen,
                            birthYear: null,
                            deathYear: null,
                            location: '',
                            bio: '',
                            role: '',
                            photo: null,
                            stories: [],
                          });
                          targetId = created?.id;
                        }

                        if (targetId) {
                          const isDirectional = ['parent-child', 'grandparent-grandchild', 'uncle/aunt-nephew/niece'].includes(connForm.type);
                          const isChild = isDirectional && connForm.direction === 'child';
                          await addConnection({
                            id: `conn-${Date.now()}`,
                            source: isChild ? targetId : personId,
                            target: isChild ? personId : targetId,
                            type: connForm.type,
                          });
                          toast.success('Connection added!');
                        }

                        setShowAddConn(false);
                        setConnForm({ targetId: '', type: 'parent-child', direction: 'parent' });
                        setNewPersonMode(false);
                        setNewPersonName('');
                      } catch (err) {
                        toast.error(err.message || 'Failed to add connection');
                      } finally {
                        setSavingConn(false);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingConn ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    {savingConn ? 'Adding...' : 'Connect'}
                  </button>
                  <button
                    onClick={() => { setShowAddConn(false); setConnForm({ targetId: '', type: 'parent-child', direction: 'parent' }); setNewPersonMode(false); setNewPersonName(''); }}
                    className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* How are we related? */}
          {people.length > 1 && (
            <div>
              {!showPathFinder ? (
                <button
                  onClick={() => setShowPathFinder(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e2c275]/30 text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/50 hover:bg-[#e2c275]/5 transition-all text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Route size={16} />
                  How are we related?
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-[#e2c275]/15 space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500">Find relationship to...</p>
                  <select
                    value={pathTargetId}
                    onChange={async (e) => {
                      const targetId = e.target.value;
                      setPathTargetId(targetId);
                      setPathResult(null);
                      if (!targetId) return;
                      setPathLoading(true);
                      try {
                        const result = await api.get(`/api/people/${personId}/path/${targetId}`);
                        setPathResult(result);
                      } catch {
                        setPathResult({ path: [], message: 'No connection found' });
                      } finally {
                        setPathLoading(false);
                      }
                    }}
                    className={inputCls}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="">Select a person</option>
                    {people.filter((p) => p.id !== personId).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  {pathLoading && <p className="text-xs text-gray-500">Finding path...</p>}

                  {pathResult && pathResult.path && pathResult.path.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pathResult.path.map((step, i) => (
                        <span key={i} className="text-xs">
                          {step.type === 'person' ? (
                            <span className="px-2 py-1 rounded-md bg-[#e2c275]/10 text-[#e2c275] font-medium">{step.name}</span>
                          ) : (
                            <span className="text-gray-500">→ {step.type} →</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {pathResult && (!pathResult.path || pathResult.path.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No direct connection found between these people.</p>
                  )}

                  <button
                    onClick={() => { setShowPathFinder(false); setPathTargetId(''); setPathResult(null); }}
                    className="text-[11px] text-gray-500 hover:text-gray-300"
                  >Close</button>
                </div>
              )}
            </div>
          )}

          {/* Suggested connections */}
          {isAuthenticated && (() => {
            const suggestions = [];
            const existingConnIds = new Set(connectedPeople.map((c) => c.person.id));

            // Siblings: if this person shares a parent with someone, suggest sibling
            const myParentIds = connections
              .filter((c) => c.type === 'parent-child' && c.target === personId)
              .map((c) => c.source);

            myParentIds.forEach((parentId) => {
              connections
                .filter((c) => c.type === 'parent-child' && c.source === parentId && c.target !== personId)
                .forEach((c) => {
                  if (!existingConnIds.has(c.target)) {
                    const p = getPersonById(c.target);
                    if (p) suggestions.push({ person: p, type: 'sibling', reason: `Share parent ${getPersonById(parentId)?.name || ''}` });
                  }
                });
            });

            // Spouse: if this person and another both are parents of the same child, suggest spouse
            const myChildIds = connections
              .filter((c) => c.type === 'parent-child' && c.source === personId)
              .map((c) => c.target);

            myChildIds.forEach((childId) => {
              connections
                .filter((c) => c.type === 'parent-child' && c.target === childId && c.source !== personId)
                .forEach((c) => {
                  if (!existingConnIds.has(c.source) && !suggestions.some((s) => s.person.id === c.source)) {
                    const p = getPersonById(c.source);
                    if (p) suggestions.push({ person: p, type: 'spouse', reason: `Share child ${getPersonById(childId)?.name || ''}` });
                  }
                });
            });

            // Deduplicate
            const uniqueSuggestions = [];
            const seen = new Set();
            suggestions.forEach((s) => {
              if (!seen.has(s.person.id)) { seen.add(s.person.id); uniqueSuggestions.push(s); }
            });

            if (uniqueSuggestions.length === 0) return null;

            return (
              <div className="p-3 rounded-xl bg-[#e2c275]/5 border border-[#e2c275]/10">
                <p className="text-[11px] uppercase tracking-widest text-[#e2c275]/50 mb-2">Suggested Connections</p>
                <div className="space-y-1.5">
                  {uniqueSuggestions.map((s) => (
                    <div key={s.person.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-300 truncate">{s.person.name}</span>
                        <span className="text-[9px] text-gray-500 shrink-0">({s.type})</span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await addConnection({ id: `conn-${Date.now()}`, source: personId, target: s.person.id, type: s.type });
                            toast.success(`Connected as ${s.type}`);
                          } catch { toast.error('Failed to connect'); }
                        }}
                        className="shrink-0 px-2 py-1 text-[10px] text-[#e2c275] bg-[#e2c275]/10 rounded-md hover:bg-[#e2c275]/20 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-gray-600 mt-2">{uniqueSuggestions[0]?.reason}</p>
              </div>
            );
          })()}

          {/* Family subtree */}
          {!showSubtree ? (
            <button
              onClick={() => setShowSubtree(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e2c275]/30 text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/50 hover:bg-[#e2c275]/5 transition-all text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <GitBranch size={16} />
              Family of {person.name}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-[#e2c275]/15 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-widest text-gray-500">Family of {person.name}</p>
                <button onClick={() => setShowSubtree(false)} className="text-[11px] text-gray-500 hover:text-gray-300">Close</button>
              </div>

              {(() => {
                // Walk ancestors (parents of this person)
                const ancestors = [];
                const descendants = [];
                const visited = new Set([personId]);

                const walkUp = (id, depth) => {
                  connections.filter((c) => c.type === 'parent-child' && c.target === id).forEach((c) => {
                    if (!visited.has(c.source)) {
                      visited.add(c.source);
                      const p = getPersonById(c.source);
                      if (p) { ancestors.push({ person: p, depth }); walkUp(c.source, depth + 1); }
                    }
                  });
                };

                const walkDown = (id, depth) => {
                  connections.filter((c) => c.type === 'parent-child' && c.source === id).forEach((c) => {
                    if (!visited.has(c.target)) {
                      visited.add(c.target);
                      const p = getPersonById(c.target);
                      if (p) { descendants.push({ person: p, depth }); walkDown(c.target, depth + 1); }
                    }
                  });
                };

                walkUp(personId, 1);
                walkDown(personId, 1);

                return (
                  <div className="space-y-3">
                    {ancestors.length > 0 && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5">Ancestors</p>
                        {ancestors.map(({ person: p, depth }) => (
                          <button
                            key={p.id}
                            onClick={() => onSelectPerson?.(p.id)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                          >
                            <div className="w-5 h-5 rounded-full bg-[#e2c275]/20 flex items-center justify-center shrink-0">
                              <span className="text-[7px] text-[#e2c275] font-bold">{getInitials(p.name)}</span>
                            </div>
                            <span className="text-xs text-gray-300 truncate">{p.name}</span>
                            <span className="text-[9px] text-gray-600 ml-auto shrink-0">{'▲'.repeat(depth)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {descendants.length > 0 && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5">Descendants</p>
                        {descendants.map(({ person: p, depth }) => (
                          <button
                            key={p.id}
                            onClick={() => onSelectPerson?.(p.id)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                          >
                            <div className="w-5 h-5 rounded-full bg-[#e2c275]/20 flex items-center justify-center shrink-0">
                              <span className="text-[7px] text-[#e2c275] font-bold">{getInitials(p.name)}</span>
                            </div>
                            <span className="text-xs text-gray-300 truncate">{p.name}</span>
                            <span className="text-[9px] text-gray-600 ml-auto shrink-0">{'▼'.repeat(depth)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {ancestors.length === 0 && descendants.length === 0 && (
                      <p className="text-xs text-gray-500 italic">No parent-child connections found.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Stories */}
          <div>
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-3">
              <BookOpen size={13} />
              Stories ({personStories.length})
            </h3>
            {personStories.length > 0 ? (
              <div className="space-y-2">
                {personStories.map((story) => (
                  <div
                    key={story.id}
                    className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#e2c275]/20 transition-all cursor-pointer"
                  >
                    <p
                      className="text-sm text-gray-200 font-medium"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {story.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {story.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                No stories yet. Be the first to add one.
              </p>
            )}

            <button
              onClick={() => onAddStory?.(personId)}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#e2c275]/30 text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/50 hover:bg-[#e2c275]/5 transition-all text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <PlusCircle size={16} />
              Add a Story
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
