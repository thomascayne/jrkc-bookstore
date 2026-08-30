import React, { useEffect, useState } from "react";
import { ICartOrder } from "@/interfaces/ICustomerCartOrder";
import { apiRequest } from "@/utils/apiClient";

export default function CheckoutOrderHistory() {
  const [orders, setOrders] = useState<ICartOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { orders } = await apiRequest<{ orders: ICartOrder[] }>(
        "/api/orders",
      );
      setOrders(orders);
    };

    void fetchOrders();
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
