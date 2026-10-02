export interface YTVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
}

/** YouTube Shorts can be up to 3 minutes long — anything longer is a "long" video. */
const SHORTS_MAX_SECONDS = 180;

/**
 * Fetches a channel's latest LONG videos (Shorts filtered out).
 *
 * Source: the channel's public RSS feed (no key needed). When a YouTube
 * Data API key is provided, durations are fetched and Shorts (<=3 min)
 * are removed. Without a key, all videos are returned (fail-open).
 */
export async function getChannelVideos(
  channelId: string,
  limit = 12,
  apiKey?: string
): Promise<YTVideo[]> {
  const { videos } = await getChannelVideosDetailed(channelId, limit, apiKey);
  return videos;
}

/** Same as getChannelVideos, plus whether Shorts filtering was actually applied. */
export async function getChannelVideosDetailed(
  channelId: string,
  limit = 12,
  apiKey?: string
): Promise<{ videos: YTVideo[]; shortsFiltered: boolean }> {
  if (!channelId) return { videos: [], shortsFiltered: false };
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
      { next: { revalidate: 21600 } } // refresh every 6 hours
    );
    if (!res.ok) return { videos: [], shortsFiltered: false };
    const xml = await res.text();

    const entries = xml.split('<entry>').slice(1);
    const videos: YTVideo[] = [];

    // Parse extra entries so we still reach `limit` after Shorts are removed.
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
      if (videos.length >= limit * 2 + 6) break;
    }

    if (apiKey) {
      const durations = await getVideoDurations(
        videos.map((v) => v.id),
        apiKey
      );
      const filtered = videos
        .filter((v) => {
          const d = durations.get(v.id);
          // Fail-open: if duration unknown, keep the video.
          return d === undefined || d > SHORTS_MAX_SECONDS;
        })
        .slice(0, limit);
      return { videos: filtered, shortsFiltered: durations.size > 0 };
    }

    return { videos: videos.slice(0, limit), shortsFiltered: false };
  } catch (error) {
    console.error('getChannelVideos failed:', error);
    return { videos: [], shortsFiltered: false };
  }
}

/** Batch-fetches video durations via YouTube Data API v3 (1 quota unit per 50 videos). */
async function getVideoDurations(
  ids: string[],
  apiKey: string
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (ids.length === 0) return map;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(',')}&key=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) {
      console.error('YouTube videos.list failed:', res.status);
      return map;
    }
    const data = await res.json();
    for (const item of data.items || []) {
      const secs = parseISO8601Duration(item.contentDetails?.duration);
      if (secs !== null && item.id) map.set(item.id, secs);
    }
  } catch (error) {
    console.error('getVideoDurations failed:', error);
  }
  return map;
}

/** "PT4M13S" -> 253 */
function parseISO8601Duration(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return h * 3600 + min * 60 + s;
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
