// components/CartInitializer.tsx
"use client";

import { useEffect } from "react";
import { initializeCart, cartStore } from "@/stores/cartStore";
import { useStore } from "@tanstack/react-store";

export function CartInitializer() {
  const isInitialized = useStore(cartStore, (state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initializeCart();
    }
  }, [isInitialized]);

  return null;
}
