// components/BookSkeleton.tsx

import React from "react";
import { Skeleton } from "@nextui-org/react";

interface BookSkeletonProps {
  width?: string;
  height?: string;
}

const BookSkeleton: React.FC<BookSkeletonProps> = ({
  width = "w-32",
  height = "h-48",
}) => {
  return (
    <div className="w-full h-full">
      <Skeleton className="w-full h-full rounded-md">
        <div className="w-[90%] h-full flex flex-col justify-between p-2">
          {/* Book cover image placeholder */}
          <Skeleton className="w-full h-3/4 rounded-sm" />

          {/* Book title placeholder */}
          <Skeleton className="w-5/6 h-[8%] mt-2 rounded-sm" />

          {/* Author name placeholder */}
          <Skeleton className="w-3/4 h-[6%] mt-1 rounded-sm" />

          {/* Small decorative elements */}
          <div className="flex justify-between mt-1">
            <Skeleton className="w-1/4 h-[4%] rounded-sm" />
            <Skeleton className="w-1/4 h-[4%] rounded-sm" />
          </div>
        </div>
      </Skeleton>
    </div>
  );
};

export default BookSkeleton;
