// app/confirm/page.tsx

import { createClient } from "@/utils/supabase/server";

export default async function Confirm() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return null;

  return (
    <div className="container h-full flex flex-col flex-grow items-center justify-center gap-8 m-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Yay! You signed up!
      </h1>
      <h2 className="font-bold">Thank you for signing up to JRKC Bookstore</h2>
      <div className="text-center">
        <p className="mb-4">We sent you a confirmation email.</p>
        <p className="font-semibold text-red-500">
          Please click on the link in the email.
        </p>
        <p>If you have not received it, please check your spam folder.</p>
      </div>
    </div>
  );
}
