// app/update-password/page.tsx

import UpdatePasswordForm from "@/app/update-password/UpdatePasswordForm";
import AuthNavbar from "@/components/AuthNavbar";
import { createClient } from "@/utils/supabase/server";

export default async function UpdatePasswordPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <>
      <AuthNavbar initialUser={data.user} />

      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="update-password-form-wrapper w-full max-w-md px-8 mt-[-6rem]">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Update Your Password
          </h1>
          <UpdatePasswordForm />
        </div>
      </div>
    </>
  );
}
