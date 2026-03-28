import { useState, useEffect } from 'react';
import { Shield, Users, Mail, ChevronDown } from 'lucide-react';
import { api } from '../data/api';
import { useAuth } from '../data/auth';
import { useToast } from './Toast';

export default function AdminPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/auth/users').catch(() => []),
      api.get('/api/auth/invites').catch(() => []),
    ]).then(([u, i]) => {
      setUsers(u);
      setInvites(i);
    }).finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Shield size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">Admin access required.</p>
      </div>
    );
  }

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const updated = await api.put(`/api/auth/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-semibold text-[#e2c275] mb-2">
        Admin Panel
      </h1>
      <p className="text-gray-400 mb-8">Manage users and invites.</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Users */}
          <div className="mb-10">
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-4">
              <Users size={14} /> Members ({users.length})
            </h2>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <p className="text-sm text-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {u.displayName}
                    </p>
                    <p className="text-[11px] text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      u.role === 'admin'
                        ? 'bg-[#e2c275]/15 text-[#e2c275] border border-[#e2c275]/20'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {u.role}
                    </span>
                    {u.id !== user.id && (
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        className="text-[11px] text-gray-500 hover:text-[#e2c275] transition-colors"
                      >
                        {u.role === 'admin' ? 'Make member' : 'Make admin'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invites */}
          <div>
            <h2 className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-4">
              <Mail size={14} /> Your Invites ({invites.length})
            </h2>
            {invites.length === 0 ? (
              <p className="text-sm text-gray-600 italic">No invites created yet. Use the invite button in the navbar.</p>
            ) : (
              <div className="space-y-2">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div>
                      <p className="text-sm text-gray-300 font-mono">{inv.code}</p>
                      {inv.email && <p className="text-[11px] text-gray-500">For: {inv.email}</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      inv.used
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {inv.used ? 'Used' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
