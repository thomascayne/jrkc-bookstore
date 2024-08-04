// components/BookDetailsSkeleton.tsx

import React from "react";
import { Skeleton } from "@nextui-org/react";

const BookDetailsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className=" flex flex-col w-[80%] h-full rounded">
        <Skeleton className="w-3/4 rounded mx-auto">
          <div className="h-8 w-full"></div>
        </Skeleton>
        <Skeleton className="mt-4 mb-1 rounded w-1/2 mx-auto">
          <div className="h-64 w-full"></div>
        </Skeleton>
        <Skeleton className="mt-2 mb-1 rounded">
          <div className="h-4 w-full"></div>
        </Skeleton>
        <Skeleton className="mt-2 mb-1 rounded">
          <div className="h-4 w-full"></div>
        </Skeleton>
        <Skeleton className="mb-4 flex mt-auto rounded">
          <div className="h-6"></div>
        </Skeleton>
        <Skeleton className="rounded">
          <div className="h-20"></div>
        </Skeleton>
      </div>
    </div>
  );
};

export default BookDetailsSkeleton;
