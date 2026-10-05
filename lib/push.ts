import webpush from 'web-push';

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

let configured = false;

/** Reads VAPID keys from env and configures web-push once. */
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || 'mailto:admin@blockbusterbureau.com';
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return ensureConfigured();
}

export async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  payload: { title: string; body: string; url: string }
): Promise<void> {
  if (!ensureConfigured()) throw new Error('VAPID keys not configured');
  await webpush.sendNotification(
    subscription as unknown as webpush.PushSubscription,
    JSON.stringify(payload)
  );
}
