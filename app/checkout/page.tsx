// app/checkout/page.tsx

"use client";

import CheckoutAccordion from "@/components/checkout/CheckoutAccordion";
import type { AppUser as User } from "@/auth/types";
import { apiRequest } from "@/utils/apiClient";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function CheckoutCheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { user } = await apiRequest<{ user: User | null }>(
        "/api/auth/session",
      );

      if (!user) {
        router.push('/signin');
        return;
      }

      const roles = user.app_metadata?.roles || [];
      if (!(roles.length === 1 && roles[0] === 'USER')) {
        // If the user is not a USER, redirect them to the home page or an access denied page
        router.push('/');
        return;
      }
      setUser(user);
    };

    void checkAuthStatus();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <CheckoutAccordion user={user} />
    </div>
  );
}
