import Link from 'next/link';

import type { FilterOptions } from '@/utils/catalogFilters';

interface CatalogEmptyStateProps {
  categoryLabel?: string;
  error?: boolean;
  filters: FilterOptions;
  onReset: () => void;
  onRetry: () => void;
  searchQuery: string;
}

export default function CatalogEmptyState({
  categoryLabel,
  error = false,
  filters,
  onReset,
  onRetry,
  searchQuery,
}: CatalogEmptyStateProps) {
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    filters.author ||
    filters.discount_percentage_min !== undefined ||
    filters.in_stock ||
    filters.price ||
    filters.rating_min !== undefined ||
    filters.ratings_count_min !== undefined,
  );
  const heading = error
    ? 'Books are temporarily unavailable'
    : hasActiveFilters
      ? 'No books match your search or filters'
      : categoryLabel
        ? `No ${categoryLabel} books available right now`
        : 'No books available right now';

  return (
    <section
      aria-live="polite"
      className="rounded-md border border-divider bg-content1 px-4 py-6 text-foreground"
      role={error ? 'alert' : 'status'}
    >
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p className="mt-1 text-sm text-foreground/70">
        {error
          ? 'We could not load the catalog. Please try again.'
          : hasActiveFilters
            ? 'Clear the search and filters to see more books.'
            : categoryLabel
              ? 'Explore the full catalog or choose another category.'
              : 'Choose a category to explore other books.'}
      </p>
      <div className="mt-4">
        {error ? (
          <button
            className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
        ) : hasActiveFilters ? (
          <button
            className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            onClick={onReset}
            type="button"
          >
            Clear search and filters
          </button>
        ) : categoryLabel ? (
          <Link className="text-sm font-medium text-primary underline" href="/">
            Browse all books
          </Link>
        ) : (
          <a
            className="text-sm font-medium text-primary underline"
            href="#catalog-categories"
          >
            Browse categories
          </a>
        )}
      </div>
    </section>
  );
}
