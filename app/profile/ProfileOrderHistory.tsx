// app/profile/ProfileOrderHistory.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, Button, Modal, Table, ModalHeader, ModalBody, TableHeader, TableColumn, TableRow, TableBody, TableCell } from "@nextui-org/react";
import { IOrder } from "@/interfaces/IOrder";

interface OrderHistoryProps {
  user: User | null;
}

interface OrderItem {
  id: string;
  book_id: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function ProfileOrderHistory({ user }: OrderHistoryProps) {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchTotalOrders();
  }, [user, currentPage]);

  async function fetchOrders() {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_user_orders', {
      p_user_id: user.id
    });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
  }

  async function fetchTotalOrders() {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_user_orders_count', {
      p_user_id: user.id
    });

    if (error) {
      console.error("Error fetching total orders:", error);
    } else {
      setTotalOrders(data || 0);
    }
  }

  async function fetchOrderDetails(orderId: string) {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_order_details', {
      p_order_id: orderId,
      p_user_id: user.id
    });

    if (error) {
      console.error("Error fetching order details:", error);
    } else {
      setSelectedOrder(data[0]);
      setOrderItems(data);
      setIsModalOpen(true);
    }
  }

  return (
    <section className="flex flex-col px-4">
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          {orders.map((order) => (
            <Card key={order.id} className="mb-4 p-4">
              <p>Order ID: {order.id}</p>
              <p>Date: {new Date(order.order_date as string).toLocaleDateString()}</p>
              <p>Total: ${order.total_amount.toFixed(2)}</p>
              <p>Status: {order.status}</p>
              <Button onClick={() => fetchOrderDetails(order.id as string)}>View Details</Button>
            </Card>
          ))}
          <div className="flex justify-between mt-4">
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * ordersPerPage >= totalOrders}
            >
              Next
            </Button>
          </div>
        </>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader>
          <h3>Order Details</h3>
        </ModalHeader>
        <ModalBody>
          {selectedOrder && (
            <>
              <p>Order ID: {selectedOrder.id}</p>
              <p>Date: {new Date(selectedOrder.order_date as string).toLocaleDateString()}</p>
              <p>Total: ${selectedOrder.total_amount.toFixed(2)}</p>
              <p>Status: {selectedOrder.status}</p>
              <Table>
                <TableHeader>
                  <TableColumn>Book ID</TableColumn>
                  <TableColumn>Quantity</TableColumn>
                  <TableColumn>Price</TableColumn>
                  <TableColumn>Subtotal</TableColumn>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.book_id}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </ModalBody>
      </Modal>
    </section>
  );
}