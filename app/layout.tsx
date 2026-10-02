import type { Metadata } from 'next';
import Script from 'next/script';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/siteSettings';

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

const FALLBACK_TITLE = 'Blockbuster Bureau — The Bureau Never Closes';

const DEFAULT_KEYWORDS = [
  'Hollywood news',
  'movie news',
  'upcoming movies',
  'movie releases',
  'actor interviews',
  'film reviews',
  'entertainment news',
  'trailers',
  'Blockbuster Bureau',
];

/**
 * Site-wide metadata. Values from the dashboard SEO panel
 * (settings/general) override these defaults when set.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings.metaTitle || FALLBACK_TITLE;
  const description = settings.siteDescription || DEFAULT_DESCRIPTION;
  const keywords = settings.metaKeywords
    ? [...settings.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean), ...DEFAULT_KEYWORDS]
    : DEFAULT_KEYWORDS;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: '%s | Blockbuster Bureau',
      default: title,
    },
    description,
    keywords,
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
      title,
      description,
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
      title,
      description,
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const settings = await getSiteSettings();
  const gaId = settings.googleAnalyticsId || 'G-EPZPH44NVR';

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
        {/* Google Analytics (ID configurable from dashboard SEO panel) */}
<Script
  strategy="afterInteractive"
  src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `}
</Script>

        {/* Starfield Background */}
        <div className="starfield" aria-hidden="true" />

        {/* Site Header (top bar + nav) */}
        <SiteHeader />

        {/* Main Content */}
        <main className="relative z-10 bg-white text-gray-900">{children}</main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}