// app/signup/page.tsx

import SignUpForm from "@/app/signup/SignUpForm";

export default function SignUpPage() {
  return (
    <section className="signup-page-wrapper flex min-h-full w-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="sign-up-form-wrapper w-full max-w-md rounded-md border border-gray-400 px-8 pb-12 pt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create an Account
        </h1>
        <SignUpForm />
      </div>
    </section>
  );
}
