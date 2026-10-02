import { Metadata } from 'next';
import { Youtube } from 'lucide-react';
import VideoGrid from '@/components/youtube/VideoGrid';
import { getSiteSettings } from '@/lib/siteSettings';
import { getChannelVideos } from '@/lib/youtube';

export const metadata: Metadata = {
  title: 'Videos',
  description:
    'Watch the latest Blockbuster Bureau videos — Hollywood news, reviews and facecam updates from our YouTube channel.',
  alternates: { canonical: '/videos' },
};

export const revalidate = 21600; // refresh every 6 hours

export default async function VideosPage() {
  const settings = await getSiteSettings();
  const videos = await getChannelVideos(settings.youtubeChannelId, 12, settings.youtubeApiKey);
  const configured = !!settings.youtubeChannelId;

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <h1 className="text-gray-900 font-extrabold text-2xl uppercase tracking-wide border-l-4 border-brand pl-3">
              Latest Videos
            </h1>
            <p className="text-gray-500 mt-2 text-[15px]">
              Hollywood news, reviews and updates — watch right here or on YouTube.
            </p>
          </div>
          {settings.youtubeUrl && (
            <a
              href={settings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wide transition-colors shrink-0 self-start"
            >
              <Youtube className="w-5 h-5" />
              Subscribe
            </a>
          )}
        </div>

        <VideoGrid initialVideos={videos} initialConfigured={configured} />
      </div>
    </div>
  );
}
