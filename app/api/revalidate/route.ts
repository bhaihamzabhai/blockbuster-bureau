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
 * NOTE: firebase-admin is imported dynamically inside the handler (not at
 * module top level) so that a load failure surfaces as a JSON error with
 * the real message instead of an opaque HTML 500 page.
 */

async function getAdminAuth() {
  const { getApps, initializeApp } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  if (getApps().length === 0) {
    // Project ID alone is enough to verify ID tokens
    // (verification uses Google's public certificates).
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getAuth();
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Method 1: shared secret (automations / manual curl)
  const secret = request.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (expectedSecret && secret === expectedSecret) return true;

  // Method 2: Firebase admin ID token (dashboard publish flow)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = await (await getAdminAuth()).verifyIdToken(authHeader.slice(7));
      if (decoded.admin === true) return true;
    } catch {
      // Invalid / expired token — fall through to unauthorized.
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
 * and whether firebase-admin loads in this environment. Used to debug
 * opaque 500s on serverless deployments.
 */
export async function GET() {
  const info: Record<string, unknown> = {
    node: process.version,
    projectIdSet: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  };
  try {
    const { getApps } = await import('firebase-admin/app');
    info.firebaseAdminLoads = true;
    info.appsInitialized = getApps().length;
  } catch (error) {
    info.firebaseAdminLoads = false;
    info.firebaseAdminError = String(error).slice(0, 500);
  }
  return NextResponse.json(info);
}
