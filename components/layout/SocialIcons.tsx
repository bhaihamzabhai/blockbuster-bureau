import { Youtube, Facebook } from 'lucide-react';
import type { SiteSettings } from '@/lib/siteSettings';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface SocialIconsProps {
  settings: Pick<SiteSettings, 'youtubeUrl' | 'tiktokUrl' | 'facebookUrl'>;
  className?: string;
  iconClassName?: string;
}

/** Social icons that link to the admin-configured YouTube / TikTok / Facebook URLs. Renders nothing for empty URLs. */
export default function SocialIcons({ settings, className = '', iconClassName = 'w-5 h-5' }: SocialIconsProps) {
  const links = [
    { url: settings.youtubeUrl, label: 'YouTube', Icon: Youtube },
    { url: settings.tiktokUrl, label: 'TikTok', Icon: TikTokIcon },
    { url: settings.facebookUrl, label: 'Facebook', Icon: Facebook },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Blockbuster Bureau on ${label}`}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-brand text-gray-600 hover:text-white flex items-center justify-center transition-colors"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
