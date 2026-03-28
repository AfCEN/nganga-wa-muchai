import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Users, BookOpen, GitBranch, Plus, LogOut, LogIn, UserPlus, Copy, Check } from 'lucide-react';
import { useFamilyStore } from '../data/store';
import { useAuth } from '../data/auth';
import { api } from '../data/api';
import { useToast } from './Toast';

const navLinks = [
  { to: '/', label: 'Graph', icon: GitBranch },
  { to: '/timeline', label: 'Timeline', icon: null },
  { to: '/stories', label: 'Stories', icon: BookOpen },
  { to: '/trails', label: 'Story Trails', icon: null },
];

export default function Navbar({ onContributeClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { people, stories, connections } = useFamilyStore();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    try {
      const invite = await api.post('/api/auth/invites', {});
      const link = `${window.location.origin}/join?code=${invite.code}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Invite link copied to clipboard! Share it with a family member.');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Failed to create invite link');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-md border-b border-[#e2c275]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Family Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e2c275] to-[#c4a35a] flex items-center justify-center">
              <span className="text-[#1a1a2e] font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                N
              </span>
            </div>
            <span
              className="text-[#e2c275] text-xl tracking-wide group-hover:text-[#f0d68a] transition-colors"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Nganga wa Muchai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-[#e2c275]/15 text-[#e2c275]'
                    : 'text-gray-400 hover:text-[#e2c275]/80 hover:bg-white/5'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Stats + Contribute */}
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-4 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="flex items-center gap-1">
                <Users size={13} className="text-[#e2c275]/60" />
                <span className="text-gray-400">{people.length}</span> people
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={13} className="text-[#e2c275]/60" />
                <span className="text-gray-400">{stories.length}</span> stories
              </span>
              <span className="flex items-center gap-1">
                <GitBranch size={13} className="text-[#e2c275]/60" />
                <span className="text-gray-400">{connections.length}</span> links
              </span>
            </div>

            <button
              onClick={onContributeClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#e2c275] text-[#1a1a2e] rounded-lg text-sm font-semibold hover:bg-[#f0d68a] transition-all duration-200 shadow-lg shadow-[#e2c275]/20 hover:shadow-[#e2c275]/30"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Plus size={16} />
              Contribute
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {user?.displayName}
                </span>
                <button
                  onClick={handleInvite}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-[#e2c275] transition-colors rounded-lg hover:bg-white/5"
                  title={copied ? 'Invite link copied!' : 'Invite a family member'}
                >
                  {copied ? <Check size={15} className="text-green-400" /> : <UserPlus size={15} />}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-[#e2c275] transition-colors rounded-lg hover:bg-white/5"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-[#e2c275] transition-colors rounded-lg hover:bg-white/5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <LogIn size={15} />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-[#e2c275] transition-colors p-2"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a1a2e] border-t border-[#e2c275]/10 animate-in slide-in-from-top">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-[#e2c275]/15 text-[#e2c275]'
                    : 'text-gray-400 hover:text-[#e2c275]/80 hover:bg-white/5'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>{people.length} people</span>
                <span>{stories.length} stories</span>
                <span>{connections.length} links</span>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileOpen(false);
                onContributeClick?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e2c275] text-[#1a1a2e] rounded-lg text-sm font-semibold hover:bg-[#f0d68a] transition-all mt-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Plus size={16} />
              Contribute
            </button>

            {isAuthenticated ? (
              <div className="flex items-center justify-between px-4 py-2 mt-2">
                <span className="text-sm text-gray-300">{user?.displayName}</span>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="text-sm text-gray-400 hover:text-[#e2c275] transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-3 mt-2 text-sm text-[#e2c275] hover:text-[#f0d68a] transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
