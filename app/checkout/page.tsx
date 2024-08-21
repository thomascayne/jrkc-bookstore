// app/checkout/page.tsx

"use client";

import CheckoutAccordion from "@/components/checkout/CheckoutAccordion";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function CheckoutCheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
    };

    checkAuthStatus();
  }, [router, supabase.auth]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);
    };
    getUser();
  }, [supabase.auth]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <CheckoutAccordion user={user} />
    </div>
  );
}
