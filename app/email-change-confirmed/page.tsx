// app/email-change-confirmed/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/auth/types";
import { apiRequest } from "@/utils/apiClient";
import { waitSomeTime } from "@/utils/wait-some-time";

export default function EmailChangeConfirmed() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    const checkEmailChange = async () => {
      const { user } = await apiRequest<{ user: AppUser | null }>(
        "/api/auth/session",
      );

      if (user) {
        setMessage("Your email has been successfully updated. Redirecting...");
        setRedirectPath("/profile");
      } else {
        setMessage(
          "Failed to update your email. Please try again. Redirecting..."
        );
        setRedirectPath("/signin");
      }

      // wait for a short time to ensure the message is displayed
      await waitSomeTime(100);

      // set shouldRedirect to true, which will trigger the redirect
      setShouldRedirect(true);
    };

    void checkEmailChange();
  }, []);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      const redirect = async () => {
        await waitSomeTime(2000);
        router.push(redirectPath);
      };

      router.push("/");
    }
  }, [shouldRedirect, redirectPath, router]);

  return (
    <section className="container h-full flex flex-col flex-grow items-center justify-center gap-8 m-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Email Change Confirmation
      </h1>
      <h2 className="font-bold text-lg">{message}</h2>
    </section>
  );
}
