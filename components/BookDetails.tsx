import BookImage from "@/components/BookImage";
import SafeHTML from "@/components/SafeHTML";
import StarRating from "@/components/StarRating";
import { useBookFromSupabase } from "@/utils/useBookFromSupabase";
import { useGoogleBookDetails } from "@/utils/useGoogleBookDetails";
import Link from "next/link";
// components/BookDetails.tsx

import React from "react";

interface BookDetailsProps {
  bookId: string;
}

const BookDetails: React.FC<BookDetailsProps> = ({ bookId }) => {
  const { data: supabaseBook } = useBookFromSupabase(bookId);
  const { data: googleBook } = useGoogleBookDetails(bookId);

  return (
    <div className="book-details-modal container space-y-4 w-full px-4 sm:px-0 sm:w-[480px] lg:w-[640px]">
      <h1 className="text-2xl md:text-3xl block md:hidden font-bold mb-2 text-center w-full">
        {googleBook?.volumeInfo.title}
      </h1>
      {googleBook?.volumeInfo.subtitle && (
        <h3 className="text-xl mb-2 text-center">
          {googleBook.volumeInfo.subtitle}
        </h3>
      )}
      <div className="relative shadow-large border bg-transparent pt-4 rounded-sm border-gray-300 dark:border-gray-600">
        {supabaseBook?.is_promotion && supabaseBook.discount_percentage && (
          <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
            {`${supabaseBook.discount_percentage}% OFF`}
          </div>
        )}
        <div className="flex items-center px-2">
          <BookImage
            googleBook={googleBook || undefined}
            supabaseBook={supabaseBook || undefined}
            useLargeImage={true}
          />
        </div>
      </div>
      <p className="mb-2">
        <strong>Author(s):</strong> {googleBook?.volumeInfo.authors?.join(", ")}
      </p>
      <p className="mb-2">
        <strong>Published:</strong> {googleBook?.volumeInfo.publishedDate} by{" "}
        {supabaseBook?.publisher}
      </p>
      <p className="mb-2">
        <strong>Pages:</strong>
        {googleBook?.volumeInfo.pageCount}
      </p>
      <div className="mb-4">
        <strong>Description:</strong>
        <SafeHTML html={googleBook?.volumeInfo.description as string} />
      </div>
      <p className="mb-2">
        <strong>ISBN:</strong>{" "}
        {googleBook?.volumeInfo.industryIdentifiers?.[0]?.identifier}
      </p>
      {googleBook?.volumeInfo.categories && (
        <p className="mb-2">
          <strong>Categories:</strong>{" "}
          {googleBook.volumeInfo.categories.join(", ")}
        </p>
      )}
      {supabaseBook?.average_rating && (
        <div className="flex gap-2 items-center">
          <strong>Rating:</strong>
          <StarRating rating={supabaseBook!.average_rating} />
          <span>({supabaseBook?.ratings_count} ratings)</span>
        </div>
      )}
      {supabaseBook?.list_price && (
        <p className="mb-2">
          <strong>Price:</strong> ${supabaseBook.list_price}
        </p>
      )}
      {supabaseBook?.is_promotion && supabaseBook.discount_percentage && (
        <p className="mb-2 text-red-500">
          <strong>Discount:</strong> {supabaseBook.discount_percentage}% OFF
        </p>
      )}
    </div>
  );
};

export default BookDetails;
