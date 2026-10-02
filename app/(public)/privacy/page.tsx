import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Blockbuster Bureau — how we collect, use, and protect your data, including Google AdSense advertising cookies.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12">
          <p className="text-gray-400 text-xs font-bold tracking-[0.25em] uppercase mb-3">
            Legal
          </p>
          <h1 className="text-gray-900 font-extrabold text-3xl md:text-4xl uppercase tracking-wide mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Last updated: October 2026
          </p>

          <div className="prose-light space-y-6">
            <section>
              <h3>1. Information We Collect</h3>
              <p>
                Blockbuster Bureau (&quot;we&quot;, &quot;our&quot;) collects
                minimal information to operate this website: pages you visit,
                approximate location derived from your IP address, and device
                or browser details for analytics. If you create an account or
                contact us, we store the details you provide (such as your
                name and email address).
              </p>
            </section>

            <section>
              <h3>2. How We Use Information</h3>
              <p>
                We use collected information to operate and improve the site,
                measure readership, prevent abuse, and display relevant
                content and advertising.
              </p>
            </section>

            <section>
              <h3>3. Google AdSense &amp; Advertising Cookies</h3>
              <p>
                We use Google AdSense to serve advertisements. Google uses
                cookies, including the DoubleClick cookie, to serve ads based
                on your prior visits to this and other websites. Google&apos;s
                use of advertising cookies enables it and its partners to serve
                ads based on your visit to our site and/or other sites on the
                Internet.
              </p>
              <p>
                You may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Ads Settings
                </a>
                . Alternatively, you can opt out of third-party vendors&apos;
                use of cookies for personalized advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.aboutads.info/choices
                </a>
                .
              </p>
            </section>

            <section>
              <h3>4. Analytics</h3>
              <p>
                We use Google Analytics to understand aggregate usage patterns.
                Analytics data is anonymized and never sold to third parties.
              </p>
            </section>

            <section>
              <h3>5. Embedded Content</h3>
              <p>
                Articles may include embedded content (e.g. YouTube videos).
                Embedded content from other websites behaves as if you visited
                those websites directly and may collect data about you.
              </p>
            </section>

            <section>
              <h3>6. Data Security</h3>
              <p>
                We apply industry-standard safeguards, including encrypted
                connections (HTTPS) and restricted database access rules, to
                protect your information.
              </p>
            </section>

            <section>
              <h3>7. Your Rights</h3>
              <p>
                You may request access to, correction of, or deletion of your
                personal data at any time by contacting us through the details
                below.
              </p>
            </section>

            <section>
              <h3>8. Contact</h3>
              <p>
                For privacy questions, contact us at:{' '}
                <a href="mailto:privacy@blockbusterbureau.com">
                  privacy@blockbusterbureau.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
