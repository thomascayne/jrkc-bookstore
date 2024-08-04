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
import { addItem } from "@/stores/cartStore";
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
  const { openModal } = useFullScreenModal();

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
    openModal(
      <BookDetails bookId={book.id} />,
      `${data?.category} - ${book.title}`
    );
  };

  const handleAddToCart = (book: IBook) => {
    addItem(book);
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

        <div className="masonry-grid container mx-auto columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-3 w-full">
          {displayedBooks.map((book, index) => (
            <div
              key={book.id}
              className="relative group overflow-hidden shadow-sm mb-4 flex transition-all ease-in-out duration-400 flex-col items-center justify-center border p-4 rounded hover:border-blue-500 break-inside-avoid"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="w-full flex flex-col items-center cursor-pointer pt-1 hover:bg-gray-100"
                onClick={() => handleBookClick(book)}
              >
                {book.is_promotion && book.discount_percentage && (
                  <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                    {`${book.discount_percentage}% OFF`}
                  </div>
                )}

                <div className="relative w-32 h-48 mb-2">
                  {book.thumbnail_image_link && (
                    <Image
                      alt={book.title}
                      className="mb-2"
                      fill
                      src={book.thumbnail_image_link}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <h2 className="font-bold book-name whitespace-normal">
                  {book.title}
                </h2>
              </div>
              <p className="book-authors">{book.authors.substring(0, 20)}</p>
              {book.average_rating && (
                <div className="flex mt-2">
                  <StarRating rating={book.average_rating} />
                  <span className="mt-[-3px] ml-2 text-lg">
                    {book.average_rating}
                  </span>
                </div>
              )}
              {book.list_price && (
                <div className="flex mt-2 book-price">
                  <span className="mt-[-2px] ml-2 text-lg">
                    $ {book.list_price}
                  </span>
                </div>
              )}
              <div
                className="absolute cursor-pointer bottom-0 left-0 right-0 bg-blue-500 text-white text-center py-2 transform translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0"
                onClick={() => handleAddToCart(book)}
              >
                QUICK ADD
              </div>
            </div>
          ))}
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
