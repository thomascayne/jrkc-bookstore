// components\LandingPageContent.tsx
'use client';

import BookDetails from '@/components/BookDetails';
import BookPagination from '@/components/BookPagination';
import ClearFiltersButton from '@/components/ClearFiltersButton';
import StarRating from '@/components/StarRating';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { useBooksByCategory } from '@/hooks/useBooksByCategory';
import { useCachedCategories } from '@/hooks/useCachedCategories';
import { useUrlSync } from '@/hooks/useUrlSync';
import { IBookInventory } from '@/interfaces/IBookInventory';
import {
  catalogSearchParamsWithFilters,
  catalogUrl,
  positivePageNumber,
  withCatalogFilter,
  type CatalogSortBy,
  type CatalogSortOrder,
  type FilterOptions,
} from '@/utils/catalogFilters';
import { Button, Input, Link, Slider } from '@heroui/react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function LandingPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const { openFullScreenModal } = useFullScreenModal();
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCachedCategories();

  const booksPerPage = 24;
  const activePathname = pathname ?? '/';
  const currentPage = positivePageNumber(searchParams?.get('page') ?? null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const searchQuery = searchParams?.get('q') || '';

  useUrlSync(setFilters);

  useEffect(() => {
    setPriceRange([filters.price?.min ?? 0, filters.price?.max ?? 100]);
  }, [filters.price?.max, filters.price?.min]);

  const {
    displayedBooks,
    isLoading,
    error,
    totalBooks,
    totalPages,
    isFetching,
    prefetchNextPage,
  } = useBooksByCategory(
    booksPerPage,
    'all',
    filters,
    currentPage,
    searchQuery,
  );

  const updateURLParams = useCallback(
    (newFilters: FilterOptions) => {
      const parameters = catalogSearchParamsWithFilters(
        searchParams,
        newFilters,
      );
      router.push(catalogUrl(activePathname, parameters), { scroll: false });
    },
    [activePathname, router, searchParams],
  );

  const handleFilterChange = useCallback(
    (
      filterName: keyof FilterOptions,
      value: FilterOptions[keyof FilterOptions],
    ) => {
      updateURLParams(withCatalogFilter(filters, filterName, value));
    },
    [filters, updateURLParams],
  );

  const clearAllFilters = () => {
    updateURLParams({});
  };

  const handlePriceFilterGo = () => {
    handleFilterChange('price', { min: priceRange[0], max: priceRange[1] });
  };

  const handleBookClick = (book: IBookInventory) => {
    openFullScreenModal(<BookDetails bookId={book.id} />, `${book.title}`);
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      const current = new URLSearchParams(
        searchParams ? Array.from(searchParams.entries()) : [],
      );
      current.set('page', newPage.toString());
      router.push(catalogUrl(activePathname, current), { scroll: false });
    },
    [activePathname, router, searchParams],
  );

  if (error) return <div>Error loading books: {error.message}</div>;

  return (
    <div className="flex w-full flex-col md:flex-row">
      {/* Filters column */}
      <aside className="sidebarfilter-area w-full box-border border-divider bg-content1 p-4 text-foreground transition-transform-background md:w-[200px] md:border-r">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Filters</h2>
          <ClearFiltersButton
            filters={filters}
            onClearFilters={clearAllFilters}
          />
        </div>

        <div className="space-y-4">
          {/* Price Filter */}
          <div className="flex flex-col items-start">
            <h3 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Price
            </h3>
            <Slider
              size="sm"
              color="warning"
              step={1}
              minValue={0}
              maxValue={100}
              value={priceRange}
              onChange={(value) => setPriceRange(value as [number, number])}
              className="max-w-md"
            />
            <div className="flex w-full items-center my-2">
              <Input
                size="sm"
                value={`$${priceRange[0]} - $${priceRange[1]}`}
                readOnly
                className="max-w-[100px] mr-2"
              />
              <Button size="sm" onPress={handlePriceFilterGo}>
                Go
              </Button>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Customer Rating
            </h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                type="button"
                key={rating}
                className={`mb-1 flex cursor-pointer rounded-md px-2 text-[0.9rem] text-foreground hover:bg-default-100 hover:underline hover:underline-offset-2 ${
                  filters.rating_min === rating
                    ? 'bg-success text-success-foreground'
                    : ''
                }`}
                aria-pressed={filters.rating_min === rating}
                onClick={() => handleFilterChange('rating_min', rating)}
              >
                <StarRating rating={rating} />
                <span className="mx-2 text-sm">{rating}</span>
                {filters.rating_min === rating && <FaTimes />}
              </button>
            ))}
          </div>

          {/* Availability Filter */}
          <div>
            <h3 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Availability
            </h3>
            <button
              type="button"
              className={`mb-1 flex cursor-pointer rounded-lg px-2 text-[0.9rem] text-foreground hover:bg-default-100 hover:underline hover:underline-offset-2 ${
                filters.in_stock ? 'bg-success text-success-foreground' : ''
              }`}
              aria-pressed={Boolean(filters.in_stock)}
              onClick={() => handleFilterChange('in_stock', true)}
            >
              <span className="mr-2">Hide out of stock</span>
              {filters.in_stock && <FaTimes />}
            </button>
          </div>

          {/* Discount Filter */}
          <div>
            <h3 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Discounts
            </h3>
            {[80, 70, 60, 50, 40, 30, 20, 10].map((percent) => (
              <button
                type="button"
                key={percent}
                className={`flex cursor-pointer px-2 text-[0.9rem] text-foreground hover:bg-default-100 hover:underline hover:underline-offset-2 ${
                  filters.discount_percentage_min === percent
                    ? 'bg-success text-success-foreground'
                    : ''
                }`}
                aria-pressed={filters.discount_percentage_min === percent}
                onClick={() =>
                  handleFilterChange('discount_percentage_min', percent)
                }
              >
                <span className="mr-2">{percent}% off or more</span>
                {filters.discount_percentage_min === percent && <FaTimes />}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Sort By
            </h3>
            <div className="filter-custom-select mb-2">
              <select
                aria-label="Sort books by"
                value={filters.sort_by || 'average_rating'}
                onChange={(event) =>
                  handleFilterChange(
                    'sort_by',
                    event.target.value as CatalogSortBy,
                  )
                }
              >
                <option value="discount_percentage">Percent off</option>
                <option value="price">Price</option>
                <option value="average_rating">Rating</option>
              </select>
            </div>
            <div className="filter-custom-select mb-4">
              <select
                aria-label="Sort direction"
                value={filters.sort_order || 'DESC'}
                onChange={(event) =>
                  handleFilterChange(
                    'sort_order',
                    event.target.value as CatalogSortOrder,
                  )
                }
              >
                <option value="ASC">Low to High</option>
                <option value="DESC">High to Low</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col items-start">
            <h4 className="mb-3 flex w-full rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
              Categories
            </h4>
            {isCategoriesLoading ? (
              <p className="px-2 text-foreground/70">Loading categories...</p>
            ) : categoriesError ? (
              <p className="px-2 text-danger">Error loading categories</p>
            ) : (
              categories.map((category, index) => (
                <Link
                  className="w-full px-2 text-[0.9rem] text-foreground hover:bg-default-100 hover:text-primary hover:underline hover:underline-offset-2"
                  id={`${category.id}-${index}`}
                  key={`${category.key}-${index}`}
                  href={`/category/${category.key}`}
                >
                  <span>{category.label}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Book List and Content Area */}
      <div className="relative min-w-0 w-full flex-1 p-4">
        {isLoading || isFetching ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 text-foreground">
            <div className="loader">Loading...</div>
          </div>
        ) : null}

        <div className="mb-4 flex flex-colo items-center md:flex-row md:justify-between">
          <h1 className="text-3xl font-bold">JRKC Book Store</h1>
          <BookPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={activePathname}
            onPageChange={handlePageChange}
            onNextPageHover={prefetchNextPage}
          />
        </div>

        {displayedBooks.length === 0 && !isFetching ? (
          <div className="w-full text-center py-4 bg-yellow-100 text-yellow-800 mb-4">
            No books found matching the current filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
              {displayedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="group flex h-fit self-start flex-col overflow-hidden rounded-lg border border-divider bg-content1 text-foreground opacity-0 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div
                    className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-default-100"
                    onClick={() => handleBookClick(book)}
                  >
                    {book.thumbnail_image_link && (
                      <Image
                        alt={book.title}
                        src={book.thumbnail_image_link}
                        fill
                        sizes="(min-width: 1400px) 10vw, (min-width: 1280px) 12.5vw, (min-width: 1024px) 16.67vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
                        className="object-cover object-top transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                    )}
                    {book.is_promotion && book.discount_percentage && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                        {`${book.discount_percentage}% OFF`}
                      </div>
                    )}
                  </div>

                  <div className="flex h-28 flex-none flex-col justify-between p-2">
                    <div>
                      <h2 className="mb-1 min-h-8 line-clamp-2 text-sm font-normal leading-4">
                        {book.title}
                      </h2>
                      <p className="h-4 line-clamp-1 text-xs text-foreground/70">
                        {book.authors}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="mb-1 flex h-4 items-center">
                        {book.average_rating ? (
                          <>
                            <StarRating rating={book.average_rating} />
                            <span className="ml-2 text-sm">
                              {book.average_rating}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <div className="h-5 line-clamp-1 text-sm">
                        {book.is_promotion ? (
                          <>
                            <span className="mr-1 text-gray-500 line-through">
                              ${book.list_price.toFixed(2)}
                            </span>
                            <span>${book.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>${book.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex w-full justify-end">
              <BookPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={activePathname}
                onPageChange={handlePageChange}
                onNextPageHover={prefetchNextPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
