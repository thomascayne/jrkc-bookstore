// app/category/[key]/page.tsx

import AuthNavbar from "@/components/navbars/AuthNavbar";
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
        <Suspense>
          <CategoryContent params={params} />
        </Suspense>
      </div>
    </>
  );
}
