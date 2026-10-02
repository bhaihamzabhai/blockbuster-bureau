import type { Metadata } from 'next';
import Script from 'next/script';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blockbusterbureau.com';

const DEFAULT_DESCRIPTION =
  "Your daily source for Hollywood news, upcoming movie releases, actor interviews, and exclusive entertainment updates. The Bureau Never Closes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Blockbuster Bureau',
    default: 'Blockbuster Bureau — The Bureau Never Closes',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'Hollywood news',
    'movie news',
    'upcoming movies',
    'movie releases',
    'actor interviews',
    'film reviews',
    'entertainment news',
    'trailers',
    'Blockbuster Bureau',
  ],
  authors: [{ name: 'Blockbuster Bureau' }],
  creator: 'Blockbuster Bureau',
  publisher: 'Blockbuster Bureau',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Blockbuster Bureau',
    url: SITE_URL,
    title: 'Blockbuster Bureau — The Bureau Never Closes',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Blockbuster Bureau — Hollywood Movie & Entertainment News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blockbuster Bureau — The Bureau Never Closes',
    description: DEFAULT_DESCRIPTION,
    images: ['/og-cover.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="dark">
      <body
        className={`${bebasNeue.variable} ${inter.variable} bg-void text-white min-h-screen font-body`}
      >
        {/* Google AdSense (loaded only when a client ID is configured) */}
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {/* Google Analytics */}
<Script
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js?id=G-EPZPH44NVR"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-EPZPH44NVR');
  `}
</Script>

        {/* Starfield Background */}
        <div className="starfield" aria-hidden="true" />

        {/* Glass Site Header */}
        <Header />

        {/* Main Content */}
        <main className="relative z-10 pt-16">{children}</main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}