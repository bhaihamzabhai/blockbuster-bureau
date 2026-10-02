interface FilmStripProps {
  label?: string;
}

/**
 * Cinematic film-strip divider with sprocket perforations.
 * Optionally centers a label (e.g. "NOW SHOWING") on the strip.
 */
export default function FilmStrip({ label }: FilmStripProps) {
  // Generate perforation positions (percentage based, CSS-driven)
  const holes = Array.from({ length: 24 });

  return (
    <div className="relative w-full overflow-hidden" aria-hidden="true">
      {/* Top strip */}
      <div className="bg-black/60 border-y border-white/5">
        <div className="flex justify-between px-4 py-2">
          {holes.map((_, i) => (
            <div
              key={`t-${i}`}
              className="w-6 h-4 md:w-8 md:h-5 rounded-[4px] bg-gold/25"
            />
          ))}
        </div>
      </div>

      {/* Label band */}
      {label && (
        <div className="bg-gradient-to-r from-transparent via-gold/10 to-transparent py-3">
          <p className="text-center font-display text-gold text-xl md:text-2xl tracking-[0.35em] uppercase">
            {label}
          </p>
        </div>
      )}

      {/* Bottom strip */}
      <div className="bg-black/60 border-y border-white/5">
        <div className="flex justify-between px-4 py-2">
          {holes.map((_, i) => (
            <div
              key={`b-${i}`}
              className="w-6 h-4 md:w-8 md:h-5 rounded-[4px] bg-gold/25"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
