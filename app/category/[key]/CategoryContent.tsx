// app/category/[key]/CategoryContent.tsx

'use client';

import React, { useCallback, useState } from 'react';
import { useBooksByCategory } from '@/hooks/useBooksByCategory';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { Button, Input, Link, Slider } from '@nextui-org/react';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import { addCartItem } from '@/stores/cartStore';
import BookDetails from '@/components/BookDetails';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { FaTimes } from 'react-icons/fa';
import { BookCategory } from '@/interfaces/BookCategory';
import { fetchBookCategories } from '@/utils/bookCategoriesApi';
import { FilterOptions } from '@/utils/fetchBooksByCategory ';
import { useUrlSync } from '@/hooks/useUrlSync';
import BookPagination from '@/components/BookPagination';
import ClearFiltersButton from '@/components/ClearFiltersButton';
import { useCachedCategories } from '@/hooks/useCachedCategories';

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const booksPerPage = 24;
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams && searchParams.get('page')) || 1;
  });

  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const { openFullScreenModal: openFullScreenModal } = useFullScreenModal();
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCachedCategories();

  const [filters, setFilters] = useState<FilterOptions>({});
  const searchQuery = searchParams ? searchParams.get('q') || '' : '';

  useUrlSync(filters, setFilters);

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
      const params = new URLSearchParams(window.location.search);

      // Remove all existing filter params
      Array.from(params.keys()).forEach((key) => {
        if (key !== 'q' && key !== 'page') {
          // Preserve search query and page number
          params.delete(key);
        }
      });

      // Add new filter params
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'price' && typeof value === 'object') {
            params.set(key, `${value.min},${value.max}`);
          } else {
            params.set(key, value.toString());
          }
        }
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl);
    },
    [router],
  );

  const handleFilterChange = useCallback(
    (filterName: keyof FilterOptions, value: any) => {
      const newFilters = { ...filters };

      if (filterName === 'sort_by' || filterName === 'sort_order') {
        newFilters[filterName] = value;
      } else if (filterName === 'price') {
        if (
          newFilters.price &&
          newFilters.price.min === value.min &&
          newFilters.price.max === value.max
        ) {
          delete newFilters.price;
        } else {
          newFilters.price = value;
        }
      } else if (newFilters[filterName] === value) {
        delete newFilters[filterName];
      } else {
        newFilters[filterName] = value;
      }

      // Remove undefined or null values
      Object.keys(newFilters).forEach((key) => {
        if (
          newFilters[key as keyof FilterOptions] === undefined ||
          newFilters[key as keyof FilterOptions] === null
        ) {
          delete newFilters[key as keyof FilterOptions];
        }
      });

      updateURLParams(newFilters);
    },
    [filters, updateURLParams],
  );

  const clearAllFilters = () => {
    router.push(pathname as string);
  };

  const handlePriceFilterGo = () => {
    handleFilterChange('price', { min: priceRange[0], max: priceRange[1] });
  };

  const handleBookClick = (book: IBookInventory) => {
    openFullScreenModal(<BookDetails bookId={book.id} />, `${book.title}`);
  };

  const handleAddToCart = (book: IBookInventory) => {
    addCartItem(book);
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);

      if (!searchParams) {
        return;
      }

      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('page', newPage.toString());
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    },
    [pathname, router, searchParams],
  );

  if (error) return <div>Error loading books: {error.message}</div>;

  return (
    <div className="flex w-full flex-col md:flex-row">
      {/* Filters column */}
      <div className="w-full md:w-[200px] p-4 transition-transform-background bg-content1 text-background box-border">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <ClearFiltersButton
          filters={filters}
          onClearFilters={clearAllFilters}
        />

        <div className="space-y-4">
          {/* Price Filter */}
          <div className="flex flex-col items-start">
            <h3 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
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
              <Button isIconOnly size="sm" onClick={handlePriceFilterGo}>
                Go
              </Button>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
              Customer Rating
            </h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Link
                key={rating}
                className={`flex px-2 rounded-md hover:underline-offset-2 text-[0.9rem] mb-1 cursor-pointer ${filters.rating_min === rating ? 'bg-success-400 text-white' : ''}`}
                onClick={() => handleFilterChange('rating_min', rating)}
              >
                <StarRating rating={rating} />
                <span className="mx-2 text-sm">{rating}</span>
                {filters.rating_min === rating && <FaTimes />}
              </Link>
            ))}
          </div>

          {/* Availability Filter */}
          <div>
            <h3 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
              Availability
            </h3>
            <Link
              className={`flex px-2 hover:underline rounded-lg hover:underline-offset-2 text-[0.9rem] mb-1 cursor-pointer ${filters.in_stock ? 'bg-success text-white' : ''}`}
              onClick={() => handleFilterChange('in_stock', !filters.in_stock)}
            >
              <span className="mr-2">Hide out of stock</span>
              <span>{filters.in_stock && <FaTimes />}</span>
            </Link>
          </div>

          {/* Discount Filter */}
          <div>
            <h3 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
              Discounts
            </h3>
            {[80, 70, 60, 50, 40, 30, 20, 10].map((percent) => (
              <Link
                key={percent}
                className={`flex px-2 hover:underline hover:underline-offset-2 text-[0.9rem] cursor-pointer ${filters.discount_percentage_min === percent ? 'bg-success text-white' : ''}`}
                onClick={() =>
                  handleFilterChange('discount_percentage_min', percent)
                }
              >
                <span className="mr-2">{percent}% off or more</span>
                {filters.discount_percentage_min === percent && <FaTimes />}
              </Link>
            ))}
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
              Sort By
            </h3>
            <div className="filter-custom-select mb-2">
              <select
                value={filters.sort_by || 'average_rating'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              >
                <option value="discount_percentage">Percent off</option>
                <option value="price">Price</option>
                <option value="average_rating">Rating</option>
              </select>
            </div>
            <div className="filter-custom-select mb-4">
              <select
                value={filters.sort_order || 'DESC'}
                onChange={(e) =>
                  handleFilterChange(
                    'sort_order',
                    e.target.value as 'ASC' | 'DESC',
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
            <h4 className="flex mb-3 font-semibold py-1 px-2 bg-primary-400 text-white rounded-md w-full">
              Categories
            </h4>
            {isCategoriesLoading ? (
              <p>Loading categories...</p>
            ) : categoriesError ? (
              <p>Error loading categories</p>
            ) : (
              categories.map((category, index) => (
                <Link
                  className="px-2 hover:underline hover:underline-offset-2 text-[0.9rem]"
                  id={`${category.id}-${index}`}
                  key={`${category.key}-${index}`}
                  href={`/category/${category.key}`}
                >
                  <span>{category.label}</span>
                </Link>
              ))
            )}{' '}
          </div>
        </div>
      </div>

      {/* Book List and Content Area */}
      <div className="w-full flex-flex-grow p-4 relative">
        {isLoading || isFilterLoading ? (
          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center">
            <div className="loader">Loading...</div>
          </div>
        ) : null}

        <div className="mb-4 flex flex-colo items-center md:flex-row md:justify-between">
          <h1 className="text-3xl font-bold">JRKC Book Store</h1>
          <BookPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={pathname as string}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
              {displayedBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex flex-col h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out group opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div
                    className="relative aspect-[2/3] cursor-pointer px-2 pt-2 pb-0"
                    onClick={() => handleBookClick(book)}
                  >
                    {book.thumbnail_image_link && (
                      <div className="relative w-full h-full flex items-start justify-center">
                        <div
                          className="relative w-full"
                          style={{ paddingBottom: '150%' }}
                        >
                          <Image
                            alt={book.title}
                            src={book.thumbnail_image_link}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="top"
                            className="transition-transform rounded-tl rounded-tr duration-300 ease-in-out group-hover:scale-105"
                          />
                        </div>
                      </div>
                    )}
                    {book.is_promotion && book.discount_percentage && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                        {`${book.discount_percentage}% OFF`}
                      </div>
                    )}
                  </div>

                  <div className="flex-grow p-2 flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm font-normal line-clamp-2 mb-2">
                        {book.title}
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {book.authors}
                      </p>
                    </div>

                    <div className="mt-auto">
                      {book.average_rating && (
                        <div className="flex items-center mb-2">
                          <StarRating rating={book.average_rating} />
                          <span className="ml-2 text-sm">
                            {book.average_rating}
                          </span>
                        </div>
                      )}
                      {book.list_price && (
                        <div className="text-sm">$ {book.list_price}</div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-center py-2 cursor-pointer transform translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(book);
                      }}
                    >
                      QUICK ADD
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex w-full justify-end">
              <BookPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={pathname as string}
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
