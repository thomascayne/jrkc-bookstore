import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { IOrder } from "@/interfaces/IOrder";

const supabase = createClient();

export default function CheckoutOrderHistory() {
  const [orders, setOrders] = useState<IOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data as IOrder[]);
        }
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      {orders.map((order) => (
        <div key={order.id} className="mb-4 p-4 border rounded">
          <p>Order #{order.id}</p>
          <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total_amount}</p>
        </div>
      ))}
    </div>
  );
}
