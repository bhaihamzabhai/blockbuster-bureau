import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

/**
 * ISR revalidation endpoint.
 * Call with: POST /api/revalidate?path=/blog&secret=YOUR_SECRET
 * Set REVALIDATE_SECRET in your environment variables.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');

  // Validate the secret
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}