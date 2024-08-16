import { addItem, clearTransaction, completeTransaction, getCurrentTransactionId, getItemCount, getTotal, initializeTransaction, pointOfSaleStore, removeItem, updateOrderDetails, updateQuantity } from '@/stores/pointOfSaleStore';
// hooks/usePointOfSaleStore.ts

import { useStore } from '@tanstack/react-store';

export const usePointOfSaleStore = () => {
  const state = useStore(pointOfSaleStore);

  return {
    ...state,
    addItem,
    clearTransaction,
    completeTransaction,
    getCurrentTransactionId,
    getItemCount,
    getTotal,
    initializeTransaction,
    removeItem,
    updateOrderDetails,
    updateQuantity,
  };
};