// app/signup/page.tsx

import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/server";
import SignUpForm from "@/app/signup/SignUpForm";

export default async function SignUpPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={data.user} />
      <section className="flex min-h-screen flex-col items-center justify-center">
        <div className="sign-up-form-wrapper w-full max-w-md px-8 pt-8 pb-12 mt-[-6rem] border border-gray-400 rounded-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Create an Account
          </h1>
          <SignUpForm />
        </div>
      </section>
    </>
  );
}
