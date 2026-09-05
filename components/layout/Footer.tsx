import Link from 'next/link';
import { Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nebula border-t border-white/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div>
            <h3 className="text-display text-2xl text-gold mb-2">
              Blockbuster Bureau
            </h3>
            <p className="text-stardust text-sm">
              The Bureau Never Closes
            </p>
            <p className="text-stardust text-sm mt-4">
              Your daily source for Hollywood news, trailers, and entertainment
              updates.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-stardust hover:text-gold transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-stardust hover:text-gold transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-stardust hover:text-gold transition-colors text-sm"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-void hover:bg-gold/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-gold" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-void hover:bg-gold/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gold" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-stardust text-sm">
            © {currentYear} Blockbuster Bureau. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}