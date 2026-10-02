import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

/**
 * ISR revalidation endpoint.
 *
 * Two ways to call:
 *  1. POST /api/revalidate?path=/blog&secret=YOUR_SECRET   (legacy, single path)
 *  2. POST /api/revalidate  with JSON body { "paths": ["/", "/blog", ...] }
 *     + Authorization: Bearer <Firebase ID token of an admin user>
 *     (used automatically by the dashboard after publishing a post)
 *
 * Set REVALIDATE_SECRET in environment variables for method 1.
 *
 * Admin check (method 2) is done via the Identity Toolkit REST API
 * (accounts:lookup) — the same Google backend that enforces the Firestore
 * security rules. This keeps firebase-admin out of the serverless bundle
 * entirely (it caused opaque 500s on Vercel) and guarantees the check is
 * consistent with what Firestore itself accepts.
 */

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Method 1: shared secret (automations / manual curl)
  const secret = request.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (expectedSecret && secret === expectedSecret) return true;

  // Method 2: Firebase admin ID token (dashboard publish flow)
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (authHeader?.startsWith('Bearer ') && apiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: authHeader.slice(7) }),
        }
      );
      if (!res.ok) return false;
      const data = await res.json();
      const customAttributes = JSON.parse(data?.users?.[0]?.customAttributes || '{}');
      if (customAttributes.admin === true) return true;
    } catch {
      // Invalid / expired token or network issue — fall through to unauthorized.
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Accept JSON body { paths: [...] } and/or legacy ?path=
    let paths: string[] = [];
    try {
      const body = await request.json();
      if (Array.isArray(body.paths)) paths = body.paths;
    } catch {
      // No JSON body — fall back to query param.
    }
    const single = request.nextUrl.searchParams.get('path');
    if (single) paths.push(single);

    // Sanitize: only internal paths, max 10 per call.
    paths = Array.from(
      new Set(paths.filter((p) => typeof p === 'string' && p.startsWith('/')))
    ).slice(0, 10);

    if (paths.length === 0) {
      return NextResponse.json({ message: 'Missing paths to revalidate' }, { status: 400 });
    }

    for (const p of paths) revalidatePath(p);
    return NextResponse.json({ revalidated: true, paths, now: Date.now() });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Diagnostic endpoint (no secrets leaked): reports the Node runtime version
 * and whether the Firebase API key is configured. Used to debug auth
 * failures on serverless deployments.
 */
export async function GET() {
  return NextResponse.json({
    node: process.version,
    apiKeySet: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    projectIdSet: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  });
}
