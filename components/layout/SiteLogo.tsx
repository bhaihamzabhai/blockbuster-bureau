'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

/**
 * Site logo: orange "B" mark + wordmark.
 * `theme="light"` renders dark text for light backgrounds (public site),
 * `theme="dark"` renders light text (admin area).
 */
export default function SiteLogo({ size = 'md', theme = 'light' }: SiteLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const markH =
    size === 'sm' ? 'h-10' : size === 'lg' ? 'h-16' : 'h-12';
  const titleSize =
    size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  const titleColor = theme === 'light' ? 'text-gray-900' : 'text-white';

  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Blockbuster Bureau — Home">
      {!imgFailed ? (
        <Image
          src="/logo.png"
          alt="Blockbuster Bureau logo"
          width={64}
          height={64}
          className={`${markH} w-auto object-contain`}
          onError={() => setImgFailed(true)}
          priority
        />
      ) : (
        <span
          className={`${markH} aspect-square rounded-lg bg-brand text-white font-extrabold flex items-center justify-center text-2xl leading-none`}
        >
          B
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold ${titleSize} ${titleColor} tracking-tight`}>
          Blockbuster
        </span>
        <span className="text-brand font-bold text-[11px] tracking-[0.35em] uppercase mt-0.5">
          Bureau
        </span>
      </span>
    </Link>
  );
}
