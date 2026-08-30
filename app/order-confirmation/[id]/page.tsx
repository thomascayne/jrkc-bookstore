// app/order-confirmation/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { IOrder } from "@/interfaces/IOrder";
import { apiRequest } from "@/utils/apiClient";

interface OrderDetails {
  items: Array<{
    book_id: string | null;
    id: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  order: IOrder;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [details, setDetails] = useState<OrderDetails>();

  useEffect(() => {
    const fetchOrder = async (orderId: string) => {
      setDetails(
        await apiRequest<OrderDetails>(
          `/api/orders?id=${encodeURIComponent(orderId)}`,
        ),
      );
    };

    if (id) fetchOrder(id);
  }, [id]);

  if (!details) return <div>Loading...</div>;

  const { items, order } = details;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      <p>Order #{order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total_amount}</p>

      <h2 className="text-xl font-bold mt-4 mb-2">Items:</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.book_id} - Quantity: {item.quantity} - Price: ${item.subtotal}
          </li>
        ))}
      </ul>
    </div>
  );
}
