'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import AdminGuard from '@/components/admin/AdminGuard';
import { Users, ShieldCheck, PenLine, UserX, RefreshCw } from 'lucide-react';

interface TeamUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'none' | 'editor' | 'admin';
  disabled: boolean;
  createdAt: number | null;
  lastLoginAt: number | null;
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

function TeamPageInner() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authedFetch('/api/admin/team');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRole = async (uid: string, role: 'none' | 'editor' | 'admin') => {
    setSavingUid(uid);
    setNotice('');
    setError('');
    try {
      const res = await authedFetch('/api/admin/team', {
        method: 'POST',
        body: JSON.stringify({ uid, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      const who = users.find((u) => u.uid === uid)?.email || 'User';
      setNotice(
        role === 'none'
          ? `${who} ki access hata di gayi.`
          : `${who} ko ${role === 'admin' ? 'Admin' : 'Editor'} bana diya. Unhein sign out karke dobara sign in karna hoga.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    } finally {
      setSavingUid(null);
    }
  };

  const roleBadge = (role: TeamUser['role']) => {
    if (role === 'admin')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <ShieldCheck size={13} /> Admin
        </span>
      );
    if (role === 'editor')
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <PenLine size={13} /> Editor
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <UserX size={13} /> No access
      </span>
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} /> Team Access
        </h1>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Kisi ko access dene ke liye: pehle woh <strong>/login</strong> par Google se
        sign in kare (ek baar), phir yahan uska naam aayega — role select karke{' '}
        <strong>Editor</strong> bana dein. Editor sirf articles likh/edit/publish kar
        sakta hai; Settings, Newsletter, Messages aur Push Alerts usko nazar nahi aayenge.
        Role change ke baad usko <strong>sign out karke dobara sign in</strong> karna hoga.
      </p>

      {notice && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Koi user nahi mila. Pehle us shakhs se /login par Google sign-in karwayein.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {users.map((u, i) => (
            <div
              key={u.uid}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 ${
                i > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {u.displayName || u.email || u.uid}
                </div>
                {u.displayName && (
                  <div className="text-sm text-gray-500 truncate">{u.email}</div>
                )}
                <div className="mt-1">{roleBadge(u.role)}</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Role:</label>
                <select
                  value={u.role}
                  disabled={savingUid === u.uid}
                  onChange={(e) =>
                    setRole(u.uid, e.target.value as TeamUser['role'])
                  }
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  <option value="none">No access</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                {savingUid === u.uid && (
                  <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <AdminGuard>
      <TeamPageInner />
    </AdminGuard>
  );
}
