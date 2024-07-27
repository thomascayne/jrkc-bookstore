import AuthNavbar from "@/components/AuthNavbar";
import Loading from "@/components/Loading";
// app/category/[key]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

import CategoryContent from "./CategoryContent";

export default async function CategoryPage({
  params,
}: {
  params: { key: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={user} />

      <div className="CategoryPage flex-1 w-full flex flex-col items-center min-h-[100%]">
        <Suspense fallback={<Loading />}>
          <CategoryContent params={params} />
        </Suspense>
      </div>
    </>
  );
}
