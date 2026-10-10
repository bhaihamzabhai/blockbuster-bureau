export interface UpcomingMovie {
  id: number;
  title: string;
  releaseDate: string; // YYYY-MM-DD or ''
  poster: string | null;
  overview: string;
  originalLanguage: string; // ISO 639-1 code, e.g. 'en'
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
          originalLanguage: m.original_language || '',
        });
      }
    }
  } catch (error) {
    console.error('getUpcomingMovies failed:', error);
  }
  // TMDB's /movie/upcoming?region=US also lists classic re-releases (their
  // release_date is the ORIGINAL premiere, e.g. 1971, so they sort to the top
  // as "Out now") and non-English regional films with US theatrical dates.
  // The page promises upcoming Hollywood releases, so keep only English-language
  // titles with a release date today or later.
  const todayIso = new Date().toISOString().slice(0, 10);
  return movies
    .filter(
      (m) =>
        m.originalLanguage === 'en' && (!m.releaseDate || m.releaseDate >= todayIso)
    )
    .sort((a, b) => {
      // Sort by release date, unknown dates last
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return a.releaseDate.localeCompare(b.releaseDate);
    });
}

/** Days until release; negative = already released, null = unknown date. */
export function daysUntil(releaseDate: string): number | null {
  if (!releaseDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rel = new Date(releaseDate + 'T00:00:00');
  return Math.round((rel.getTime() - today.getTime()) / 86400000);
}
