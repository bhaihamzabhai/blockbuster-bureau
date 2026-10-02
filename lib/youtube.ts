export interface YTVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
}

/**
 * Fetches a channel's latest videos via its public RSS feed.
 * No API key needed. Fails soft -> returns [].
 */
export async function getChannelVideos(channelId: string, limit = 12): Promise<YTVideo[]> {
  if (!channelId) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { next: { revalidate: 21600 } } // refresh every 6 hours
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const entries = xml.split('<entry>').slice(1);
    const videos: YTVideo[] = [];

    for (const entry of entries) {
      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>([^<]*)<\/title>/);
      const pubMatch = entry.match(/<published>([^<]+)<\/published>/);
      if (!idMatch) continue;
      const id = idMatch[1];
      videos.push({
        id,
        title: titleMatch ? decodeXml(titleMatch[1]) : 'Untitled video',
        published: pubMatch ? pubMatch[1] : '',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      if (videos.length >= limit) break;
    }
    return videos;
  } catch (error) {
    console.error('getChannelVideos failed:', error);
    return [];
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
