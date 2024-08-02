// components/CartSidePanel.tsx

import React from "react";
import { useStore } from "@tanstack/react-store";
import {
  cartStore,
  removeItem,
  updateQuantity,
  getTotal,
} from "@/stores/cartStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidePanel } from "@/contexts/SidePanelContext";

interface CartSidePanelProps {
  currentPath: string;
}

const CartSidePanel: React.FC<CartSidePanelProps> = ({ currentPath }) => {
  const { closeRightPanel } = useSidePanel();
  const cartItems = useStore(cartStore, (state) => state.items);
  const router = useRouter();
  const totalPrice = getTotal();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    } else {
      removeItem(id);
    }
  };

  const handleCheckout = () => {
    closeRightPanel();
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    closeRightPanel();
    if (currentPath !== "/cart") {
      router.push(currentPath);
    }
  };

  return (
    <div className="cart-side-panel p-4">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center mb-4">
              <Image
                src={item.small_thumbnail_image_link || "/placeholder.png"}
                alt={item.title}
                width={50}
                height={75}
                className="object-cover mr-4"
              />
              <div className="flex-grow">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  ${item.list_price?.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() =>
                    handleQuantityChange(item.id, (item.quantity || 1) - 1)
                  }
                >
                  -
                </button>
                <span className="mx-2">{item.quantity || 1}</span>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() =>
                    handleQuantityChange(item.id, (item.quantity || 1) + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded"
            onClick={() => handleCheckout()}
          >
            Checkout
          </button>
          <button
            className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
};

export default CartSidePanel;
