import { Store } from '@tanstack/react-store';
import { v4 as uuidv4 } from 'uuid';

import type { AppUser } from '@/auth/types';
import type { IOrder } from '@/interfaces/IOrder';
import type { IOrderItem } from '@/interfaces/IOrderItem';
import { apiRequest } from '@/utils/apiClient';

interface PointOfSaleState {
  currentOrder: IOrder | null;
  isInitialized: boolean;
  orderItems: IOrderItem[];
}

export const pointOfSaleStore = new Store<PointOfSaleState>({
  currentOrder: null,
  isInitialized: false,
  orderItems: [],
});

function calculateOrderTotal(items: IOrderItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export const initializeTransaction = async () => {
  const { user } = await apiRequest<{ user: AppUser | null }>('/api/auth/session');
  if (!user) return;

  pointOfSaleStore.setState((state) => ({
    ...state,
    currentOrder: {
      customer_email: '',
      customer_phone: '',
      id: uuidv4(),
      order_date: new Date().toISOString(),
      sales_person_id: user.id,
      status: 'pending',
      total_amount: 0,
      transaction_id: uuidv4(),
    },
    isInitialized: true,
    orderItems: [],
  }));
};

export const addItem = async (
  book: {
    category_id: number;
    discount?: number;
    discount_percentage?: number;
    id: string;
    is_promotion?: boolean;
    isbn13: string;
    price: number;
  },
  quantity: number = 1,
) => {
  if (!pointOfSaleStore.state.currentOrder) {
    await initializeTransaction();
  }

  pointOfSaleStore.setState((state) => {
    if (!state.currentOrder) return state;
    const existingItem = state.orderItems.find((item) => item.book_id === book.id);
    const unitPrice = book.is_promotion
      ? book.price * (1 - (book.discount ?? 0))
      : book.price;
    const orderItems = existingItem
      ? state.orderItems.map((item) =>
          item.book_id === book.id
            ? {
                ...item,
                price: unitPrice * (item.quantity + quantity),
                quantity: item.quantity + quantity,
              }
            : item,
        )
      : [
          ...state.orderItems,
          {
            book_id: book.id,
            category_id: book.category_id,
            discount_percentage: book.discount_percentage,
            id: uuidv4(),
            is_promotion: book.is_promotion || false,
            isbn13: book.isbn13,
            price: unitPrice * quantity,
            price_per_unit: unitPrice,
            quantity,
            status: 'pending' as const,
          },
        ];

    return {
      ...state,
      currentOrder: {
        ...state.currentOrder,
        total_amount: calculateOrderTotal(orderItems),
      },
      isInitialized: true,
      orderItems,
    };
  });
};

export const clearTransaction = () => {
  pointOfSaleStore.setState((state) => ({
    ...state,
    currentOrder: null,
    isInitialized: true,
    orderItems: [],
  }));
};

export const closeOutRegisterWithPayment = async (
  _orderId: string,
  transactionId: string,
  paymentMethod: string,
) => {
  try {
    const result = await apiRequest<{ success: boolean }>(
      '/api/point-of-sale/orders',
      {
        body: JSON.stringify({
          items: pointOfSaleStore.state.orderItems,
          paymentMethod,
          transactionId,
        }),
        method: 'POST',
      },
    );
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to close register.',
      success: false,
    };
  }
};

export const completeTransaction = async () => ({ ...pointOfSaleStore.state });

export const getCurrentTransactionId = () =>
  pointOfSaleStore.state.currentOrder?.transaction_id || null;

export const getItemCount = () =>
  pointOfSaleStore.state.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

export const getTotal = () =>
  pointOfSaleStore.state.currentOrder?.total_amount || 0;

export const removeItem = async (id: string) => {
  pointOfSaleStore.setState((state) => {
    if (!state.currentOrder) return state;
    const orderItems = state.orderItems.filter((item) => item.id !== id);
    return {
      ...state,
      currentOrder: {
        ...state.currentOrder,
        total_amount: calculateOrderTotal(orderItems),
      },
      orderItems,
    };
  });
};

export const updateOrderDetails = (details: Partial<IOrder>) => {
  pointOfSaleStore.setState((state) =>
    state.currentOrder
      ? { ...state, currentOrder: { ...state.currentOrder, ...details } }
      : state,
  );
};

export const updateQuantity = (bookId: string, quantity: number) => {
  pointOfSaleStore.setState((state) => {
    if (!state.currentOrder) return state;
    const orderItems = state.orderItems.map((item) =>
      item.book_id === bookId
        ? { ...item, price: item.price_per_unit * quantity, quantity }
        : item,
    );
    return {
      ...state,
      currentOrder: {
        ...state.currentOrder,
        total_amount: calculateOrderTotal(orderItems),
      },
      orderItems,
    };
  });
};
