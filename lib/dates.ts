/**
 * Post date helpers.
 *
 * Post dates arrive as Firestore Timestamps on the server, but cross into
 * client components as plain `{ seconds, nanoseconds }` objects (Next.js
 * serializes props). These helpers accept every shape gracefully instead
 * of rendering "Invalid Date".
 */

export function toPostMillis(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  }
  const v = value as {
    toDate?: unknown;
    seconds?: unknown;
    nanoseconds?: unknown;
    _seconds?: unknown;
  };
  if (typeof v.toDate === 'function') {
    try {
      return (v.toDate as () => Date)().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof v.seconds === 'number') {
    const nanos = typeof v.nanoseconds === 'number' ? v.nanoseconds : 0;
    return v.seconds * 1000 + Math.floor(nanos / 1e6);
  }
  // Some serializers emit _seconds.
  if (typeof v._seconds === 'number') return v._seconds * 1000;
  return 0;
}

/** "Oct 2, 2026" — returns '' when the value isn't a real date. */
export function formatPostDate(value: unknown): string {
  const ms = toPostMillis(value);
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
