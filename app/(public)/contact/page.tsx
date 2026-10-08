import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { getSiteSettings } from '@/lib/siteSettings';
import SocialIcons from '@/components/layout/SocialIcons';
import ContactForm, { ContactFormHeading } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Blockbuster Bureau — news tips, corrections, partnerships, and press inquiries.',
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-gray-900 font-extrabold text-3xl md:text-4xl uppercase tracking-wide">
            Contact <span className="text-brand">Us</span>
          </h1>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
            News tips, corrections, partnerships, or press inquiries — we read
            every message.
          </p>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
            <ContactFormHeading />
            <ContactForm />
          </div>

          {/* Direct contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-bold mb-3">Email us directly</h2>
              <a
                href="mailto:contact@blockbusterbureau.com"
                className="inline-flex items-center gap-2 text-brand hover:text-brand-dark font-semibold transition-colors break-all"
              >
                <Mail className="w-5 h-5 shrink-0" />
                contact@blockbusterbureau.com
              </a>
              <p className="text-gray-500 text-sm mt-3">
                For corrections, please include the article link — we fix
                verified errors promptly.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-bold mb-3">Follow us</h2>
              <SocialIcons settings={settings} />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-bold mb-2">Press & partnerships</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Screeners, interviews, and collaboration requests are welcome.
                Tell us about your project in the form and we&apos;ll reply
                within a few days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


{/* deploy test */}
