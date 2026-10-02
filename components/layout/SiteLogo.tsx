'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Site logo. Uses /logo.png when it exists in /public,
 * otherwise falls back to a styled text logo.
 */
export default function SiteLogo({ size = 'md' }: SiteLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const dims =
    size === 'sm'
      ? { w: 32, h: 32, text: 'text-xl' }
      : size === 'lg'
        ? { w: 56, h: 56, text: 'text-4xl' }
        : { w: 40, h: 40, text: 'text-2xl' };

  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Blockbuster Bureau — Home">
      {!imgFailed ? (
        <Image
          src="/logo.png"
          alt="Blockbuster Bureau logo"
          width={dims.w}
          height={dims.h}
          className="rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgFailed(true)}
          priority
        />
      ) : (
        <span
          className={`font-display ${dims.text} text-gold leading-none tracking-wide`}
        >
          BB
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span className="font-display text-gold text-lg tracking-wide">
          Blockbuster Bureau
        </span>
        <span className="text-stardust text-[10px] tracking-[0.25em] uppercase">
          The Bureau Never Closes
        </span>
      </span>
    </Link>
  );
}
