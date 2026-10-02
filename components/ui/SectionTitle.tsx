interface SectionTitleProps {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({
  eyebrow,
  title,
  align = 'left',
}: SectionTitleProps) {
  const alignmentStyles =
    align === 'center' ? 'text-center' : 'text-left border-l-4 border-gold pl-4';

  return (
    <div className={`mb-8 relative ${alignmentStyles}`}>
      {/* Cinematic spotlight glow behind the title */}
      <div
        className="absolute -top-10 -left-10 w-64 h-32 bg-gold/10 blur-3xl rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <p className="text-stardust text-sm tracking-[0.25em] uppercase mb-2 relative">
        {eyebrow}
      </p>
      <h2 className="text-display text-4xl md:text-5xl text-white relative">
        {title}
      </h2>
    </div>
  );
}