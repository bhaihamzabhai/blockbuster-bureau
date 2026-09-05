'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, AlertTriangle } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (embedHtml: string) => void;
}

const ALLOWED_IFRAME_DOMAINS = [
  'twitter.com',
  'platform.twitter.com',
  'instagram.com',
  'tiktok.com',
  'open.spotify.com',
  'anchor.fm',
];

const ALLOWED_TAGS = ['iframe'];
const ALLOWED_ATTR = ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'loading'];

export default function EmbedModal({
  isOpen,
  onClose,
  onInsert,
}: EmbedModalProps) {
  const [embedCode, setEmbedCode] = useState('');
  const [error, setError] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const handleClose = () => {
    setEmbedCode('');
    setError('');
    setPreviewHtml('');
    onClose();
  };

  const validateAndSanitize = (html: string): string | null => {
    // First sanitize with DOMPurify
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });

    // Parse the sanitized HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    const iframes = doc.querySelectorAll('iframe');

    if (iframes.length === 0) {
      return 'No iframe found in the embed code. Please paste a valid embed code.';
    }

    let validationError: string | null = null;

    // Validate each iframe src
    Array.from(iframes).forEach((iframe) => {
      const src = iframe.getAttribute('src');
      if (!src) return;

      try {
        const url = new URL(src);
        const isAllowed = ALLOWED_IFRAME_DOMAINS.some((domain) =>
          url.hostname.endsWith(domain)
        );

        if (!isAllowed) {
          validationError = `Embeds from "${url.hostname}" are not allowed. Allowed domains: ${ALLOWED_IFRAME_DOMAINS.join(', ')}`;
        }
      } catch {
        validationError = 'Invalid URL in embed code.';
      }
    });

    if (validationError) return validationError;

    return sanitized;
  };

  const handlePreview = () => {
    setError('');
    if (!embedCode.trim()) {
      setError('Please paste an embed code');
      return;
    }

    const result = validateAndSanitize(embedCode);
    if (result && result.startsWith('No iframe') || result?.startsWith('Embeds from') || result?.startsWith('Invalid URL')) {
      setError(result);
      setPreviewHtml('');
      return;
    }

    setPreviewHtml(result || '');
  };

  const handleInsert = () => {
    setError('');
    if (!embedCode.trim()) {
      setError('Please paste an embed code');
      return;
    }

    const result = validateAndSanitize(embedCode);
    if (result && (result.startsWith('No iframe') || result?.startsWith('Embeds from') || result?.startsWith('Invalid URL'))) {
      setError(result);
      return;
    }

    onInsert(result || '');
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-nebula rounded-xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-display text-xl text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-gold" />
                Embed External Content
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-white/10 text-stardust hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-void/50 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-yellow-500/80 text-xs">
                  Only paste embed codes from trusted sources. Embeds from unauthorized domains will be blocked.
                  Allowed: Twitter, Instagram, TikTok, Spotify, Anchor.fm
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-stardust text-sm mb-1">Paste Embed Code</label>
              <textarea
                value={embedCode}
                onChange={(e) => {
                  setEmbedCode(e.target.value);
                  setPreviewHtml('');
                  setError('');
                }}
                placeholder={`<iframe src="https://platform.twitter.com/embed/..." width="550" height="300" frameborder="0" allowfullscreen></iframe>`}
                className="w-full px-4 py-3 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50 font-mono text-sm resize-none"
                rows={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {previewHtml && (
              <div className="mb-4">
                <p className="text-stardust text-sm mb-2">Preview</p>
                <div
                  className="rounded-lg overflow-hidden bg-void p-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Preview
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!embedCode.trim()}
                className="px-4 py-2 rounded-lg bg-gold text-void font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Embed
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}