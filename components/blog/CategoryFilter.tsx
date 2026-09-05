'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types';

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') as Category | null;

  const handleCategoryClick = (category: Category | null) => {
    if (category) {
      router.push(`/blog?category=${category}`);
    } else {
      router.push('/blog');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {/* All posts button */}
      <button
        onClick={() => handleCategoryClick(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !activeCategory
            ? 'bg-gold text-void'
            : 'bg-nebula text-white hover:bg-gold/20'
        }`}
      >
        All Posts
      </button>

      {/* Category buttons */}
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category
              ? 'bg-gold text-void'
              : 'bg-nebula text-white hover:bg-gold/20'
          }`}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  );
}