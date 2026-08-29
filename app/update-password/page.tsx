// app/update-password/page.tsx

import UpdatePasswordForm from "@/app/update-password/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <section className="update-password-page-wrapper flex min-h-full w-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="update-password-form-wrapper w-full max-w-md px-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Update Your Password
        </h1>
        <UpdatePasswordForm />
      </div>
    </section>
  );
}
