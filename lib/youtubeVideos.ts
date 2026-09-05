import { ChannelVideo } from '@/types';

/**
 * Channel video library configuration
 * 
 * This file contains your channel's recent/featured videos.
 * Update this array whenever you want new videos to appear
 * in the YouTube picker inside the editor.
 * 
 * Future upgrade: Fetch dynamically via YouTube Data API v3
 * using NEXT_PUBLIC_YOUTUBE_API_KEY
 */

export const CHANNEL_VIDEOS: ChannelVideo[] = [
  {
    id: 'VIDEO_ID_1',
    title: 'Video Title Here',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_1/mqdefault.jpg',
  },
  {
    id: 'VIDEO_ID_2',
    title: 'Another Video',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_2/mqdefault.jpg',
  },
  {
    id: 'VIDEO_ID_3',
    title: 'Third Video',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_3/mqdefault.jpg',
  },
  {
    id: 'VIDEO_ID_4',
    title: 'Fourth Video',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_4/mqdefault.jpg',
  },
  {
    id: 'VIDEO_ID_5',
    title: 'Fifth Video',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_5/mqdefault.jpg',
  },
  {
    id: 'VIDEO_ID_6',
    title: 'Sixth Video',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_6/mqdefault.jpg',
  },
];

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(input: string): string | null {
  // Handle raw video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get YouTube thumbnail URL for a video ID
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'mqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options: {
    nocookie?: boolean;
    autoplay?: boolean;
    startSeconds?: number;
    rel?: boolean;
  } = {}
): string {
  const { nocookie = true, autoplay = false, startSeconds, rel = false } = options;

  const domain = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  const params = new URLSearchParams();

  if (autoplay) {
    params.set('autoplay', '1');
  }

  if (startSeconds) {
    params.set('start', startSeconds.toString());
  }

  if (!rel) {
    params.set('rel', '0');
  }

  const queryString = params.toString();
  return `https://${domain}/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}