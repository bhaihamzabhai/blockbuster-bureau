import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Public: save a browser push subscription.
 * Firestore rules validate the document shape (endpoint + keys).
 * Duplicates are deduped in memory on send.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });
    }

    const ip = getClientIp(request);
    const now = Date.now();
    const entry = attempts.get(ip);
    if (!entry || now > entry.resetAt) {
      attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > MAX_PER_WINDOW) {
        return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
      }
    }

    const body = await request.json().catch(() => null);
    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;

    if (
      typeof endpoint !== 'string' ||
      endpoint.length === 0 ||
      endpoint.length > 500 ||
      typeof p256dh !== 'string' ||
      typeof auth !== 'string'
    ) {
      return NextResponse.json({ message: 'Invalid subscription' }, { status: 400 });
    }

    await addDoc(collection(db, 'pushSubscriptions'), {
      endpoint,
      keys: { p256dh, auth },
      createdAt: serverTimestamp(),
      userAgent: (request.headers.get('user-agent') || '').slice(0, 200),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('push/subscribe error:', e);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
