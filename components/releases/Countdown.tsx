'use client';

import { useEffect, useState } from 'react';

function parts(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
    done: diff <= 0,
  };
}

/** Live ticking countdown (DD:HH:MM:SS) to a YYYY-MM-DD release date. */
export default function Countdown({ releaseDate }: { releaseDate: string }) {
  const target = new Date(releaseDate + 'T00:00:00').getTime();
  const [t, setT] = useState(() => parts(target));

  useEffect(() => {
    if (t.done) return;
    const id = setInterval(() => setT(parts(target)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, t.done]);

  if (t.done) {
    return (
      <div className="mt-2 rounded-md bg-green-600 py-1.5 text-center">
        <span className="text-white text-xs font-extrabold uppercase tracking-widest">
          Out now
        </span>
      </div>
    );
  }

  const cells: Array<[number, string]> = [
    [t.d, 'Days'],
    [t.h, 'Hrs'],
    [t.m, 'Min'],
    [t.s, 'Sec'],
  ];

  return (
    <div className="flex gap-1 mt-2" aria-label="Countdown to release">
      {cells.map(([v, label]) => (
        <div key={label} className="flex-1 bg-gray-900 rounded-md py-1 text-center">
          <div className="text-white text-sm font-extrabold tabular-nums leading-none">
            {String(v).padStart(2, '0')}
          </div>
          <div className="text-gray-400 text-[9px] uppercase tracking-wide mt-0.5">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
