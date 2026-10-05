import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, bearerToken } from '@/lib/adminAuth';
import { isPushConfigured, sendPushNotification } from '@/lib/push';

const FIRESTORE = 'https://firestore.googleapis.com/v1';

interface RestDoc {
  name: string;
  fields?: {
    endpoint?: { stringValue?: string };
    keys?: {
      mapValue?: {
        fields?: {
          p256dh?: { stringValue?: string };
          auth?: { stringValue?: string };
        };
      };
    };
  };
}

/**
 * Admin-only: broadcast a push notification to all subscribers.
 * Reads subscriptions via the Firestore REST API using the admin's own
 * ID token (rules grant admins read access) — no firebase-admin needed.
 * Dead subscriptions (410/404) are pruned automatically.
 *
 * Body: { title, body, url }
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = bearerToken(request);
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!token || !projectId) {
      return NextResponse.json({ message: 'Server not configured' }, { status: 503 });
    }
    if (!isPushConfigured()) {
      return NextResponse.json(
        { message: 'VAPID keys not configured (see Vercel env vars)' },
        { status: 503 }
      );
    }

    const payload = await request.json().catch(() => null);
    const title = String(payload?.title || '').slice(0, 80).trim();
    const body = String(payload?.body || '').slice(0, 160).trim();
    let url = String(payload?.url || '/').trim();
    if (!url.startsWith('/')) url = '/';
    if (!title || !body) {
      return NextResponse.json({ message: 'title and body are required' }, { status: 400 });
    }

    const base = `${FIRESTORE}/projects/${projectId}/databases/(default)/documents/pushSubscriptions`;
    const headers = { Authorization: `Bearer ${token}` };

    const listRes = await fetch(`${base}?pageSize=500`, { headers });
    if (!listRes.ok) {
      return NextResponse.json(
        { message: `Failed to list subscriptions (${listRes.status})` },
        { status: 502 }
      );
    }
    const list = (await listRes.json()) as { documents?: RestDoc[] };
    const docs = list.documents || [];

    // Dedupe by endpoint (same browser may have subscribed twice)
    const seen = new Set<string>();
    const subs = docs
      .map((d) => ({
        id: d.name.split('/').pop() || '',
        name: d.name,
        endpoint: d.fields?.endpoint?.stringValue || '',
        p256dh: d.fields?.keys?.mapValue?.fields?.p256dh?.stringValue || '',
        auth: d.fields?.keys?.mapValue?.fields?.auth?.stringValue || '',
      }))
      .filter((s) => {
        if (!s.endpoint || !s.p256dh || !s.auth || seen.has(s.endpoint)) return false;
        seen.add(s.endpoint);
        return true;
      });

    let sent = 0;
    let failed = 0;
    let pruned = 0;

    for (const sub of subs) {
      try {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          { title, body, url }
        );
        sent++;
      } catch (e: unknown) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          // Dead subscription — remove it
          try {
            await fetch(`${base}/${sub.id}`, { method: 'DELETE', headers });
            pruned++;
          } catch {
            failed++;
          }
        } else {
          failed++;
        }
      }
    }

    return NextResponse.json({ ok: true, total: subs.length, sent, failed, pruned });
  } catch (e) {
    console.error('push/send error:', e);
    return NextResponse.json({ message: 'Failed to send' }, { status: 500 });
  }
}
