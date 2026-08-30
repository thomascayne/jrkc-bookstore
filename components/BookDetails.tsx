import BookImage from "@/components/BookImage";
import BookDetailsSkeleton from "@/components/BookDetailsSkeleton";
import SafeHTML from "@/components/SafeHTML";
import StarRating from "@/components/StarRating";
import { useInventoryBook } from "@/hooks/useInventoryBook";
// components/BookDetails.tsx

import React from "react";

interface BookDetailsProps {
  bookId: string;
}

const BookDetails: React.FC<BookDetailsProps> = ({ bookId }) => {
  const {
    data: inventoryBook,
    error,
    isPending,
  } = useInventoryBook(bookId);

  if (isPending) {
    return (
      <div className="h-[60vh] w-full sm:w-[480px] lg:w-[640px]">
        <BookDetailsSkeleton />
      </div>
    );
  }

  if (error || !inventoryBook) {
    return (
      <div className="flex min-h-64 w-full max-w-xl flex-col items-center justify-center gap-3 px-6 text-center text-foreground">
        <h2 className="text-xl font-semibold">Book details are unavailable</h2>
        <p className="text-default-600">
          We could not load this title right now. Please close this window and
          try again.
        </p>
      </div>
    );
  }

  return (
    <div className="book-details-modal container w-full space-y-4 px-4 text-foreground sm:w-[480px] sm:px-0 lg:w-[640px]">
      <h1 className="text-2xl md:text-3xl block md:hidden font-bold mb-2 text-center w-full">
        {inventoryBook.title}
      </h1>
      {inventoryBook.subtitle && (
        <h3 className="text-xl mb-2 text-center">
          {inventoryBook.subtitle}
        </h3>
      )}
      <div className="relative shadow-large border bg-transparent pt-4 rounded-sm border-gray-300 dark:border-gray-600">
        {inventoryBook?.is_promotion && inventoryBook.discount_percentage && (
          <div className="absolute top-0 left-[0] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br z-10">
            {`${inventoryBook.discount_percentage}% OFF`}
          </div>
        )}
        <div className="flex items-center px-2">
          <BookImage
            inventoryBook={inventoryBook}
            useLargeImage={true}
          />
        </div>
      </div>
      <p className="mb-2">
        <strong>Author(s):</strong> {inventoryBook.authors || "Unknown author"}
      </p>
      <p className="mb-2">
        <strong>Published:</strong>{" "}
        {inventoryBook.published_date || "Date unavailable"}
        {inventoryBook.publisher ? ` by ${inventoryBook.publisher}` : ""}
      </p>
      <p className="mb-2">
        <strong>Pages:</strong>{" "}
        {inventoryBook.page_count || "Page count unavailable"}
      </p>
      <div className="mb-4">
        <strong>Description:</strong>
        {inventoryBook.description ? (
          <SafeHTML html={inventoryBook.description} />
        ) : (
          <p className="text-default-600">No description is available.</p>
        )}
      </div>
      <p className="mb-2">
        <strong>ISBN:</strong> {inventoryBook.isbn13 || inventoryBook.isbn10 || "Unavailable"}
      </p>
      {inventoryBook.category && (
        <p className="mb-2">
          <strong>Category:</strong> {inventoryBook.category.label}
        </p>
      )}
      {inventoryBook.average_rating > 0 && (
        <div className="flex gap-2 items-center">
          <strong>Rating:</strong>
          <StarRating rating={inventoryBook.average_rating} />
          <span>({inventoryBook.ratings_count} ratings)</span>
        </div>
      )}
      {inventoryBook.list_price > 0 && (
        <p className="mb-2">
          <strong>
            {inventoryBook.catalog_source === "google" ? "Demo price:" : "Price:"}
          </strong>{" "}
          ${inventoryBook.list_price}
        </p>
      )}
      {inventoryBook.is_promotion && inventoryBook.discount_percentage > 0 && (
        <p className="mb-2 text-red-500">
          <strong>Discount:</strong> {inventoryBook.discount_percentage}% OFF
        </p>
      )}
    </div>
  );
};

export default BookDetails;
