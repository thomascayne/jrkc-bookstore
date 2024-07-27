// app/signup/SignUpForm.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const signUp = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must be at least 8 characters. Please try again."
      );
      return;
    }

    if (password.search(/[a-z]/) < 0) {
      setErrorMessage(
        "Password must contain at least one lowercase letter. Please try again."
      );
      return;
    }

    if (password.search(/[A-Z]/) < 0) {
      setErrorMessage(
        "Password must contain at least one uppercase letter. Please try again."
      );
      return;
    }

    if (password.search(/[0-9]/) < 0) {
      setErrorMessage(
        "Password must contain at least one number. Please try again."
      );
      return;
    }

    if (password.search(/[^a-zA-Z0-9]/) < 0) {
      setErrorMessage(
        "Password must contain at least one special character. Please try again."
      );
      return;
    }

    if (password.search(/\s/) >= 0) {
      setErrorMessage(
        "Password must not contain any spaces. Please try again."
      );
      return;
    }

    if (email === "") {
      setErrorMessage("Email is required. Please try again.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email address. Please try again.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage("Unable to create account. Please try again.");
      return;
    }

    setSuccessMessage(
      "Account created. Please check your email to verify your account."
    );

    router.push("/confirm");
  };

  return (
    <form className="signup-form flex flex-col w-full justify-center gap-4 text-foreground">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          id="password"
          name="password"
          placeholder="••••••••"
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-blue-500 underline mr-2 absolute right-0 top-2/4"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <div className="relative">
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="password_confirm"
        >
          Confirm Password
        </label>
        <input
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          id="password_confirm"
          name="password_confirm"
          placeholder="••••••••"
          required
          type={showConfirmPassword ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setConfirmShowPassword(!showConfirmPassword)}
          className="text-blue-500 underline mr-2 absolute right-0 top-2/4"
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <SubmitButton
        formAction={signUp}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        pendingText="Creating Account..."
      >
        Create Account
      </SubmitButton>
      <div className="text-sm text-center mt-4">
        <Link href="/signin" className="text-blue-600 hover:text-blue-800">
          Already have an account? Sign in
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
