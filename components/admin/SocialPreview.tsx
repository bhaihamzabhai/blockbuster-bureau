'use client';

import { useState } from 'react';
import { Share2, ChevronDown, Globe, AtSign, LayoutGrid } from 'lucide-react';

interface SocialPreviewProps {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
}

const SITE_URL = 'https://www.blockbusterbureau.com';

/**
 * Live preview (updates as the user types) of how the article will look:
 *  - Google search result
 *  - X/Twitter large summary card
 *  - Homepage article card (loose match of the public site style)
 */
export default function SocialPreview({
  title,
  slug,
  excerpt,
  coverImage,
  metaTitle,
  metaDescription,
}: SocialPreviewProps) {
  const [open, setOpen] = useState(true);

  const gTitle = (metaTitle || title || 'Untitled post').slice(0, 60);
  const gDesc = (metaDescription || excerpt || 'No description yet — add an excerpt or meta description.').slice(0, 155);
  const xTitle = (title || 'Untitled post').slice(0, 70);
  const xDesc = (excerpt || metaDescription || '').slice(0, 125);
  const articleUrl = `${SITE_URL}/blog/${slug || 'your-slug'}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-gray-900 font-medium"
      >
        <span className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-brand-dark" />
          Social Preview
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="pt-4 space-y-5">
          {/* Google search result */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Google result
            </p>
            <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
              <p className="text-blue-800 text-lg leading-snug hover:underline cursor-pointer line-clamp-1">
                {gTitle}
              </p>
              <p className="text-gray-700 text-sm truncate">
                blockbusterbureau.com <span className="text-gray-400">› blog › {slug || 'your-slug'}</span>
              </p>
              <p className="text-gray-600 text-sm line-clamp-2 mt-0.5">{gDesc}</p>
            </div>
          </div>

          {/* X / Twitter large card */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" /> X / Twitter card
            </p>
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
              {coverImage ? (
                <img src={coverImage} alt="" className="w-full aspect-[1.91/1] object-cover" />
              ) : (
                <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No cover image set</span>
                </div>
              )}
              <div className="px-3 py-2.5">
                <p className="text-gray-900 text-[15px] font-normal line-clamp-1">{xTitle}</p>
                {xDesc && <p className="text-gray-500 text-sm line-clamp-2 mt-0.5">{xDesc}</p>}
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> blockbusterbureau.com
                </p>
              </div>
            </div>
          </div>

          {/* Homepage card */}
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" /> Homepage card
            </p>
            <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm max-w-[280px]">
              {coverImage ? (
                <img src={coverImage} alt="" className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No cover image set</span>
                </div>
              )}
              <div className="p-3">
                <p className="text-gray-900 font-bold text-base leading-snug line-clamp-2 font-display">
                  {title || 'Untitled post'}
                </p>
                <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                  {excerpt || 'No excerpt yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
