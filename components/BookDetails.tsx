// components/BookDetails.tsx

import React from "react";
import { IBook } from "@/interfaces/IBook";
import BookImage from "@/components/BookImage";
import SafeHTML from "@/components/SafeHTML";
import StarRating from "@/components/StarRating";
import { GoogleBook } from "@/interfaces/GoogleBook";

interface BookDetailsProps {
  bookDetails: GoogleBook;
  selectedBook: IBook;
  imageLink: string;
}

const BookDetails: React.FC<BookDetailsProps> = ({
  bookDetails,
  selectedBook,
  imageLink,
}) => {
  return (
    <div className="book-details-modal container space-y-4 w-full px-4 sm:px-0 sm:w-[480px] lg:w-[640px]">
      <div>
        {bookDetails?.volumeInfo.title && (
          <h1 className="text-2xl md:text-3xl block md:hidden font-bold mb-2 text-center w-full">
            {bookDetails?.volumeInfo.title}
          </h1>
        )}
        {bookDetails?.volumeInfo.subtitle && (
          <h3 className="text-xl mb-2 text-center">
            {bookDetails?.volumeInfo.subtitle}
          </h3>
        )}
        {imageLink && (
          <div className="relative shadow-large border bg-transparent pt-4 rounded-sm border-gray-300 dark:border-gray-600">
            {selectedBook?.is_promotion && selectedBook.discount_percentage && (
              <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
                {`${selectedBook.discount_percentage}% OFF`}
              </div>
            )}
            <BookImage
              imageUrl={imageLink}
              title={bookDetails!.volumeInfo.title}
            />
          </div>
        )}
        <p className="mb-2 mt-6">
          <strong>Author(s):</strong>{" "}
          {bookDetails?.volumeInfo.authors?.join(", ")}
        </p>
        <p className="mb-2">
          <strong>Published:</strong> {bookDetails?.volumeInfo.publishedDate} by{" "}
          {bookDetails?.volumeInfo.publisher}
        </p>
        <p className="mb-2">
          <strong>Pages:</strong> {bookDetails?.volumeInfo.pageCount}
        </p>
        <div className="mb-4 flex flex-col gap-2">
          <strong>Description:</strong>
          <SafeHTML html={bookDetails?.volumeInfo.description || ""} />
        </div>
        {bookDetails?.volumeInfo.categories && (
          <p className="mb-2">
            <strong>Categories:</strong>{" "}
            {bookDetails?.volumeInfo.categories.join(", ")}
          </p>
        )}
        {bookDetails?.volumeInfo.averageRating && (
          <div className="flex gap-2 items-center">
            <strong>Rating:</strong>
            <StarRating rating={bookDetails.volumeInfo.averageRating} />
            <span>({bookDetails.volumeInfo.ratingsCount} ratings)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
