import Link from 'next/link';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'nova' | 'muted';
  href?: string;
}

const variantStyles = {
  gold: 'border-gold text-gold bg-gold/10',
  nova: 'border-nova text-nova bg-nova/10',
  muted: 'border-stardust text-stardust bg-stardust/10',
};

export default function Badge({ label, variant = 'gold', href }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 text-xs font-display tracking-widest uppercase rounded-full border';

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${variantStyles[variant]} hover:scale-105 transition-transform`}
      >
        {label}
      </Link>
    );
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]}`}>{label}</span>
  );
}