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
    <div className={`mb-8 ${alignmentStyles}`}>
      <p className="text-stardust text-sm tracking-wide mb-2">{eyebrow}</p>
      <h2 className="text-display text-4xl md:text-5xl text-white">{title}</h2>
    </div>
  );
}