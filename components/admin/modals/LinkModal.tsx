'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { href: string; text?: string; newTab: boolean; nofollow: boolean }) => void;
  currentHref?: string;
  currentText?: string;
}

export default function LinkModal({
  isOpen,
  onClose,
  onInsert,
  currentHref = '',
  currentText = '',
}: LinkModalProps) {
  const [href, setHref] = useState(currentHref);
  const [text, setText] = useState(currentText);
  const [newTab, setNewTab] = useState(true);
  const [nofollow, setNofollow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHref(currentHref);
      setText(currentText);
      setNewTab(true);
      setNofollow(false);
      setError('');
    }
  }, [isOpen, currentHref, currentText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!href) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(href);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    onInsert({ href, text, newTab, nofollow });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-nebula rounded-xl border border-white/10 p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-display text-xl text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-gold" />
                Insert Link
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/10 text-stardust hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div>
                <label className="block text-stardust text-sm mb-1">URL</label>
                <input
                  type="text"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-stardust text-sm mb-1">Link Text (optional)</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-4 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTab}
                    onChange={(e) => setNewTab(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <span className="text-stardust text-sm">Open in new tab</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nofollow}
                    onChange={(e) => setNofollow(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <span className="text-stardust text-sm">Nofollow</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                {currentHref && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsert({ href: '', text: '', newTab: true, nofollow: false });
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Remove Link
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold text-void font-medium hover:bg-gold/90 transition-colors"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}