// app/reset-password/page.tsx

import ResetPasswordForm from "@/app/reset-password/ResetPasswordForm";
import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={data.user} />

      <div className="reset-password-form-page-wrapper flex flex-col flex-grow items-center justify-center">
        <div className="reset-password-form-wrapper w-full max-w-md px-8 mt-[-6rem]">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Reset Your Password
          </h1>
          <ResetPasswordForm />
        </div>
      </div>
    </>
  );
}
