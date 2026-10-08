import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminRequest, bearerToken } from '@/lib/adminAuth';
import { getServiceAccountToken } from '@/lib/serviceAccount';

export const dynamic = 'force-dynamic';

/**
 * Team management (admin only).
 *
 * GET  /api/admin/team
 *   Lists Firebase Auth users with their role (none/editor/admin),
 *   derived from custom claims.
 *
 * POST /api/admin/team  { uid, role: 'none' | 'editor' | 'admin' }
 *   Sets the user's role via custom claims. The user must sign out and
 *   back in for the new role to take effect.
 *
 * Auth: Authorization: Bearer <admin Firebase ID token>.
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (server side).
 */

const TOOLKIT = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty';

interface ToolkitUser {
  localId: string;
  email?: string;
  displayName?: string;
  customAttributes?: string;
  created?: string;
  lastLoginAt?: string;
  disabled?: boolean;
}

function roleOf(u: ToolkitUser): 'none' | 'editor' | 'admin' {
  try {
    const claims = JSON.parse(u.customAttributes || '{}');
    if (claims.admin === true) return 'admin';
    if (claims.editor === true) return 'editor';
  } catch {
    /* ignore */
  }
  return 'none';
}

async function lookupCallerUid(request: NextRequest): Promise<string | null> {
  const token = bearerToken(request);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!token || !apiKey) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { token } = await getServiceAccountToken();
    const users: ToolkitUser[] = [];
    let nextPageToken: string | undefined;
    do {
      const res = await fetch(`${TOOLKIT}/downloadAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ maxResults: 100, ...(nextPageToken ? { nextPageToken } : {}) }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`downloadAccount failed (${res.status}): ${t.slice(0, 200)}`);
      }
      const data = await res.json();
      users.push(...(data.users ?? []));
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return NextResponse.json({
      users: users.map((u) => ({
        uid: u.localId,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        role: roleOf(u),
        disabled: u.disabled === true,
        createdAt: u.created ? Number(u.created) : null,
        lastLoginAt: u.lastLoginAt ? Number(u.lastLoginAt) : null,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  let body: { uid?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { uid, role } = body;
  if (!uid || !['none', 'editor', 'admin'].includes(role ?? '')) {
    return NextResponse.json(
      { error: "Body must be { uid, role: 'none' | 'editor' | 'admin' }" },
      { status: 400 }
    );
  }
  // Safety: an admin cannot demote or remove their own admin access.
  const callerUid = await lookupCallerUid(request);
  if (callerUid && callerUid === uid && role !== 'admin') {
    return NextResponse.json(
      { error: 'You cannot change your own admin role.' },
      { status: 400 }
    );
  }
  try {
    const { token } = await getServiceAccountToken();
    const customAttributes = JSON.stringify(
      role === 'admin' ? { admin: true } : role === 'editor' ? { editor: true } : {}
    );
    const res = await fetch(`${TOOLKIT}/setAccountInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ localId: uid, customAttributes }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`setAccountInfo failed (${res.status}): ${t.slice(0, 200)}`);
    }
    return NextResponse.json({ ok: true, uid, role });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
