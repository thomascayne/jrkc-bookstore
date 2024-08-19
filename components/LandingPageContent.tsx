'use client';

import React, { useState, useEffect } from 'react';
import {
  useBooksByCategory,
  SearchFilterOptions,
} from '@/hooks/useBooksByCategory';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { Button, Checkbox, Input, Slider } from '@nextui-org/react';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import EmptyBookshelf from '@/components/EmptyBookshelf';
import { addCartItem } from '@/stores/cartStore';
import BookDetails from '@/components/BookDetails';
import CategoryLoadingSkeleton from '@/components/CategoryLoadingSkeleton';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { BiArrowToTop, BiCaretDown } from 'react-icons/bi';
import { FaTimes } from 'react-icons/fa';

export default function LandingPageContent() {
  const booksPerPage = 20;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [ratingFilter, setRatingFilter] = useState();

  const { displayedBooks, isLoading, error, totalBooks, isFetching } =
    useBooksByCategory(booksPerPage, 'all', filters, page, searchQuery);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const { openFullScreenModal } = useFullScreenModal();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearAllFilters = () => {
    setFilters({});
    setPriceRange([0, 100]);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    if (!activeFilters.includes(filterName)) {
      setActiveFilters((prev) => [...prev, filterName]);
    }
  };

  const handlePriceFilterGo = () => {
    setFilters((prev) => ({
      ...prev,
      price: { min: priceRange[0], max: priceRange[1] },
    }));
  };

  const handleBookClick = (book: IBookInventory) => {
    openFullScreenModal(<BookDetails bookId={book.id} />, `${book.title}`);
  };

  const handleAddToCart = (book: IBookInventory) => {
    addCartItem(book);
  };

  const loadMoreBooks = () => {
    setPage((prev) => prev + 1);
  };

  const removeFilter = (filterName: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterName as keyof SearchFilterOptions];
      return newFilters;
    });
    setActiveFilters((prev) => prev.filter((f) => f !== filterName));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilter = (filterName: keyof SearchFilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  if (isLoading) return <CategoryLoadingSkeleton />;
  if (error) return <div>Error loading books: {error.message}</div>;
  if (!displayedBooks || displayedBooks.length === 0) {
    return (
      <EmptyBookshelf
        message={`We are working on adding books to our collection. Please check back later.`}
        subtitle="Our shelves are still being stocked"
        title={`No Books Available`}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Filters */}
      <div className="w-full md:w-[200px] p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <Button
          size="sm"
          color="primary"
          onClick={clearAllFilters}
          className="mb-4"
        >
          Clear All Filters
        </Button>

        <div className="space-y-4">
          <div className='flex flex-col items-start'>
            <h3 className="font-semibold">Price</h3>
            <Slider
              size="sm"
              step={1}
              minValue={0}
              maxValue={100}
              value={priceRange}
              onChange={(value) => setPriceRange(value as [number, number])}
              className="max-w-md"
            />
            <div className="flex items-center mt-2">
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
            {Object.entries(filters).map(
              ([key, value]) =>
                key !== 'price' && (
                  <Button
                    key={key}
                    size="sm"
                    color={value ? 'success' : 'default'}
                    onClick={() =>
                      toggleFilter(key as keyof SearchFilterOptions)
                    }
                    endContent={value && <FaTimes />}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Button>
                ),
            )}
          </div>
          <div>
            <h3 className="font-semibold">Rating</h3>
            <Checkbox
              checked={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.checked)}
              size='sm'
              value={ratingFilter}
            >
              4 Stars & Up
            </Checkbox>
          </div>
          <div>
            <h3 className="font-semibold">Availability</h3>
            <Checkbox
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            >
              In Stock
            </Checkbox>
          </div>
          <div>
            <h3 className="font-semibold">Discounts</h3>
            <Checkbox
              checked={filters.discounted}
              onChange={(e) =>
                handleFilterChange('discounted', e.target.checked)
              }
            >
              On Sale
            </Checkbox>
          </div>
        </div>
      </div>

      {/* Book List */}
      <div className="w-full md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Featured Books</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {displayedBooks.map((book, index) => (
              <div
                key={book.id}
                className="flex flex-col h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out group opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div
                  className="relative aspect-[2/3] cursor-pointer p-2"
                  onClick={() => handleBookClick(book)}
                >
                  {book.thumbnail_image_link && (
                    <div className="relative w-full h-full flex items-start justify-center">
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "150%" }}
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
                        <StarRating  rating={book.average_rating} />
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

        {displayedBooks.length < totalBooks && (
          <div className="flex justify-center my-8">
            <Button onClick={loadMoreBooks} className="mx-2 flex items-center">
              <span>More </span> <BiCaretDown className="ml-2" />
            </Button>
          </div>
        )}
        {displayedBooks.length === totalBooks && totalBooks > 0 && (
          <div className="flex justify-center my-8">
            <Button onClick={scrollToTop} className="px-2 flex items-center">
              <span>Back to top </span> <BiArrowToTop className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 rounded-full"
        >
          <BiArrowToTop />
        </Button>
      )}

      {isFetching && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
      )}
    </div>
  );
}
