// app/signin/page.tsx

import SignInForm from '@/app/signin/SignInForm';

export default function SignInPage() {
  return (
    <section className="signin-page-wrapper flex min-h-full w-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="signin-form-wrapper w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
        <SignInForm />
      </div>
    </section>
  );
}
