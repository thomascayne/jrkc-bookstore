// components/BookCoverPlaceholder.tsx

import React from "react";

interface BookCoverPlaceholderProps {
  title: string;
  author: string;
  size?: string;
}

const BookCoverPlaceholder: React.FC<BookCoverPlaceholderProps> = ({
  title,
  author,
  size = "w-32 h-48",
}) => {
  return (
    <div
      className={`${size} relative bg-gradient-to-r from-blue-200 to-blue-100 rounded-md shadow-md flex flex-col justify-between p-4 overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
      <div className="text-center">
        <h3 className="font-bold text-sm mb-1 line-clamp-2">
          {title || "No Title Available"}
        </h3>
        <p className="text-xs italic line-clamp-1">
          {author || "Unknown Author"}
        </p>
      </div>
      <div className="text-center text-xs mt-2">No Cover Available</div>
    </div>
  );
};

export default BookCoverPlaceholder;
