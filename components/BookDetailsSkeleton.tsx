// components/BookDetailsSkeleton.tsx

import React from "react";

const BookDetailsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="book-cover-container relative w-full aspect-[3/4] mb-4 bg-gray-300"></div>
    </div>
  );
};

export default BookDetailsSkeleton;
