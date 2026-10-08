'use client';

import AdminGuard from '@/components/admin/AdminGuard';

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
import { MessageSquare, Trash2, Loader2, Mail } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: any;
}

function MessagesAdminPageInner() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'))
      );
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) })));
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await deleteDoc(doc(db, 'contactMessages', id));
    setMessages(messages.filter((m) => m.id !== id));
  };

  const fmtDate = (ts: any) => {
    try {
      return ts?.toDate ? ts.toDate().toLocaleString('en-US') : '';
    } catch {
      return '';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <MessageSquare className="w-6 h-6 text-brand-dark" /> Contact Messages
      </h1>
      <p className="text-gray-500 mb-8">
        Messages from the <span className="font-medium">/contact</span> page form.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const isOpen = expanded === m.id;
            return (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                    className="text-left flex-1 min-w-0"
                  >
                    <p className="font-bold text-gray-900 truncate">
                      {m.subject || '(no subject)'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {m.name} · {m.email} · {fmtDate(m.createdAt)}
                    </p>
                    {!isOpen && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-1">{m.message}</p>
                    )}
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'your message')}`}
                      className="p-2 text-gray-400 hover:text-brand transition-colors"
                      title="Reply by email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => remove(m.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <p className="text-gray-700 text-sm mt-4 pt-4 border-t border-gray-100 whitespace-pre-wrap">
                    {m.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MessagesAdminPage() {
  return (
    <AdminGuard>
      <MessagesAdminPageInner />
    </AdminGuard>
  );
}
