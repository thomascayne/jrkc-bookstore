// hooks/usePointOfSaleStore.ts

import { useStore } from '@tanstack/react-store';
import {
  addItem,
  clearTransaction,
  completeTransaction,
  getItemCount,
  getTotal,
  initializeTransaction,
  pointOfSaleStore,
  removeItem,
  updateOrderDetails,
  updateQuantity,
} from '@/stores/pointOfSaleStore';

export const usePointOfSaleStore = () => {
  const state = useStore(pointOfSaleStore);

  return {
    ...state,
    addItem,
    clearTransaction,
    completeTransaction,
    getItemCount,
    getTotal,
    initializeTransaction,
    removeItem,
    updateOrderDetails,
    updateQuantity,
  };
};