export interface UpcomingMovie {
  id: number;
  title: string;
  releaseDate: string; // YYYY-MM-DD or ''
  poster: string | null;
  overview: string;
}

const IMG_BASE = 'https://image.tmdb.org/t/p/w342';

/**
 * Fetches upcoming movies from TMDB (free API key).
 * Fails soft -> returns [].
 */
export async function getUpcomingMovies(apiKey: string, pages = 2): Promise<UpcomingMovie[]> {
  if (!apiKey) return [];
  const movies: UpcomingMovie[] = [];
  try {
    for (let page = 1; page <= pages; page++) {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${encodeURIComponent(apiKey)}&language=en-US&region=US&page=${page}`,
        { next: { revalidate: 86400 } } // refresh daily
      );
      if (!res.ok) break;
      const data = await res.json();
      for (const m of data.results || []) {
        movies.push({
          id: m.id,
          title: m.title || m.original_title || 'Untitled',
          releaseDate: m.release_date || '',
          poster: m.poster_path ? `${IMG_BASE}${m.poster_path}` : null,
          overview: m.overview || '',
        });
      }
    }
  } catch (error) {
    console.error('getUpcomingMovies failed:', error);
  }
  // Sort by release date, unknown dates last
  movies.sort((a, b) => {
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate.localeCompare(b.releaseDate);
  });
  return movies;
}

/** Days until release; negative = already released, null = unknown date. */
export function daysUntil(releaseDate: string): number | null {
  if (!releaseDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rel = new Date(releaseDate + 'T00:00:00');
  return Math.round((rel.getTime() - today.getTime()) / 86400000);
}
