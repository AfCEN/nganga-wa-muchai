import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, User, Tag, Users, Trash2 } from 'lucide-react';
import { useFamilyStore } from '../data/store';
import { useAuth } from '../data/auth';
import { useToast } from './Toast';

const TYPE_STYLES = {
  memory: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  tradition: { bg: 'bg-[#e2c275]/10', text: 'text-[#e2c275]', border: 'border-[#e2c275]/20' },
  migration: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  milestone: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export default function StoryCard({ story }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { getPersonById, deleteStory } = useFamilyStore();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const linkedPeople = (story.personIds || [])
    .map((id) => getPersonById(id))
    .filter(Boolean);

  const typeStyle = TYPE_STYLES[story.type] || TYPE_STYLES.memory;
  const preview = story.content.length > 200 ? story.content.slice(0, 200) + '...' : story.content;

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsExpanded(true)}
        className="group bg-[#1a1a2e]/80 border border-[#e2c275]/10 rounded-2xl p-5 hover:border-[#e2c275]/25 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#e2c275]/5"
      >
        {/* Type badge + date */}
        <div className="flex items-center justify-between mb-3">
          {story.type && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {story.type}
            </span>
          )}
          {story.date && (
            <span className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Calendar size={12} />
              {story.date}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-lg text-white group-hover:text-[#e2c275] transition-colors mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {story.title}
        </h3>

        {/* Content preview */}
        <p className="text-sm text-gray-400 leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          {preview}
        </p>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-gray-500 text-[11px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: author + linked people */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {story.author && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              <User size={12} />
              {story.author}
            </span>
          )}

          {linkedPeople.length > 0 && (
            <div className="flex items-center gap-1">
              {linkedPeople.slice(0, 4).map((person) => (
                <div
                  key={person.id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e2c275]/40 to-[#e2c275]/15 flex items-center justify-center border border-[#e2c275]/20"
                  title={person.name}
                >
                  <span className="text-[8px] text-[#e2c275] font-bold">
                    {getInitials(person.name)}
                  </span>
                </div>
              ))}
              {linkedPeople.length > 4 && (
                <span className="text-[10px] text-gray-500 ml-1">
                  +{linkedPeople.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />

          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1a1a2e] border border-[#e2c275]/15 rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/5 px-6 py-4 flex items-start justify-between z-10">
              <div>
                {story.type && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} mb-2`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {story.type}
                  </span>
                )}
                <h2
                  className="text-2xl text-white"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {story.title}
                </h2>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                {isAuthenticated && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all"
                    title="Delete story"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => { setIsExpanded(false); setConfirmDelete(false); }}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Delete confirmation */}
            {confirmDelete && (
              <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300 mb-3">Delete "<strong>{story.title}</strong>"? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await deleteStory(story.id);
                        toast.success('Story deleted');
                        setIsExpanded(false);
                        setConfirmDelete(false);
                      } catch (err) {
                        toast.error(err.message || 'Failed to delete');
                      }
                    }}
                    className="flex-1 py-2 bg-red-500/80 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
                  >
                    Yes, delete
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

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                {story.author && (
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {story.author}
                  </span>
                )}
                {story.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {story.date}
                  </span>
                )}
              </div>

              {/* Full content */}
              <div
                className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.938rem' }}
              >
                {story.content}
              </div>

              {/* Tags */}
              {story.tags && story.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-xs"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Tag size={11} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Linked People */}
              {linkedPeople.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-3">
                    <Users size={13} />
                    People in this story
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {linkedPeople.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => navigate(`/?person=${person.id}`)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-[#e2c275]/10 hover:border-[#e2c275]/20 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e2c275]/40 to-[#e2c275]/15 flex items-center justify-center">
                          <span className="text-[8px] text-[#e2c275] font-bold">
                            {getInitials(person.name)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-300 hover:text-[#e2c275] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {person.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
