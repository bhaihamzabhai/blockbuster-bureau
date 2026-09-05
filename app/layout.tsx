import type { Metadata } from 'next';
import Script from 'next/script';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';
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

export const metadata: Metadata = {
  title: {
    template: '%s | Blockbuster Bureau',
    default: 'Blockbuster Bureau — The Bureau Never Closes',
  },
  description:
    "Your daily source for Hollywood news, upcoming movie releases, actor interviews, and exclusive entertainment updates. The Bureau Never Closes.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Blockbuster Bureau',
    title: 'Blockbuster Bureau — The Bureau Never Closes',
    description:
      "Your daily source for Hollywood news, upcoming movie releases, actor interviews, and exclusive entertainment updates.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blockbuster Bureau — The Bureau Never Closes',
    description:
      "Your daily source for Hollywood news, upcoming movie releases, actor interviews, and exclusive entertainment updates.",
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
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
        
        {/* Main Content */}
        <main className="relative z-10">{children}</main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}