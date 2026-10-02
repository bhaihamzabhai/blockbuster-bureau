import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/siteSettings';
import { getChannelVideos } from '@/lib/youtube';

/** Returns channel videos for the public /videos page (self-healing when the ID is added later). */
export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (!settings.youtubeChannelId) {
      return NextResponse.json({ videos: [], configured: false });
    }
    const videos = await getChannelVideos(settings.youtubeChannelId, 12, settings.youtubeApiKey);
    return NextResponse.json({ videos, configured: true });
  } catch (error) {
    console.error('API /videos failed:', error);
    return NextResponse.json({ videos: [], configured: true });
  }
}
