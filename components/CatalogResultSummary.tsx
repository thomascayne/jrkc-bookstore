interface CatalogResultSummaryProps {
  categoryLabel?: string;
  relatedSearch?: boolean;
  totalBooks: number;
}

export default function CatalogResultSummary({
  categoryLabel,
  relatedSearch = false,
  totalBooks,
}: CatalogResultSummaryProps) {
  return (
    <div className="text-sm text-foreground/70" role="status">
      <p>
        {totalBooks} {totalBooks === 1 ? 'book' : 'books'}
        {categoryLabel && !relatedSearch ? ' in this category' : ''}
      </p>
      {categoryLabel && relatedSearch && totalBooks > 0 && (
        <p>
          Related results for {categoryLabel}. These books may belong to other
          categories.
        </p>
      )}
    </div>
  );
}
