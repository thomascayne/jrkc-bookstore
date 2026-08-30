// app/confirm/page.tsx

import { getCurrentUser } from "@/auth/session";

export default async function Confirm() {
  const user = await getCurrentUser();

  if (user) return null;

  return (
    <div className="container h-full flex flex-col flex-grow items-center justify-center gap-8 m-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Yay! You signed up!
      </h1>
      <h2 className="font-bold">Thank you for signing up to JRKC Bookstore</h2>
      <div className="text-center">
        <p className="mb-4">Your account is ready.</p>
        <p className="font-semibold">You can now sign in.</p>
      </div>
    </div>
  );
}
