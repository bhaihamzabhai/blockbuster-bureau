import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/siteSettings';
import { getChannelVideosDetailed } from '@/lib/youtube';

// Always read live settings — never serve a stale cached response,
// otherwise a newly saved API key / channel ID would not take effect.
export const dynamic = 'force-dynamic';

/** Returns channel videos for the public /videos page (self-healing when the ID is added later). */
export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (!settings.youtubeChannelId) {
      return NextResponse.json({ videos: [], configured: false, shortsFiltered: false });
    }
    const { videos, shortsFiltered } = await getChannelVideosDetailed(
      settings.youtubeChannelId,
      12,
      settings.youtubeApiKey
    );
    return NextResponse.json({ videos, configured: true, shortsFiltered });
  } catch (error) {
    console.error('API /videos failed:', error);
    return NextResponse.json({ videos: [], configured: true, shortsFiltered: false });
  }
}
