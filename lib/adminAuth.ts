import type { NextRequest } from 'next/server';

/**
 * Shared admin check for API routes: Firebase admin ID token verified via
 * the Identity Toolkit REST API (accounts:lookup) — the same Google backend
 * that enforces the Firestore security rules. Keeps firebase-admin out of
 * the serverless bundle entirely.
 */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
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
      const customAttributes = JSON.parse(
        data?.users?.[0]?.customAttributes || '{}'
      );
      return customAttributes.admin === true;
    } catch {
      return false;
    }
  }
  return false;
}

/** Extracts the raw Bearer token (for forwarding to Google REST APIs). */
export function bearerToken(request: NextRequest): string | null {
  const h = request.headers.get('authorization');
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}
