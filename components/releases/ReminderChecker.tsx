'use client';

import { useEffect, useState } from 'react';
import { PartyPopper, X } from 'lucide-react';
import { getReminders } from './RemindButton';

/**
 * On every visit, checks saved "Remind me" movies: any whose release date
 * has arrived get a celebratory "Out now!" banner (once each).
 */
export default function ReminderChecker() {
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    const all = getReminders();
    const today = new Date().toISOString().slice(0, 10);
    const due = Object.entries(all).filter(
      ([, r]) => !r.notified && r.releaseDate && r.releaseDate <= today
    );
    if (due.length === 0) return;
    setTitles(due.map(([, r]) => r.title));
    const updated = { ...all };
    due.forEach(([k, r]) => {
      updated[k] = { ...r, notified: true };
    });
    try {
      localStorage.setItem('bbb-reminders', JSON.stringify(updated));
    } catch {}
  }, []);

  if (titles.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-brand to-brand-dark p-[1px]">
      <div className="rounded-[11px] bg-white px-4 py-3.5 flex items-start gap-3">
        <span className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <PartyPopper className="w-5 h-5 text-brand-dark" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-bold text-sm">
            {titles.length === 1 ? 'It\'s out now!' : 'They\'re out now!'}
          </p>
          <p className="text-gray-600 text-sm mt-0.5">
            {titles.slice(0, 3).join(', ')}
            {titles.length > 3 ? ` +${titles.length - 3} more` : ''} — you asked
            to be reminded. Enjoy the show! 🎬
          </p>
        </div>
        <button
          onClick={() => setTitles([])}
          aria-label="Dismiss"
          className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
