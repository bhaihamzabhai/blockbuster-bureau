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
  const videos = await getChannelVideos(settings.youtubeChannelId);

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

        {videos.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <Youtube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No videos found yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              {settings.youtubeChannelId
                ? 'The channel feed could not be loaded right now — please try again later.'
                : 'The admin needs to add the YouTube Channel ID in dashboard Settings → Social Links.'}
            </p>
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </div>
  );
}
