// app/components/RightSideContent.tsx
"use client";

import React from "react";
import { Button } from "@nextui-org/button";

export default function RightSideContent() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Bag</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Items (5)</h3>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex justify-between items-center mb-2">
            <span>Book {item}</span>
            <span>$19.99</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>$99.95</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Estimated Shipping & Handling</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Estimated Tax</span>
          <span>$8.00</span>
        </div>
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>$107.95</span>
        </div>
      </div>
      <Button color="primary" className="w-full mt-4">
        Checkout
      </Button>
    </div>
  );
}
