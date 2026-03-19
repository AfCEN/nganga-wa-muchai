import React from 'react';
import { X, MapPin, Calendar, BookOpen, Users, PlusCircle, Award } from 'lucide-react';
import { useFamilyStore } from '../data/store';

export default function PersonCard({ personId, onClose, onSelectPerson, onAddStory }) {
  const { getPersonById, getStoriesForPerson, getConnectionsForPerson, people } = useFamilyStore();

  if (!personId) return null;

  const person = getPersonById(personId);
  if (!person) return null;

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
      default:
        return type;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 animate-in slide-in-from-right duration-300">
      {/* Backdrop on mobile */}
      <div className="absolute inset-0 sm:hidden bg-black/50" onClick={onClose} />

      <div className="relative h-full bg-[#1a1a2e] border-l border-[#e2c275]/15 shadow-2xl overflow-y-auto">
        {/* Header gradient */}
        <div className="relative h-48 bg-gradient-to-b from-[#e2c275]/20 to-[#1a1a2e] flex items-end px-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1a1a2e]/70 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <X size={18} />
          </button>

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

        <div className="px-6 py-5 space-y-6">
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
          {connectedPeople.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-3">
                <Users size={13} />
                Family Connections
              </h3>
              <div className="space-y-2">
                {connectedPeople.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => onSelectPerson?.(conn.person.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#e2c275]/20 transition-all group text-left"
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
                ))}
              </div>
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
        </div>
      </div>
    </div>
  );
}
