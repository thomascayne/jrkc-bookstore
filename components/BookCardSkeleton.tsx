// components\BookCardSkeleton.tsx

import { Card, Skeleton } from '@nextui-org/react';

export const BookCardSkeleton = () => (
  <Card className="relative p-2 w-[150px] h-[220px] flex flex-col">
    <Skeleton className="rounded-lg">
      <div className="h-24 rounded-lg bg-default-300"></div>
    </Skeleton>
    <div className="flex w-full justify-end ml-auto mt-auto mb-1">
      <Skeleton className="w-2/5 rounded-lg ">
        <div className="h-3 w-2/5 rounded-lg bg-default-200"></div>
      </Skeleton>
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="w-2/5 rounded-lg">
        <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
      </Skeleton>
      <Skeleton className="w-2/5 rounded-lg">
        <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
      </Skeleton>
    </div>
  </Card>
);
