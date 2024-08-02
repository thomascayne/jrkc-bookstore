// app/signin/SignInForm.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@nextui-org/react";

export default function SignInForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const signIn = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Incorrect email or password. Please try again.");
    } else {
      setSuccessMessage("Signed in successfully. Redirecting...");
      const params = new URLSearchParams(window.location.search);
      /**
       * Redirect to the page specified in the query string or to the home page
       */
      const redirectUrl = params.get("redirect") || "/";
      router.push(redirectUrl);
    }
  };

  return (
    <form className="signin-form flex flex-col w-full justify-center gap-4 text-foreground">
      <div>
        <Input
          aria-label="Email"
          className="mb-2"
          id="email"
          label="Email"
          radius="none"
          type="email"
          variant="bordered"
          required
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <Input
          aria-label="Password"
          className="mb-2"
          id="password"
          label="Password"
          name="password"
          required
          type={showPassword ? "text" : "password"}
          variant="bordered"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-blue-500 underline mr-2 absolute right-0 top-[20px]"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <SubmitButton
        formAction={signIn}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        pendingText="Signing In..."
      >
        Sign In
      </SubmitButton>
      <div className="text-sm text-center mt-4">
        <Link
          href="/reset-password"
          className="text-blue-600 hover:text-blue-800"
        >
          Forgot your password?
        </Link>
      </div>
      <div className="text-sm text-center">
        <Link href="/signup" className="text-blue-600 hover:text-blue-800">
          Do not have an account? Sign up
        </Link>
      </div>
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
    </form>
  );
}
