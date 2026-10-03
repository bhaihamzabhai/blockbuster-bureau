'use client';

import { useMemo, useState } from 'react';
import { Check, X, ChevronDown, Gauge } from 'lucide-react';

export interface SeoScoreInput {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImage: string;
  category: string;
  tags: string[];
  youtubeVideoId: string;
  metaTitle: string;
  metaDescription: string;
}

interface CheckResult {
  label: string;
  passed: boolean;
  points: number;
  hint: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function countH2(html: string): number {
  return (html.match(/<h2[\s>]/gi) || []).length;
}

function evaluate(input: SeoScoreInput): CheckResult[] {
  const title = input.title.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDesc = input.metaDescription.trim();
  const slug = input.slug.trim();
  const words = countWords(input.bodyHtml);
  const h2s = countH2(input.bodyHtml);
  const titleLower = title.toLowerCase();
  const hasTagInTitle = input.tags.some((t) => t && titleLower.includes(t.toLowerCase()));

  return [
    {
      label: 'Title length (30–60 chars)',
      passed: title.length >= 30 && title.length <= 60,
      points: 10,
      hint: title.length === 0 ? 'Add a title' : `Currently ${title.length} chars`,
    },
    {
      label: 'Title contains a tag keyword',
      passed: hasTagInTitle,
      points: 5,
      hint: hasTagInTitle ? 'Keyword overlap found' : 'Include one of your tags in the title',
    },
    {
      label: 'Meta title set (≤60 chars)',
      passed: metaTitle.length > 0 && metaTitle.length <= 60,
      points: 10,
      hint: metaTitle.length === 0 ? 'Add a meta title in SEO & Sharing' : `Currently ${metaTitle.length} chars`,
    },
    {
      label: 'Meta description (120–160 chars)',
      passed: metaDesc.length >= 120 && metaDesc.length <= 160,
      points: 10,
      hint: metaDesc.length === 0 ? 'Add a meta description in SEO & Sharing' : `Currently ${metaDesc.length} chars`,
    },
    {
      label: 'Clean slug',
      passed:
        slug.length > 0 &&
        slug.length <= 75 &&
        slug === slug.toLowerCase() &&
        !/\s/.test(slug),
      points: 10,
      hint: slug.length === 0 ? 'Slug is generated from the title' : `/${slug}`,
    },
    {
      label: 'Excerpt set',
      passed: input.excerpt.trim().length >= 20,
      points: 5,
      hint: input.excerpt.trim() ? `${input.excerpt.trim().length} chars` : 'Add a short excerpt',
    },
    {
      label: 'Body has 300+ words',
      passed: words >= 300,
      points: 15,
      hint: `Currently ~${words} words`,
    },
    {
      label: 'Body has 2+ subheadings (H2)',
      passed: h2s >= 2,
      points: 10,
      hint: `Currently ${h2s} H2`,
    },
    {
      label: 'Cover image set',
      passed: input.coverImage.trim().length > 0,
      points: 10,
      hint: input.coverImage.trim() ? 'Cover image added' : 'Add a cover image URL',
    },
    {
      label: '3–8 tags',
      passed: input.tags.length >= 3 && input.tags.length <= 8,
      points: 5,
      hint: `${input.tags.length} tags`,
    },
    {
      label: 'YouTube video attached',
      passed: input.youtubeVideoId.trim().length > 0,
      points: 5,
      hint: input.youtubeVideoId.trim() ? 'Video will embed' : 'Add the video ID for rich results',
    },
    {
      label: 'Category selected',
      passed: input.category.trim().length > 0,
      points: 5,
      hint: input.category.trim() || 'Pick a category',
    },
  ];
}

/**
 * Live SEO score meter for the post editor (Yoast-style).
 * Purely client-side: scores the current form state out of 100
 * and lists exactly what to fix. Updates as you type.
 */
export default function SeoScore({ input }: { input: SeoScoreInput }) {
  const [open, setOpen] = useState(false);

  const { score, passed, total, checks } = useMemo(() => {
    const list = evaluate(input);
    const s = list.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
    return {
      score: s,
      passed: list.filter((c) => c.passed).length,
      total: list.length,
      checks: list,
    };
  }, [input]);

  const failed = total - passed;
  const band =
    score >= 80
      ? { color: '#16a34a', track: '#dcfce7', label: 'Good' }
      : score >= 50
        ? { color: '#d97706', track: '#fef3c7', label: 'Needs work' }
        : { color: '#dc2626', track: '#fee2e2', label: 'Poor' };

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
        title="Show SEO checklist"
      >
        <span className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r={R} fill="none" stroke={band.track} strokeWidth="7" />
            <circle
              cx="32"
              cy="32"
              r={R}
              fill="none"
              stroke={band.color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (C * score) / 100}
              style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">
            {score}
          </span>
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-gray-900 font-medium text-sm">
            <Gauge className="w-4 h-4" style={{ color: band.color }} />
            SEO Score
          </span>
          <span className="text-xs" style={{ color: band.color }}>
            {band.label} · {passed}/{total} checks passed
            {failed > 0 && ` · ${failed} to fix`}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-xs">
              <span
                className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  c.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {c.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </span>
              <span className="flex-1">
                <span className={c.passed ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                  {c.label}
                </span>
                <span className="text-gray-400"> · {c.hint}</span>
              </span>
              <span className="text-gray-400 tabular-nums">
                {c.passed ? `+${c.points}` : `0/${c.points}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
