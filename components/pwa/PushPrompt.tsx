'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

const DISMISS_KEY = 'bbb-push-dismissed';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * "Breaking news alerts" opt-in banner. Subscribes via PushManager and
 * POSTs the subscription to /api/push/subscribe. Shows only when push is
 * supported, permission is undecided, and the user hasn't dismissed it.
 */
export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      return;
    }
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return;
    }
    if (Notification.permission === 'default') {
      // Small delay so it doesn't fight the PWA install banner
      const t = setTimeout(() => setVisible(true), 9000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setVisible(false);
  };

  const enable = async () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      dismiss();
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        dismiss();
        return;
      }
      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register('/sw.js'));
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      /* user denied or subscribe failed — stay silent */
    } finally {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60]">
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">Breaking news alerts</p>
          <p className="text-gray-400 text-xs mt-0.5">
            Trailers &amp; big stories, straight to your device.
          </p>
        </div>
        <button
          onClick={enable}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors shrink-0 disabled:opacity-50"
        >
          {busy ? '…' : 'Allow'}
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-gray-500 hover:text-white transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
