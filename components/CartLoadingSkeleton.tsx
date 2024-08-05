"use client";

import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { cartStore } from "@/stores/cartStore";
import { Skeleton } from "@nextui-org/react";

export default function CartLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-56 mb-8" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center border-b py-4">
              <Skeleton className="w-16 h-24 mr-4" />
              <div className="flex-grow">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex items-center">
                <Skeleton className="w-24 h-8 mr-4" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:w-1/3">
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
