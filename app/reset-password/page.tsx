// app/reset-password/page.tsx

import ResetPasswordForm from "@/app/reset-password/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="reset-password-form-page-wrapper flex min-h-full w-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="reset-password-form-wrapper w-full max-w-md px-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Reset Your Password
        </h1>
        <ResetPasswordForm />
      </div>
    </section>
  );
}
