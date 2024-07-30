// app/email-change-confirmed/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { waitSomeTime } from "@/utils/wait-some-time";

export default function EmailChangeConfirmed() {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    const checkEmailChange = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

    checkEmailChange();
  }, [supabase]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      const redirect = async () => {
        await waitSomeTime(2000);
        router.push(redirectPath);
      };

      redirect();
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
