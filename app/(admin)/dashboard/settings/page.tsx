'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Youtube, Facebook, Music2, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Film } from 'lucide-react';
import type { HeroSlide } from '@/lib/siteSettings';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [siteTitle, setSiteTitle] = useState('Blockbuster Bureau');
  const [siteDescription, setSiteDescription] = useState('Digital marketing & creative agency');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // SEO states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');

  // Social links (shown in header/footer, link to your channels)
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');

  // Hero slider slides (max 5)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    if (auth.currentUser) {
      setAdminName(auth.currentUser.displayName || '');
      setAdminEmail(auth.currentUser.email || '');
    }

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.siteTitle) setSiteTitle(data.siteTitle);
          if (data.siteDescription) setSiteDescription(data.siteDescription);
          if (data.metaTitle) setMetaTitle(data.metaTitle);
          if (data.metaKeywords) setMetaKeywords(data.metaKeywords);
          if (data.googleAnalyticsId) setGoogleAnalyticsId(data.googleAnalyticsId);
          if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
          if (data.youtubeChannelId) setYoutubeChannelId(data.youtubeChannelId);
          if (data.tiktokUrl) setTiktokUrl(data.tiktokUrl);
          if (data.facebookUrl) setFacebookUrl(data.facebookUrl);
          if (data.tmdbApiKey) setTmdbApiKey(data.tmdbApiKey);
          if (data.youtubeApiKey) setYoutubeApiKey(data.youtubeApiKey);
          if (Array.isArray(data.heroSlides)) setHeroSlides(data.heroSlides);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // ---- Hero slides helpers ----
  const addSlide = () => {
    if (heroSlides.length >= 5) return;
    setHeroSlides([
      ...heroSlides,
      { id: `slide-${Date.now()}`, image: '', title: '', subtitle: '', link: '' },
    ]);
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setHeroSlides(heroSlides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSlide = (id: string) => {
    setHeroSlides(heroSlides.filter((s) => s.id !== id));
  };

  const moveSlide = (index: number, dir: 1 | -1) => {
    const next = [...heroSlides];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setHeroSlides(next);
  };

  const handleSave = async (e: React.FormEvent) => {    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (auth.currentUser && adminName) {
        await updateProfile(auth.currentUser, {
          displayName: adminName,
        });
      }

      await setDoc(doc(db, 'settings', 'general'), {
        siteTitle,
        siteDescription,
        metaTitle,
        metaKeywords,
        googleAnalyticsId,
        youtubeUrl,
        youtubeChannelId,
        tiktokUrl,
        facebookUrl,
        tmdbApiKey,
        youtubeApiKey,
        heroSlides,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setMessage({ text: 'Settings and SEO panel successfully updated!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to update settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-2">Settings & SEO Panel</h1>
      <p className="text-gray-400 mb-8">Manage your site preferences, SEO meta tags, and administrator profile.</p>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-700' : 'bg-red-900/50 text-red-200 border border-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Site Configuration Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Site Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Control Panel Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-green-700">SEO Control Panel</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Title (SEO Title)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Blockbuster Bureau - Digital Agency"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="marketing agency, digital marketing, web development"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics / Tag ID</label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-1 text-red-600">Social Links</h2>
          <p className="text-sm text-gray-500 mb-4">
            These links appear as icons in the website header and footer. Leave empty to hide an icon.
          </p>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Youtube className="w-4 h-4 text-red-500" /> YouTube Channel ID
              </label>
              <input
                type="text"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value.trim())}
                placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Powers the /videos page (auto-updates from your channel). Find it in YouTube Studio → Settings → Channel → Advanced settings.
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Music2 className="w-4 h-4 text-gray-300" /> TikTok Profile URL
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@yourhandle"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4 text-blue-500" /> Facebook Page URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-1 text-sky-700">API Keys</h2>
          <p className="text-sm text-gray-500 mb-4">
            Powers the auto-updating /releases page (upcoming movies + countdowns).
          </p>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Youtube className="w-4 h-4 text-red-500" /> YouTube Data API Key
              </label>
              <input
                type="text"
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value.trim())}
                placeholder="Paste your YouTube Data API v3 key"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-brand"
              />
              <p className="text-xs text-gray-500 mt-1">
                Needed to hide Shorts from the /videos page (only long videos show). Free from Google Cloud Console → enable "YouTube Data API v3" → create API key. Tip: restrict the key to YouTube Data API v3.
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Film className="w-4 h-4 text-sky-700" /> TMDB API Key
              </label>
              <input
                type="text"
                value={tmdbApiKey}
                onChange={(e) => setTmdbApiKey(e.target.value.trim())}
                placeholder="Paste your free TMDB API key"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-sky-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Free at themoviedb.org → Settings → API. The releases page refreshes daily on its own.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Slides Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-amber-700">Hero Slider</h2>
            <button
              type="button"
              onClick={addSlide}
              disabled={heroSlides.length >= 5}
              className="flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Slide
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Up to 5 slides for the homepage banner. If empty, the latest articles are shown instead.
            Use the arrows to reorder.
          </p>

          {heroSlides.length === 0 && (
            <p className="text-sm text-gray-500 italic py-2">No custom slides yet — click “Add Slide”.</p>
          )}

          <div className="space-y-4">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-700" /> Slide {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-30" aria-label="Move up">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSlide(idx, 1)} disabled={idx === heroSlides.length - 1} className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-30" aria-label="Move down">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeSlide(slide.id)} className="p-1.5 text-red-600 hover:text-red-700" aria-label="Delete slide">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={slide.image}
                      onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-gray-800 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      placeholder="Big headline"
                      className="w-full bg-gray-800 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Link (where the slide goes)</label>
                    <input
                      type="text"
                      value={slide.link}
                      onChange={(e) => updateSlide(slide.id, 'link', e.target.value)}
                      placeholder="/blog/your-article"
                      className="w-full bg-gray-800 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                      placeholder="Short description under the title"
                      className="w-full bg-gray-800 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Administrator Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                value={adminEmail}
                disabled
                className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </form>
    </div>
  );
}