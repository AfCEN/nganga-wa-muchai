import React, { useEffect, useState } from 'react';
import { ArrowDown, Users, BookOpen, GitBranch } from 'lucide-react';
import { useFamilyStore } from '../data/store';

function AnimatedNumber({ target, duration = 1200 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{value}</span>;
}

export default function LandingHero() {
  const { people, stories, connections } = useFamilyStore();

  const scrollToGraph = () => {
    const graphEl = document.getElementById('family-graph');
    if (graphEl) {
      graphEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #e2c275 0.5px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Warm radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#e2c275]/[0.06] rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* Small label */}
        <p
          className="text-[11px] uppercase tracking-[0.25em] text-[#e2c275]/60 mb-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          A Family Story Graph
        </p>

        {/* Family Name */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl text-white leading-[1.1] mb-6"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Nganga{' '}
          <span className="bg-gradient-to-r from-[#e2c275] to-[#c4a35a] bg-clip-text text-transparent">
            wa Muchai
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Our stories, our heritage, our roots &mdash; woven together across generations and continents.
        </p>

        {/* Intro paragraph */}
        <p
          className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed mb-10"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          This is a living archive of the Nganga wa Muchai family. Here, every name carries a story,
          every connection maps a bond, and every timeline entry marks a moment that shaped who we are.
          Explore the graph, read the stories, and add your own.
        </p>

        {/* Animated Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 mb-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users size={18} className="text-[#e2c275]/60" />
              <span
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedNumber target={people.length} />
              </span>
            </div>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              People
            </p>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BookOpen size={18} className="text-[#e2c275]/60" />
              <span
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedNumber target={stories.length} />
              </span>
            </div>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Stories
            </p>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <GitBranch size={18} className="text-[#e2c275]/60" />
              <span
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <AnimatedNumber target={connections.length} />
              </span>
            </div>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Connections
            </p>
          </div>
        </div>

        {/* Begin Exploring Button */}
        <button
          onClick={scrollToGraph}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e2c275] text-[#1a1a2e] rounded-xl font-semibold text-sm hover:bg-[#f0d68a] transition-all duration-300 shadow-xl shadow-[#e2c275]/20 hover:shadow-[#e2c275]/30 hover:-translate-y-0.5 mb-12"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Begin Exploring
          <ArrowDown size={18} className="animate-bounce" />
        </button>

        {/* Quote */}
        <div className="max-w-md mx-auto">
          <div className="w-8 h-px bg-[#e2c275]/30 mx-auto mb-4" />
          <blockquote
            className="text-base sm:text-lg text-gray-400 italic leading-relaxed"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            &ldquo;There is no right place to begin. There is no wrong turn.&rdquo;
          </blockquote>
          <div className="w-8 h-px bg-[#e2c275]/30 mx-auto mt-4" />
        </div>
      </div>
    </section>
  );
}
