import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
 */

function getAdminAuth() {
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
      const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
      if (decoded.admin === true) return true;
    } catch {
      // Invalid / expired token — fall through to unauthorized.
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
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

  try {
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
