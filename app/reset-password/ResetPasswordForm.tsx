// app/reset-password/ResetPasswordForm.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { SubmitButton } from "../../components/submit-button";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  const handleResetPassword = async (formData: FormData) => {
    const email = formData.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage(
        "If your email is in our system, you will receive an email. Check your inbox."
      );
    }
  };

  return (
    <form className="flex flex-col gap-4">
      {message && (
        <div
          className={`p-4 rounded ${
            message.startsWith("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md px-4 py-2 bg-inherit border"
          required
        />
      </div>
      <SubmitButton
        formAction={handleResetPassword}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        pendingText="Sending Reset Email..."
      >
        Send Reset Email
      </SubmitButton>
      <div className="text-sm text-center mt-4">
        <Link href="/signin" className="text-blue-600 hover:text-blue-800">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
