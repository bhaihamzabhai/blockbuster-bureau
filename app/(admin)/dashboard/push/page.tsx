'use client';

import AdminGuard from '@/components/admin/AdminGuard';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';
import { Bell, Send, Loader2, Users } from 'lucide-react';

interface Result {
  ok: boolean;
  total?: number;
  sent?: number;
  failed?: number;
  pruned?: number;
  message?: string;
}

/** Admin: compose + broadcast a push notification to all subscribers. */
function PushAdminPageInner() {
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    getDocs(collection(db, 'pushSubscriptions'))
      .then((snap) => setCount(snap.size))
      .catch(() => setCount(0));
  }, []);

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const user = getCurrentUser();
      if (!user) throw new Error('Not signed in');
      const token = await user.getIdToken();
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Server responded ${res.status}`);
      setResult({ ok: true, ...data });
      setTitle('');
      setBody('');
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  const valid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-gray-900 font-display text-3xl uppercase tracking-wide flex items-center gap-3">
        <Bell className="w-7 h-7 text-brand" />
        Push Notifications
      </h1>
      <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {count === null ? 'Loading subscribers…' : `${count} subscriber${count === 1 ? '' : 's'}`}
      </p>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title <span className="text-gray-400 font-normal">(max 80 chars)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            placeholder="Scream 7 trailer just dropped!"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Message <span className="text-gray-400 font-normal">(max 160 chars)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 160))}
            placeholder="Watch the breakdown on Blockbuster Bureau."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Link <span className="text-gray-400 font-normal">(tap opens this page)</span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/blog/my-article-slug"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none"
          />
        </div>

        <button
          onClick={send}
          disabled={!valid || sending}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending…' : `Send to ${count ?? '…'} subscribers`}
        </button>

        {result && (
          <div
            className={`rounded-lg p-4 text-sm ${
              result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {result.ok ? (
              <>
                Sent to <strong>{result.sent}</strong> of {result.total} subscribers
                {result.pruned ? ` (${result.pruned} dead removed)` : ''}
                {result.failed ? `, ${result.failed} failed` : ''}.
              </>
            ) : (
              <>Failed: {result.message}</>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-400 text-xs mt-4">
        Tip: send only for genuinely big stories (trailer drops, huge news) —
        too many pushes make people unsubscribe.
      </p>
    </div>
  );
}

export default function PushAdminPage() {
  return (
    <AdminGuard>
      <PushAdminPageInner />
    </AdminGuard>
  );
}
