// components\CategoryLoadingSkeleton.tsx

import React from "react";
import { Skeleton } from "@nextui-org/react";

export default function CategoryLoadingSkeleton() {
  return (
    <div className="flex flex-col mt-14">
      <div className="max-w-96  mb-10 rounded flex justify-center mx-auto">
        <Skeleton className="h-6 w-6 mr-2"></Skeleton>
        <Skeleton className="h-6 w-10 mr-2"></Skeleton>
        <Skeleton className="h-6 w-16 mr-2"></Skeleton>
        <Skeleton className="h-6 w-[18rem] mr-2"></Skeleton>
        <Skeleton className="h-6 w-12 mr-2"></Skeleton>
      </div>
      <div className="masonry-grid container mx-auto columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-3 w-full">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="mask-placeholder shadow-sm mb-4 flex transition-all ease-in-out duration-150 flex-col items-center justify-center border p-4 rounded cursor-pointer hover:border-blue-500 break-inside-avoid bg-gray-200 animate-pulse w-full min-w-[120px]"
          >
            <div
              className="w-full bg-gray-300 mb-2 min-h-[160px]"
              style={{ aspectRatio: "3/4" }}
            ></div>
            <div
              className="w-full bg-gray-300 mb-2 min-w-[100px]"
              style={{ height: "20px" }}
            ></div>
            <div
              className="w-2/3 bg-gray-300 min-w-[80px]"
              style={{ height: "16px" }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
