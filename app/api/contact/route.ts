import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Contact form endpoint.
 *
 * Spam hardening (same pattern as /api/newsletter):
 * - Honeypot field (`website`): bots fill it, humans never see it.
 * - Per-IP rate limit: 5 messages / 10 minutes.
 * - Strict validation + Firestore rules validate the document shape
 *   (public create-only on `contactMessages`).
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
      { error: 'Too many messages. Please try again later.' },
      { status: 429 }
    );
  }
  prune();

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: silently accept but drop.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name || '').trim().slice(0, 100);
  const email = (body.email || '').trim().slice(0, 256);
  const subject = (body.subject || '').trim().slice(0, 150);
  const message = (body.message || '').trim().slice(0, 5000);

  if (!name) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: 'Please write a message (at least 10 characters).' },
      { status: 400 }
    );
  }

  if (!isFirebaseConfigured) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
  }

  try {
    await addDoc(collection(db, 'contactMessages'), {
      name,
      email,
      subject,
      message,
      createdAt: serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact message save failed:', error);
    return NextResponse.json(
      { error: 'Could not send your message. Please try again.' },
      { status: 500 }
    );
  }
}
