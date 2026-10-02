import Link from 'next/link';

interface TagProps {
  label: string;
  href?: string;
}

export default function Tag({ label, href }: TagProps) {
  const baseStyles =
    'inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-brand/15 hover:text-brand transition-colors';

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        #{label}
      </Link>
    );
  }

  return <span className={baseStyles}>#{label}</span>;
}