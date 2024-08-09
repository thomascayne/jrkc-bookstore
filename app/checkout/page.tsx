// app/checkout/page.tsx

"use client";

import CheckoutAccordion from "@/components/checkout/CheckoutAccordion";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";

export default function CheckoutCheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

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
