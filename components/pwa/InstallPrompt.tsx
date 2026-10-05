'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'bbb-pwa-dismissed';

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * "Install app" banner. Android/Chrome: uses the captured
 * beforeinstallprompt event. iOS: shows manual Add-to-Home-Screen hint.
 * Dismissal is remembered; never shows when already installed.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return;
    }

    if (isIOS()) {
      setShowIOS(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60] animate-[slideup_0.4s_ease]">
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">Install Blockbuster Bureau</p>
          <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
            {showIOS ? (
              <>
                <Share className="w-3.5 h-3.5 shrink-0" />
                Tap Share → “Add to Home Screen”
              </>
            ) : (
              'One tap away — get the app on your home screen'
            )}
          </p>
        </div>
        {!showIOS && (
          <button
            onClick={install}
            className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors shrink-0"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-gray-500 hover:text-white transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <style>{`@keyframes slideup { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}
