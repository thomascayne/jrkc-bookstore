// app/category/[key]/CategoryContent.tsx

"use client";

import React, { useEffect, useState } from "react";
import { SearchFilterOptions, useBooksByCategory } from "@/hooks/useBooksByCategory";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import { BiArrowToTop, BiCaretDown } from "react-icons/bi";
import { Button, Checkbox, Slider } from "@nextui-org/react";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import EmptyBookshelf from "@/components/EmptyBookshelf";
import { addCartItem } from "@/stores/cartStore";
import BookDetails from "@/components/BookDetails";
import CategoryLoadingSkeleton from "@/components/CategoryLoadingSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { IBookInventory } from "@/interfaces/IBookInventory";

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const booksPerPage = 20;

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilterOptions>({});
  const [page, setPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { openFullScreenModal: openFullScreenModal } = useFullScreenModal();
  const searchQuery = (searchParams && searchParams.get('q') || '');

  const booksPerLoad = 10;
  const { category, displayedBooks, isFetching, isLoading, error, totalBooks } = useBooksByCategory(
    booksPerPage,
    params.key,
    filters,
    page,
    searchQuery,
  );

  useEffect(() => {
    // Reset page when search query or filters change
    setPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (book: IBookInventory) => {
    addCartItem(book);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    if (!activeFilters.includes(filterName)) {
      setActiveFilters(prev => [...prev, filterName]);
    }
  };

  
  const handleBookClick = (book: IBookInventory) => {
    openFullScreenModal(
      <BookDetails bookId={book.id} />,
      `${category} - ${book.title}`
    );
  };

  const loadMoreBooks = () => {
    setPage(prev => prev + 1);
  };


  const removeFilter = (filterName: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterName as keyof SearchFilterOptions];
      return newFilters;
    });
    setActiveFilters(prev => prev.filter(f => f !== filterName));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <CategoryLoadingSkeleton />;
  if (error) return <div>Error loading books</div>;
  if (!displayedBooks || displayedBooks.length === 0) {
    return (
      <EmptyBookshelf
        message={`We are working on adding books to this category. In the meantime, why not explore our other categories?`}
        subtitle="We are still stocking this shelf"
        title={`No Books in ${category  || "this category"}`}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Filters */}
      <div className="w-full md:w-1/4 p-4">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Price</h3>
            <Slider
              label="Price Range"
              step={1}
              minValue={0}
              maxValue={100}
              defaultValue={[0, 100]}
              onChange={(value) => handleFilterChange('price', { min: (value as number[])[0], max: (value as number[])[1] })}
              />
          </div>
          <div>
            <h3 className="font-semibold">Rating</h3>
            <Checkbox 
              checked={filters.rating} 
              onChange={(e) => handleFilterChange('rating', e.target.checked)}
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
              onChange={(e) => handleFilterChange('discounted', e.target.checked)}
            >
              On Sale
            </Checkbox>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Active Filters</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {activeFilters.map(filter => (
              <Button
                key={filter}
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => removeFilter(filter)}
              >
                {filter} X
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Book List */}
      <div className="w-full md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">{category}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                        className="transition-transform duration-300 ease-in-out group-hover:scale-105"
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

              <div className="flex-grow p-4 flex flex-col justify-between">
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

        {displayedBooks.length < totalBooks && (
          <div className="flex justify-center my-8">
            <Button onClick={loadMoreBooks} className="mx-2 flex items-center">
              <span>More </span> <BiCaretDown className="ml-2" />
            </Button>
          </div>
        )}
        {displayedBooks.length === totalBooks && totalBooks > 0 && (
          <div className="flex justify-center my-8">
            <Button
              onClick={scrollToTop}
              className="px-2 flex items-center"
            >
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

      {isFetching && <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>}
    </div>
  );
}

