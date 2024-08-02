// contexts/CartContext.tsx

"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  cartStore,
  addItem,
  removeItem,
  updateQuantity,
  getTotal,
} from "@/stores/cartStore";
import { IBook } from "@/interfaces/IBook";

interface CartContextType {
  cartItems: IBook[];
  addItem: (item: IBook) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  totalPrice: number;
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
    cartItems,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateItemQuantity: updateItemQuantityInCart,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
