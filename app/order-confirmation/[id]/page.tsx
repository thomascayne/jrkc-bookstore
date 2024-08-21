// app/order-confirmation/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {useSearchParams } from "next/navigation";
import { ICartOrder } from "@/interfaces/ICustomerCartOrder";

const supabase = createClient();

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();

  const id = searchParams?.get("id") as string;

  const [order, setOrder] = useState<ICartOrder>();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, books(*))")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
      } else {
        setOrder(data);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      <p>Order #{order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total_amount}</p>

      <h2 className="text-xl font-bold mt-4 mb-2">Items:</h2>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.book.title} - Quantity: {item.quantity} - Price: $
            {item.book.retail_price * item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
