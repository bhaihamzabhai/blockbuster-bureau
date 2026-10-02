'use client';

import { useEffect, useState } from 'react';

/** Thin reading-progress bar fixed at the top of the viewport. */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[90] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-dark via-brand to-brand-light transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
