'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: 'leaderboard' | 'rectangle' | 'skyscraper' | 'in-article';
  className?: string;
}

const AD_SIZES: Record<string, { width: number; height: number; label: string }> = {
  leaderboard: { width: 728, height: 90, label: 'Leaderboard (728x90)' },
  rectangle: { width: 300, height: 250, label: 'Rectangle (300x250)' },
  skyscraper: { width: 160, height: 600, label: 'Skyscraper (160x600)' },
  'in-article': { width: 0, height: 0, label: 'In-Article (Responsive)' },
};

const AD_SLOTS: Record<string, string> = {
  leaderboard: '1234567890',
  rectangle: '0987654321',
  skyscraper: '1122334455',
  'in-article': '5566778899',
};

export default function AdUnit({ slot, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSize = AD_SIZES[slot];

  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;

    try {
      // Push ad to Google AdSense
      ((window as unknown as Record<string, unknown[]>).adsbygoogle = (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [clientId]);

  // Show placeholder in development or when no client ID
  if (!clientId) {
    return (
      <div
        className={`border border-dashed border-gold/30 rounded-lg flex items-center justify-center bg-gold/5 ${className}`}
        style={
          slot === 'in-article'
            ? { minHeight: '100px', width: '100%' }
            : { width: adSize.width, height: adSize.height }
        }
      >
        <div className="text-center p-4">
          <p className="text-gold/50 text-xs uppercase tracking-wider">Advertisement</p>
          <p className="text-gold/30 text-xs mt-1">{adSize.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={AD_SLOTS[slot]}
        data-ad-format={slot === 'in-article' ? 'auto' : undefined}
        data-full-responsive-width={slot === 'in-article' ? 'true' : undefined}
      />
    </div>
  );
}