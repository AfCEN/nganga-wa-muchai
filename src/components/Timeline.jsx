import React, { useState, useMemo } from 'react';
import { Filter, Calendar, Users, ChevronDown } from 'lucide-react';
import { useFamilyStore } from '../data/store';

const EVENT_TYPE_COLORS = {
  birth: '#6b8f71',
  death: '#8b6f6f',
  marriage: '#e07a7a',
  migration: '#7ab8e0',
  milestone: '#e2c275',
  tradition: '#c4a35a',
  other: '#888',
};

export default function Timeline() {
  const { events, people, getPersonById } = useFamilyStore();
  const [filterPerson, setFilterPerson] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const eventTypes = useMemo(
    () => [...new Set(events.map((e) => e.type).filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (filterPerson) {
      result = result.filter((e) => e.personIds?.includes(filterPerson));
    }
    if (filterType) {
      result = result.filter((e) => e.type === filterType);
    }

    return result.sort((a, b) => a.year - b.year);
  }, [events, filterPerson, filterType]);

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl sm:text-4xl text-white mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Family Timeline
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          Trace the footsteps of our family through the years. Every event is a thread in the tapestry of who we are.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-[#e2c275] hover:border-[#e2c275]/30 transition-all text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Filter size={15} />
          Filters
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Person</label>
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-sm text-gray-300 focus:border-[#e2c275]/40 focus:outline-none transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">All people</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-1.5">Event type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-sm text-gray-300 focus:border-[#e2c275]/40 focus:outline-none transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">All types</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {(filterPerson || filterType) && (
              <button
                onClick={() => {
                  setFilterPerson('');
                  setFilterType('');
                }}
                className="self-end px-3 py-2 text-xs text-[#e2c275] hover:underline"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            No events to display.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Central gold line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#e2c275]/40 to-transparent transform -translate-x-1/2 hidden sm:block" />
          {/* Mobile line on the left */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#e2c275]/40 to-transparent sm:hidden" />

          <div className="space-y-8 sm:space-y-12">
            {filteredEvents.map((event, index) => {
              const isLeft = index % 2 === 0;
              const eventColor = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.other;
              const eventPeople = (event.personIds || [])
                .map((id) => getPersonById(id))
                .filter(Boolean);

              return (
                <div key={event.id} className="relative">
                  {/* Dot on the line */}
                  <div
                    className="absolute w-4 h-4 rounded-full border-2 border-[#1a1a2e] z-10 left-[18px] sm:left-1/2 sm:-translate-x-1/2 top-6"
                    style={{ backgroundColor: eventColor }}
                  />
                  {/* Glow behind dot */}
                  <div
                    className="absolute w-8 h-8 rounded-full left-[14px] sm:left-1/2 sm:-translate-x-1/2 top-4 blur-md opacity-30"
                    style={{ backgroundColor: eventColor }}
                  />

                  {/* Content card */}
                  <div
                    className={`relative pl-14 sm:pl-0 sm:w-[45%] ${
                      isLeft
                        ? 'sm:mr-auto sm:pr-8 sm:text-right'
                        : 'sm:ml-auto sm:pl-8 sm:text-left'
                    }`}
                  >
                    <div className="bg-[#1a1a2e]/80 border border-[#e2c275]/10 rounded-2xl p-5 hover:border-[#e2c275]/25 transition-all">
                      {/* Year */}
                      <span
                        className="text-3xl font-bold bg-gradient-to-r from-[#e2c275] to-[#c4a35a] bg-clip-text text-transparent"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {event.year}
                      </span>

                      {/* Type badge */}
                      {event.type && (
                        <span
                          className="inline-block ml-3 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border"
                          style={{
                            color: eventColor,
                            borderColor: `${eventColor}33`,
                            backgroundColor: `${eventColor}15`,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {event.type}
                        </span>
                      )}

                      {/* Title */}
                      <h3
                        className="text-lg text-white mt-2"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {event.title}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <p
                          className="text-sm text-gray-400 mt-2 leading-relaxed"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {event.description}
                        </p>
                      )}

                      {/* Connected People */}
                      {eventPeople.length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 mt-3 ${isLeft ? 'sm:justify-end' : ''}`}>
                          {eventPeople.map((person) => (
                            <span
                              key={person.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-gray-400"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              <Users size={10} className="text-[#e2c275]/50" />
                              {person.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
