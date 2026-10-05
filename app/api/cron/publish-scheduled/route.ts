import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { createSign } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Cron: auto-publish scheduled posts.
 * GET /api/cron/publish-scheduled
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel Cron sends this
 * automatically when the CRON_SECRET env var is set).
 *
 * Publishes every post with status=='scheduled' && scheduledAt <= now,
 * then revalidates the affected public pages.
 *
 * NOTE: this deliberately does NOT use firebase-admin. The repo learned the
 * hard way that firebase-admin causes opaque 500s in the Vercel serverless
 * runtime (see app/api/revalidate/route.ts). Instead we mint a Google OAuth
 * access token from the service-account JSON (FIREBASE_SERVICE_ACCOUNT_KEY)
 * with plain node:crypto and talk to the Firestore REST API.
 */

const FIRESTORE = 'https://firestore.googleapis.com/v1';

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

/** Mint a short-lived OAuth access token from the service-account JSON. */
async function getAccessToken(): Promise<{ token: string; projectId: string }> {
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var is not set');
  let sa: { client_email?: string; private_key?: string; project_id?: string };
  try {
    sa = JSON.parse(keyJson);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
  }
  if (!sa.client_email || !sa.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing client_email/private_key');
  }
  const projectId = sa.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Could not determine Firebase project ID');

  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key).toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`OAuth token exchange failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('OAuth token exchange returned no access_token');
  return { token: data.access_token as string, projectId };
}

interface RestDoc {
  name: string;
  fields?: {
    slug?: { stringValue?: string };
    category?: { stringValue?: string };
    scheduledAt?: { timestampValue?: string };
  };
}

export async function GET(request: NextRequest) {
  try {
    // --- Auth: Vercel Cron bearer secret ---
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      return NextResponse.json(
        { message: 'CRON_SECRET is not configured' },
        { status: 503 }
      );
    }
    if (request.headers.get('authorization') !== `Bearer ${expected}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { token, projectId } = await getAccessToken();
    const base = `${FIRESTORE}/projects/${projectId}/databases/(default)/documents`;
    const headers = { Authorization: `Bearer ${token}` };
    const nowIso = new Date().toISOString();

    // --- Find scheduled posts (equality filter only, no composite index needed) ---
    const qRes = await fetch(`${base}:runQuery`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'posts' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'status' },
              op: 'EQUAL',
              value: { stringValue: 'scheduled' },
            },
          },
        },
      }),
    });
    if (!qRes.ok) {
      throw new Error(`Firestore query failed (${qRes.status})`);
    }
    const qData: Array<{ document?: RestDoc }> = await qRes.json();

    const due: RestDoc[] = (qData || [])
      .map((r) => r.document)
      .filter(
        (d): d is RestDoc =>
          !!d && !!d.fields?.scheduledAt?.timestampValue &&
          d.fields.scheduledAt.timestampValue <= nowIso
      );

    // --- Publish each due post ---
    const published: string[] = [];
    for (const doc of due) {
      const docPath = doc.name; // full resource name
      const slug = doc.fields?.slug?.stringValue || '';
      const patchRes = await fetch(
        `${FIRESTORE}/${docPath}?updateMask.fieldPaths=status&updateMask.fieldPaths=publishedAt&updateMask.fieldPaths=scheduledAt&updateMask.fieldPaths=updatedAt`,
        {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              status: { stringValue: 'published' },
              publishedAt: { timestampValue: nowIso },
              scheduledAt: { nullValue: null },
              updatedAt: { timestampValue: nowIso },
            },
          }),
        }
      );
      if (!patchRes.ok) {
        console.error(`Failed to publish ${docPath}: ${patchRes.status}`);
        continue;
      }
      published.push(slug);
      if (slug) revalidatePath(`/blog/${slug}`);
    }

    // --- Refresh the listing pages + sitemap ---
    if (published.length > 0) {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath('/sitemap.xml');
    }

    return NextResponse.json({
      published: published.length,
      slugs: published,
      now: nowIso,
    });
  } catch (error) {
    console.error('publish-scheduled cron failed:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Cron failed' },
      { status: 500 }
    );
  }
}
