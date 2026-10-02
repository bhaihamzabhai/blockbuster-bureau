import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/siteSettings';
import { getUpcomingMovies } from '@/lib/tmdb';

/** Returns upcoming movies for the admin dashboard widget and the public /releases fallback. Data is public (same as /releases). */
export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (!settings.tmdbApiKey) {
      return NextResponse.json({ movies: [], configured: false });
    }
    const movies = await getUpcomingMovies(settings.tmdbApiKey, 1);
    return NextResponse.json({ movies: movies.slice(0, 12), configured: true });
  } catch (error) {
    console.error('API /releases failed:', error);
    return NextResponse.json({ movies: [], configured: true });
  }
}
