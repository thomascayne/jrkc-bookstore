// app/page.tsx

import { createClient } from "@/utils/supabase/server";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <section className="page-wrapper flex flex-col flex-grow items-center h-full">
      <div className="main-page-container flex flex-col flex-grow h-full items-center py-10">
        {/* example of how to use the side panels - book example - show open book on left side  and cart on the right side*/}
      </div>
    </section>
  );
}
