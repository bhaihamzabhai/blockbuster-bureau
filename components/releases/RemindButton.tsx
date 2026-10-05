'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';

const KEY = 'bbb-reminders';

export interface Reminder {
  title: string;
  releaseDate: string; // YYYY-MM-DD
  poster?: string | null;
  notified?: boolean;
}

export function getReminders(): Record<string, Reminder> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveReminders(all: Record<string, Reminder>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

/**
 * "Remind me" bell — saves the movie locally. When its release date
 * arrives, ReminderChecker shows an "Out now!" banner on the next visit.
 */
export default function RemindButton({
  id,
  title,
  releaseDate,
  poster,
}: {
  id: number;
  title: string;
  releaseDate: string;
  poster?: string | null;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(!!getReminders()[String(id)]);
  }, [id]);

  const toggle = () => {
    const all = getReminders();
    const k = String(id);
    if (all[k]) {
      delete all[k];
    } else {
      all[k] = { title, releaseDate, poster };
    }
    saveReminders(all);
    setOn(!on);
  };

  return (
    <button
      onClick={toggle}
      title={on ? 'Reminder set — click to remove' : 'Remind me when it releases'}
      className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-bold transition-colors ${
        on
          ? 'bg-brand/10 text-brand-dark hover:bg-brand/20'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {on ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
      {on ? 'Reminder on' : 'Remind me'}
    </button>
  );
}
