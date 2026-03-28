import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../data/auth';
import { api } from '../data/api';

// ── Login Page (sign in only) ──
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[#e2c275] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Sign in to contribute to the family tree.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="Your password" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold hover:bg-[#f0d68a] transition-all duration-200 shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account? Ask a family member for an invite link.
        </p>
        <p className="text-center mt-2">
          <Link to="/" className="text-[#e2c275]/70 hover:text-[#e2c275] transition-colors text-sm">
            Continue browsing without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Setup Page (first admin, only when no users exist) ──
export function SetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(null);
  const { setup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/auth/setup-status')
      .then((data) => {
        if (!data.needsSetup) navigate('/login');
        else setNeedsSetup(true);
      })
      .catch(() => setNeedsSetup(false));
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await setup(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Setup failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (needsSetup === null) return null;
  if (!needsSetup) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[#e2c275] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome, Family Admin
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          You're the first one here. Create your admin account to get started. You'll be able to invite other family members.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold hover:bg-[#f0d68a] transition-all duration-200 shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Creating account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Join Page (signup with invite code from URL) ──
export function JoinPage() {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState(inviteCode);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Invite code is required');
      return;
    }
    setSubmitting(true);
    try {
      await signup(email, password, displayName, code.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to join');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[#e2c275] mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Join the Family
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          You've been invited to join the Nganga wa Muchai family archive.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Invite Code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="Paste your invite code" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 bg-[#22223a] border border-[#e2c275]/20 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#e2c275]/50 transition-colors"
              placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold hover:bg-[#f0d68a] transition-all duration-200 shadow-lg shadow-[#e2c275]/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Joining...' : 'Join the Family'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-[#e2c275]/70 hover:text-[#e2c275] transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
