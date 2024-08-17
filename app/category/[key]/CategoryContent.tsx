// app/category/[key]/CategoryContent.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useBooksByCategory } from "@/hooks/useBooksByCategory";
import { useFullScreenModal } from "@/contexts/FullScreenModalContext";
import { BiArrowToTop, BiCaretDown } from "react-icons/bi";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import EmptyBookshelf from "@/components/EmptyBookshelf";
import { addCartItem } from "@/stores/cartStore";
import BookDetails from "@/components/BookDetails";
import CategoryLoadingSkeleton from "@/components/CategoryLoadingSkeleton";
import { IBook } from "@/interfaces/IBook";

export default function CategoryContent({
  params,
}: {
  params: { key: string };
}) {
  const booksPerLoad = 10;
  const { data, isLoading, error } = useBooksByCategory(
    params.key,
    booksPerLoad
  );
  const [displayedBooks, setDisplayedBooks] = useState<IBook[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { openFullScreenModal: openFullScreenModal } = useFullScreenModal();

  useEffect(() => {
    if (data) {
      setDisplayedBooks(data.displayedBooks);
    }
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMoreBooks = () => {
    if (data) {
      const currentLength = displayedBooks.length;
      const newBooks = data.books.slice(
        currentLength,
        currentLength + booksPerLoad
      );
      setDisplayedBooks([...displayedBooks, ...newBooks]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookClick = (book: IBook) => {
    openFullScreenModal(
      <BookDetails bookId={book.id} />,
      `${data?.category} - ${book.title}`
    );
  };

  const handleAddToCart = (book: IBook) => {
    addCartItem(book);
  };

  if (isLoading) return <CategoryLoadingSkeleton />;
  if (error) return <div>Error loading books</div>;
  if (!data || data.books.length === 0) {
    return (
      <EmptyBookshelf
        message={`We are working on adding books to this category. In the meantime, why not explore our other categories?`}
        subtitle="We are still stocking this shelf"
        title={`No Books in ${data?.category || "this category"}`}
      />
    );
  }

  return (
    <section className="CategoryContent-container h-full flex flex-col flex-grow overflow-hidden">
      <div className="CategoryContent container mx-auto px-4 pb-4 my-8 relative flex-grow">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold mb-4 pt-4">{data.category}</h1>
        </div>

        <div className="container mx-auto px-4 pb-4 my-8">
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
        </div>

        {displayedBooks.length < data.books.length && (
          <div className="flex justify-center my-8">
            <Button onClick={loadMoreBooks} className="mx-2 flex items-center">
              <span>More </span> <BiCaretDown className="ml-2" />
            </Button>
          </div>
        )}
        {displayedBooks.length === data.books.length &&
          data.books.length > 0 && (
            <div className="flex justify-center my-8">
              <Button
                radius="none"
                onClick={scrollToTop}
                className="px-2 flex items-center"
              >
                <span>Back to top </span> <BiArrowToTop className="ml-2" />
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
