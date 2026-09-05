import Link from 'next/link';

interface TagProps {
  label: string;
  href?: string;
}

export default function Tag({ label, href }: TagProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 text-sm bg-nebula rounded hover:bg-gold/20 transition-colors';

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        #{label}
      </Link>
    );
  }

  return <span className={baseStyles}>#{label}</span>;
}