// app/signin/page.tsx

import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/server";
import SignInForm from "@/app/signin/SignInForm";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  // if user is already signed in, redirect to home page
  if (data.user) {
    redirect("/");
  }

  return (
    <>
      <AuthNavbar initialUser={data.user} />
      <div className="flex flex-col flex-grow items-center justify-center">
        <div className="signin-form-wrapper w-full max-w-md px-8 mt-[-6rem]">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
          <SignInForm />
        </div>
      </div>
    </>
  );
}
