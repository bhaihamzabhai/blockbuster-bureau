'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ImageOff, Sparkles, Loader2 } from 'lucide-react';

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; width: number; height: number }
  | { kind: 'small'; width: number; height: number }
  | { kind: 'unknown' };

/**
 * Google Discover needs cover images >= 1200px wide. Shows the actual
 * dimensions of the cover URL and warns when it's too small. For YouTube
 * hqdefault thumbnails (480px) offers a one-click HD upgrade attempt
 * (maxresdefault = 1280px), with graceful fallback if it doesn't exist.
 */
export default function CoverDiscoverBadge({
  url,
  onUpgrade,
}: {
  url: string;
  onUpgrade: (newUrl: string) => void;
}) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [hdState, setHdState] = useState<'idle' | 'trying' | 'missing'>('idle');

  useEffect(() => {
    if (!url) {
      setStatus({ kind: 'idle' });
      return;
    }
    setStatus({ kind: 'checking' });
    setHdState('idle');
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const { naturalWidth: w, naturalHeight: h } = img;
      setStatus(w >= 1200 ? { kind: 'ok', width: w, height: h } : { kind: 'small', width: w, height: h });
    };
    img.onerror = () => {
      if (alive) setStatus({ kind: 'unknown' });
    };
    img.src = url;
    return () => {
      alive = false;
    };
  }, [url]);

  if (!url || status.kind === 'idle') return null;

  const isYtThumb = /i\.ytimg\.com\/vi\/[^/]+\/hqdefault\.jpg/i.test(url);

  const tryHd = () => {
    const hd = url.replace(/hqdefault\.jpg$/i, 'maxresdefault.jpg');
    setHdState('trying');
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth >= 1200) {
        onUpgrade(hd);
        setHdState('idle');
      } else {
        setHdState('missing');
      }
    };
    img.onerror = () => setHdState('missing');
    img.src = hd;
  };

  return (
    <div className="mt-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-center gap-2.5 flex-wrap">
      {status.kind === 'checking' && (
        <>
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          <span className="text-xs text-gray-500">Checking image size…</span>
        </>
      )}
      {status.kind === 'ok' && (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-xs text-gray-700">
            <strong>{status.width}×{status.height}px</strong> — Discover-ready ✓
          </span>
        </>
      )}
      {status.kind === 'small' && (
        <>
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs text-gray-700">
            <strong>{status.width}×{status.height}px</strong> — too small for
            Google Discover (needs 1200px+)
          </span>
          {isYtThumb && hdState !== 'missing' && (
            <button
              onClick={tryHd}
              disabled={hdState === 'trying'}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand text-white text-[11px] font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              {hdState === 'trying' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {hdState === 'trying' ? 'Trying…' : 'Try HD version'}
            </button>
          )}
          {hdState === 'missing' && (
            <span className="ml-auto text-[11px] text-gray-400">
              No HD version for this video — use a custom cover
            </span>
          )}
        </>
      )}
      {status.kind === 'unknown' && (
        <>
          <ImageOff className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500">
            Couldn&apos;t load image to check its size
          </span>
        </>
      )}
    </div>
  );
}
