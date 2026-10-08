import { createSign } from 'crypto';

/**
 * Shared service-account helper (no firebase-admin — it 500s in the
 * Vercel serverless runtime). Mints a Google OAuth access token from the
 * FIREBASE_SERVICE_ACCOUNT_KEY env var for Google REST APIs.
 */

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export async function getServiceAccountToken(
  scope = 'https://www.googleapis.com/auth/cloud-platform'
): Promise<{ token: string; projectId: string }> {
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
    scope,
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
  if (!res.ok) throw new Error(`OAuth token exchange failed (${res.status})`);
  const data = await res.json();
  if (!data.access_token) throw new Error('OAuth token exchange returned no access_token');
  return { token: data.access_token as string, projectId };
}
