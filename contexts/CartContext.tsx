// contexts/CartContext.tsx

"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  addItem,
  calculateDiscountedPrice,
  cartStore,
  getTotal,
  removeItem,
  updateQuantity,
} from "@/stores/cartStore";
import { IBook } from "@/interfaces/IBook";

interface CartContextType {
  addItem: (item: IBook) => void;
  calculateDiscountedPrice: (item: IBook) => number;
  cartItems: IBook[];
  removeItem: (itemId: string) => void;
  totalPrice: number;
  updateItemQuantity: (itemId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (!context) {
    console.warn(
      "useCart is being used outside of CartProvider. Providing default values."
    );

    // Return a default object with no-op functions
    return {
      calculateDiscountedPrice: () => 0,
      cartItems: [],
      addItem: () =>
        console.warn("CartProvider not found. Unable to add item."),
      removeItem: () =>
        console.warn("CartProvider not found. Unable to remove item."),
      updateItemQuantity: () =>
        console.warn("CartProvider not found. Unable to update quantity."),
      totalPrice: 0,
    };
  }

  return context;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const cartItems = useSyncExternalStore(
    cartStore.subscribe,
    () => cartStore.state.items,
    () => cartStore.state.items
  );

  const totalPrice = getTotal();

  const addItemToCart = (item: IBook) => {
    addItem(item);
  };

  const removeItemFromCart = (itemId: string) => {
    removeItem(itemId);
  };

  const updateItemQuantityInCart = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  const value: CartContextType = {
    calculateDiscountedPrice: calculateDiscountedPrice,
    addItem: addItemToCart,
    cartItems,
    removeItem: removeItemFromCart,
    totalPrice,
    updateItemQuantity: updateItemQuantityInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
