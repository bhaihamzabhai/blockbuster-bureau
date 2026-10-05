'use client';

import { useMemo, useState } from 'react';
import { Check, X, ChevronDown, ListChecks } from 'lucide-react';

export interface QualityCheckInput {
  bodyHtml: string;
}

interface AutoCheck {
  kind: 'auto';
  label: string;
  hint: string;
  passed: boolean;
}

interface ManualCheck {
  kind: 'manual';
  label: string;
  hint: string;
}

type Check = AutoCheck | ManualCheck;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Counts concrete figures: money, years, plain numbers (e.g. $150M, 2026, 68,000). */
function countConcreteFacts(html: string): number {
  const text = stripHtml(html);
  const matches = text.match(
    /\$\s?[\d,]+(\.\d+)?\s?(million|billion|m|k)?\b|\b(19|20)\d{2}\b|\b\d{1,3}(,\d{3})+\b|\b\d+\s?(million|billion|%)\b/gi
  );
  return matches ? matches.length : 0;
}

const VOICE_MARKERS = [
  'my take',
  'my prediction',
  'my call',
  'my verdict',
  'in my opinion',
  'i think',
  'honestly',
  'no cap',
  "here's the thing",
];

function findVoiceMarker(html: string): string | null {
  const text = stripHtml(html).toLowerCase();
  return VOICE_MARKERS.find((m) => text.includes(m)) ?? null;
}

function buildChecks(input: QualityCheckInput): Check[] {
  const facts = countConcreteFacts(input.bodyHtml);
  const voice = findVoiceMarker(input.bodyHtml);

  return [
    {
      kind: 'manual',
      label: 'Naya kya hai? — mera tajziya/take isme hai, sirf news rewrite nahi',
      hint: 'Apni raye ya prediction ki 2 lines add karo',
    },
    {
      kind: 'auto',
      label: 'Specific facts — naam, dates, numbers (kam se kam 3)',
      hint: facts > 0 ? `${facts} concrete figure${facts === 1 ? '' : 's'} found` : 'Add dates, box-office numbers, cast names',
      passed: facts >= 3,
    },
    {
      kind: 'auto',
      label: "Personal voice — 'my take' jaisi opinion line maujood",
      hint: voice ? `Found: "${voice}"` : 'Add an opinion line (e.g. "My take: …")',
      passed: voice !== null,
    },
    {
      kind: 'manual',
      label: 'Facts verified — 2 key facts (date / number / naam) check kiye',
      hint: 'Ghalat fact sab se bara red flag hai',
    },
    {
      kind: 'manual',
      label: 'Awaz meri hai — ek paragraph zor se parha, robotic nahi laga',
      hint: 'Robotic lage to apne lafzon me badlo',
    },
  ];
}

/**
 * 2-minute quality test for the post editor, next to the SEO score.
 * 2 checks are automatic (concrete facts, personal voice markers);
 * 3 are manual checkboxes (original take, verified facts, personal tone).
 * 4–5/5 = ready to publish, 3/5 = edit first.
 */
export default function QualityCheck({ input }: { input: QualityCheckInput }) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState<Record<string, boolean>>({});

  const checks = useMemo(() => buildChecks(input), [input]);

  const passed = checks.filter((c) =>
    c.kind === 'auto' ? c.passed : manual[c.label] === true
  ).length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);

  const band =
    passed >= 4
      ? { color: '#16a34a', track: '#dcfce7', label: 'Ready to publish' }
      : passed === 3
        ? { color: '#d97706', track: '#fef3c7', label: 'Edit first' }
        : { color: '#dc2626', track: '#fee2e2', label: 'Needs work' };

  const R = 26;
  const C = 2 * Math.PI * R;

  const toggle = (label: string) =>
    setManual((m) => ({ ...m, [label]: !m[label] }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
        title="Show quality checklist"
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
            {passed}/{total}
          </span>
        </span>
        <span className="flex-1">
          <span className="flex items-center gap-1.5 text-gray-900 font-medium text-sm">
            <ListChecks className="w-4 h-4" style={{ color: band.color }} />
            Quality Check
          </span>
          <span className="text-xs" style={{ color: band.color }}>
            {band.label} · 4–5/5 = publish
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
          {checks.map((c) => {
            const isPass = c.kind === 'auto' ? c.passed : manual[c.label] === true;
            return (
              <li key={c.label} className="flex items-start gap-2 text-xs">
                {c.kind === 'auto' ? (
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {isPass ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(c.label);
                    }}
                    title="Mark as done"
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isPass
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-transparent hover:border-green-500'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <span className="flex-1">
                  <span className={isPass ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                    {c.label}
                  </span>
                  <span className="text-gray-400"> · {c.hint}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
