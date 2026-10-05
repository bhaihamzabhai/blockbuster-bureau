'use client';

import { useEffect } from 'react';

/** Registers /sw.js once. Silent — no UI. */
export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
