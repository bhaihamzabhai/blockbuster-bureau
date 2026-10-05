import type { Metadata } from 'next';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
      languages: {
        'en-US': SITE_URL,
        'x-default': SITE_URL,
      },
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

  // Organization + WebSite structured data (sitelinks search box eligible).
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Blockbuster Bureau',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
        sameAs: [
          settings.youtubeUrl,
          settings.facebookUrl,
          settings.tiktokUrl,
        ].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Blockbuster Bureau',
        description: settings.siteDescription || DEFAULT_DESCRIPTION,
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en-US" className="dark">
      <body
        className={`${bebasNeue.variable} ${inter.variable} bg-void text-white min-h-screen font-body`}
      >
        {/* Structured data: Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />

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
        <SpeedInsights />
      </body>
    </html>
  );
}