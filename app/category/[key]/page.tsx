// app/category/[key]/page.tsx

import { Suspense } from "react";

import CategoryContent from "./CategoryContent";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="CategoryPage flex min-h-full w-full flex-1 flex-col items-center">
      <Suspense>
        <CategoryContent params={resolvedParams} />
      </Suspense>
    </div>
  );
}
