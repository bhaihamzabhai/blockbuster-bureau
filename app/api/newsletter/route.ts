import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Newsletter signup endpoint.
 *
 * Spam hardening:
 * - Honeypot field (`website`): bots fill it, humans never see it.
 * - Tight per-IP rate limit: 5 signups / 10 minutes
 *   (middleware already rate-limits /api/* at 100 req/min globally).
 * - Strict email validation + Firestore rules validate the document shape.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_PER_WINDOW;
}

// Prune old entries occasionally so the map can't grow forever.
function prune() {
  if (attempts.size < 1000) return;
  const now = Date.now();
  attempts.forEach((e, ip) => {
    if (now > e.resetAt) attempts.delete(ip);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429 }
    );
  }
  prune();

  let body: { email?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: silently "succeed" for bots.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 256) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  if (!isFirebaseConfigured) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
  }

  try {
    await addDoc(collection(db, 'newsletter_subscribers'), {
      email,
      createdAt: serverTimestamp(),
      source: 'homepage',
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Newsletter signup failed:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
