// app/signin/page.tsx

import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/client";
import SignInForm from "@/app/signin/SignInForm";

export default async function SignInPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={data.user} />
      <div className="signin-page-wrapper flex flex-col flex-grow items-center justify-center">
        <div className="signin-form-wrapper w-full max-w-md px-8 mt-[-6rem]">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
          <SignInForm />
        </div>
      </div>
    </>
  );
}
