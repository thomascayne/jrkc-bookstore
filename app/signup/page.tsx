// app/signup/page.tsx

import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/server";
import SignUpForm from "@/app/signup/SignUpForm";
import Footer from "@/components/Footer";

export default async function SignUpPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={data.user} />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="signup-form-wrapper w-full max-w-md px-8 mt-[-6rem]">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Create an Account
          </h1>
          <SignUpForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
