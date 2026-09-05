'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-2">Settings & SEO Panel</h1>
      <p className="text-gray-400 mb-8">Manage your site preferences, SEO meta tags, and administrator profile.</p>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-700' : 'bg-red-900/50 text-red-200 border border-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Site Configuration Section */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Site Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Site Description</label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Control Panel Section */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-green-400">SEO Control Panel</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Default Meta Title (SEO Title)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. Blockbuster Bureau - Digital Agency"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="marketing agency, digital marketing, web development"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Google Analytics / Tag ID</label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Administrator Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Admin Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                value={adminEmail}
                disabled
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
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