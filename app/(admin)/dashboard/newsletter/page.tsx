'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, Download, Trash2, Loader2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  createdAt: any;
  source?: string;
}

export default function NewsletterAdminPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'newsletter_subscribers'), orderBy('createdAt', 'desc'))
      );
      setSubs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subscriber, 'id'>) })));
    } catch (e) {
      console.error('Failed to load subscribers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const exportCsv = () => {
    const rows = ['email,subscribed_at,source'];
    subs.forEach((s) => {
      const date = s.createdAt?.toDate ? s.createdAt.toDate().toISOString() : '';
      rows.push(`${s.email},${date},${s.source || ''}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    await deleteDoc(doc(db, 'newsletter_subscribers', id));
    setSubs(subs.filter((s) => s.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-900">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-brand-dark" /> Newsletter Subscribers
        </h1>
        {subs.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-sm bg-brand/10 hover:bg-brand/20 text-brand-dark font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>
      <p className="text-gray-500 mb-8">
        {subs.length} subscriber{subs.length === 1 ? '' : 's'} — emails collected from the homepage signup form.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Subscribed</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-3 text-gray-900 font-medium">{s.email}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => remove(s.id)}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      aria-label={`Remove ${s.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
