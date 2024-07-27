// app/page.tsx

import { createClient } from "@/utils/supabase/server";
import LeftSideContent from "@/components/examples/LeftSideContent";
import RightSideContent from "@/components/examples/RightSideContent";
import PanelButtons from "@/components/examples/PanelButtons";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <div className="page-wrapper flex flex-col flex-grow items-center h-full">
      <main className="main-page-container flex flex-col flex-grow h-full items-center py-10">
        {/* example of how to use the side panels - book example - show open book on left side  and cart on the right side*/}

        <h1 className="text-4xl font-bold mb-8">Welcome to Our Bookstore</h1>
        <PanelButtons
          LeftContent={<LeftSideContent />}
          RightContent={<RightSideContent />}
        />
      </main>
    </div>
  );
}
