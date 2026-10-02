'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Newsletter signup form — posts to /api/newsletter, which applies
 * honeypot + per-IP rate limiting before writing to Firestore.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `website` is a honeypot field — always empty for real users.
        body: JSON.stringify({ email: value, website: '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again later.');
      }
      setStatus('done');
      setMessage('Subscribed! You will get the latest Hollywood updates.');
      setEmail('');
    } catch (err) {
      console.error('Newsletter signup failed:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again later.');
    }
  };

  return (
    <section className="bg-brand">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-white" />
          </span>
          <div>
            <h3 className="text-white font-extrabold text-xl leading-tight">
              Never Miss a Blockbuster
            </h3>
            <p className="text-white/85 text-sm mt-1">
              Get the biggest Hollywood stories in your inbox — free, no spam.
            </p>
          </div>
        </div>

        {status === 'done' ? (
          <p className="flex items-center gap-2 bg-white/15 text-white font-semibold text-sm px-5 py-3 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </p>
        ) : (
          <form onSubmit={subscribe} className="flex w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 md:w-72 h-12 px-4 rounded-l-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-12 px-6 rounded-r-full bg-gray-900 hover:bg-black text-white text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        )}
      </div>
      {status === 'error' && (
        <p className="text-center pb-5 -mt-3 text-white text-sm flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4" /> {message}
        </p>
      )}
    </section>
  );
}
