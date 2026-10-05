'use client';

import { useEffect, useState } from 'react';
import { Link2, Plus, Check } from 'lucide-react';
import { getPosts } from '@/lib/firestore';
import { Post } from '@/types';

interface RelatedSuggesterProps {
  currentPostId?: string;
  category: string;
  tags: string[];
  /** Current editor body HTML (used to skip already-linked posts). */
  bodyHtml: string;
  /** Called with the HTML snippet to append to the end of the body. */
  onInsert: (html: string) => void;
}

interface Suggestion {
  post: Post;
  score: number;
  reasons: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Suggests 1–2 previously published articles to link at the end of the
 * current article ("Related:" line) — automates the standing SEO rule.
 * Scores by shared tags (2 pts each) + same category (3 pts).
 */
export default function RelatedSuggester({
  currentPostId,
  category,
  tags,
  bodyHtml,
  onInsert,
}: RelatedSuggesterProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [inserted, setInserted] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const published = await getPosts({ status: 'published', limit: 50 });
        if (cancelled) return;
        const tagSet = new Set(tags.map((t) => t.toLowerCase()));
        const scored: Suggestion[] = published
          .filter((p) => p.id !== currentPostId)
          .map((p) => {
            const shared = (p.tags || []).filter((t) => tagSet.has(t.toLowerCase()));
            const reasons: string[] = [];
            let score = 0;
            if (shared.length > 0) {
              score += shared.length * 2;
              reasons.push(`${shared.length} shared tag${shared.length > 1 ? 's' : ''}`);
            }
            if (p.category === category) {
              score += 3;
              reasons.push('same category');
            }
            return { post: p, score, reasons };
          })
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        setSuggestions(scored);
      } catch (error) {
        console.error('RelatedSuggester failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPostId, category, tags]);

  const handleInsert = (s: Suggestion) => {
    const html = `<p><strong>Related:</strong> <a href="/blog/${s.post.slug}">${escapeHtml(s.post.title)}</a></p>`;
    onInsert(html);
    setInserted((prev) => new Set(prev).add(s.post.slug));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-900 font-medium mb-1 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-brand-dark" />
        Related Links
      </h3>
      <p className="text-gray-500 text-xs mb-3">
        Every article should end with 1–2 Related links. Pick a suggestion to append it.
      </p>
      {loading ? (
        <p className="text-gray-500 text-sm">Finding related articles…</p>
      ) : suggestions.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No related published articles yet — publish something in this category or with shared tags first.
        </p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s) => {
            const alreadyLinked = bodyHtml.includes(`/blog/${s.post.slug}`) || inserted.has(s.post.slug);
            return (
              <li
                key={s.post.id}
                className="flex items-start justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm font-medium line-clamp-2">{s.post.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.reasons.join(' · ')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInsert(s)}
                  disabled={alreadyLinked}
                  title={alreadyLinked ? 'Already linked in this article' : 'Append Related link to article'}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    alreadyLinked
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-brand/10 text-brand-dark hover:bg-brand/20'
                  }`}
                >
                  {alreadyLinked ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Insert
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
