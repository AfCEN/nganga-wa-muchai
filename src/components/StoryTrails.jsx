import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X, BookOpen, ChevronRight, MapPin, User, Tag } from 'lucide-react';
import { useFamilyStore } from '../data/store';

function TrailViewer({ trail, stories, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getPersonById } = useFamilyStore();

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  const linkedPeople = (currentStory.personIds || [])
    .map((id) => getPersonById(id))
    .filter(Boolean);

  const progress = ((currentIndex + 1) / stories.length) * 100;

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e1a]/95 backdrop-blur-md flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <X size={18} />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#e2c275]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Story Trail
            </p>
            <h2 className="text-white text-sm font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              {trail.title}
            </h2>
          </div>
        </div>

        <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          {currentIndex + 1} of {stories.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#e2c275] to-[#c4a35a] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Story Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Story type + date */}
          <div className="flex items-center gap-3 mb-4">
            {currentStory.type && (
              <span className="px-2.5 py-1 rounded-full bg-[#e2c275]/10 text-[#e2c275] text-[11px] font-medium border border-[#e2c275]/20">
                {currentStory.type}
              </span>
            )}
            {currentStory.date && (
              <span className="text-xs text-gray-500">{currentStory.date}</span>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl text-white mb-6 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {currentStory.title}
          </h1>

          {/* Author */}
          {currentStory.author && (
            <p className="flex items-center gap-2 text-sm text-gray-500 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              <User size={14} />
              Told by {currentStory.author}
            </p>
          )}

          {/* Content */}
          <div
            className="text-gray-300 leading-[1.85] whitespace-pre-wrap"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem' }}
          >
            {currentStory.content}
          </div>

          {/* Tags */}
          {currentStory.tags && currentStory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
              {currentStory.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-gray-500 text-xs"
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
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-3">People mentioned</p>
              <div className="flex flex-wrap gap-2">
                {linkedPeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e2c275]/40 to-[#e2c275]/15 flex items-center justify-center">
                      <span className="text-[8px] text-[#e2c275] font-bold">
                        {getInitials(person.name)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {person.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1.5">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-[#e2c275] w-6'
                  : i < currentIndex
                  ? 'bg-[#e2c275]/40'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(stories.length - 1, i + 1))}
          disabled={currentIndex === stories.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e2c275] text-[#1a1a2e] font-semibold hover:bg-[#f0d68a] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function StoryTrails() {
  const { storyTrails, stories } = useFamilyStore();
  const [activeTrail, setActiveTrail] = useState(null);

  const getTrailStories = (trail) =>
    (trail.storyIds || [])
      .map((id) => stories.find((s) => s.id === id))
      .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl sm:text-4xl text-white mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Story Trails
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          Follow curated paths through our family history. Each trail weaves together stories
          that illuminate a theme, a journey, or a generation.
        </p>
      </div>

      {/* Trail Cards */}
      {storyTrails.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            No story trails yet. Trails are curated journeys through connected stories.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {storyTrails.map((trail) => {
            const trailStories = getTrailStories(trail);

            return (
              <button
                key={trail.id}
                onClick={() => setActiveTrail(trail)}
                className="group text-left bg-[#1a1a2e]/80 border border-[#e2c275]/10 rounded-2xl p-6 hover:border-[#e2c275]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#e2c275]/5"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e2c275]/20 to-[#e2c275]/5 border border-[#e2c275]/15 flex items-center justify-center mb-4 group-hover:from-[#e2c275]/30 transition-all">
                  <BookOpen size={20} className="text-[#e2c275]" />
                </div>

                {/* Title */}
                <h3
                  className="text-xl text-white group-hover:text-[#e2c275] transition-colors mb-2"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {trail.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {trail.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {trailStories.length} {trailStories.length === 1 ? 'story' : 'stories'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#e2c275]/70 group-hover:text-[#e2c275] transition-colors">
                    Begin trail
                    <ChevronRight size={14} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Trail Viewer */}
      {activeTrail && (
        <TrailViewer
          trail={activeTrail}
          stories={getTrailStories(activeTrail)}
          onClose={() => setActiveTrail(null)}
        />
      )}
    </div>
  );
}
