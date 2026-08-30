import { Store } from '@tanstack/react-store';

import type { IBookInventory } from '@/interfaces/IBookInventory';
import type { ICustomerCartItem } from '@/interfaces/ICustomerCart';
import type { ICartOrder } from '@/interfaces/ICustomerCartOrder';
import type { ShippingAddress } from '@/interfaces/ShippingAddress';
import { apiRequest } from '@/utils/apiClient';
import { ApplicationLogError } from '@/utils/errorLogging';

const localStorageKey = 'customer_cart';
const isClient = typeof window !== 'undefined';
let authenticatedCart = false;

export interface CartState {
  isInitialized: boolean;
  items: ICustomerCartItem[];
}

export const cartStore = new Store<CartState>({
  isInitialized: false,
  items: [],
});

function saveLocalCart(items: ICustomerCartItem[]) {
  if (!isClient) return;
  if (items.length === 0) {
    localStorage.removeItem(localStorageKey);
  } else {
    localStorage.setItem(localStorageKey, JSON.stringify(items));
  }
}

function loadLocalCart(): ICustomerCartItem[] {
  if (!isClient) return [];
  const storedCart = localStorage.getItem(localStorageKey);
  if (!storedCart) return [];

  try {
    const parsedCart: unknown = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? (parsedCart as ICustomerCartItem[]) : [];
  } catch {
    localStorage.removeItem(localStorageKey);
    return [];
  }
}

function setItems(items: ICustomerCartItem[], isInitialized = true) {
  cartStore.setState((state) => ({ ...state, isInitialized, items }));
}

export const calculateDiscountedPrice = (book: IBookInventory) => {
  if (book.is_promotion && book.discount_percentage) {
    return book.list_price * (1 - book.discount_percentage / 100);
  }
  return book.list_price;
};

export const addCartItem = async (
  book: IBookInventory,
  quantity: number = 1,
) => {
  if (book.catalog_source !== 'google') {
    try {
      const cart = await apiRequest<{
        authenticated: boolean;
        items: ICustomerCartItem[];
      }>('/api/cart');
      authenticatedCart = cart.authenticated;

      if (authenticatedCart) {
        const response = await apiRequest<{ items: ICustomerCartItem[] }>(
          '/api/cart',
          {
            body: JSON.stringify({ book_id: book.id, quantity }),
            method: 'POST',
          },
        );
        setItems(response.items);
        return;
      }
    } catch (error) {
      ApplicationLogError('addCartItem', 'database cart unavailable', error);
    }
  }

  cartStore.setState((state) => {
    const existingItem = state.items.find((item) => item.book_id === book.id);
    const items = existingItem
      ? state.items.map((item) =>
          item.book_id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [
          ...state.items,
          {
            book,
            book_id: book.id,
            cart_id: 'local_cart',
            current_price: calculateDiscountedPrice(book),
            id: `local_${Date.now()}`,
            quantity,
          },
        ];
    saveLocalCart(items);
    return { ...state, items };
  });
};

export const initializeCart = async () => {
  const localItems = loadLocalCart();

  try {
    const cart = await apiRequest<{
      authenticated: boolean;
      items: ICustomerCartItem[];
    }>('/api/cart');
    authenticatedCart = cart.authenticated;

    if (!cart.authenticated) {
      setItems(localItems);
      return;
    }

    let items = cart.items;
    if (localItems.length > 0) {
      const mergedCart = await apiRequest<{ items: ICustomerCartItem[] }>(
        '/api/cart',
        {
          body: JSON.stringify({
            items: localItems.map((item) => ({
              book_id: item.book_id,
              quantity: item.quantity,
            })),
          }),
          method: 'POST',
        },
      );
      items = mergedCart.items;
      saveLocalCart([]);
    }

    setItems(items);
  } catch (error) {
    authenticatedCart = false;
    setItems(localItems);
    ApplicationLogError('initializeCart', 'database cart unavailable', error);
  }
};

export const fetchCart = initializeCart;

export const getCartItemCount = () =>
  cartStore.state.items.reduce((sum, item) => sum + item.quantity, 0);

export const getTotal = () =>
  cartStore.state.items.reduce(
    (sum, item) => sum + calculateDiscountedPrice(item.book) * item.quantity,
    0,
  );

export const removeItem = async (bookId: string) => {
  if (authenticatedCart) {
    const response = await apiRequest<{ items: ICustomerCartItem[] }>(
      '/api/cart',
      {
        body: JSON.stringify({ book_id: bookId }),
        method: 'DELETE',
      },
    );
    setItems(response.items);
    return;
  }

  const items = cartStore.state.items.filter((item) => item.book_id !== bookId);
  saveLocalCart(items);
  setItems(items);
};

export const updateQuantity = async (bookId: string, quantity: number) => {
  if (quantity < 1) {
    await removeItem(bookId);
    return;
  }

  if (authenticatedCart) {
    const response = await apiRequest<{ items: ICustomerCartItem[] }>(
      '/api/cart',
      {
        body: JSON.stringify({ book_id: bookId, quantity }),
        method: 'PATCH',
      },
    );
    setItems(response.items);
    return;
  }

  const items = cartStore.state.items.map((item) =>
    item.book_id === bookId ? { ...item, quantity } : item,
  );
  saveLocalCart(items);
  setItems(items);
};

export const finalizePaidCartItems = async (paymentDetails: {
  paymentMethod: string;
  totalPaid: number;
  user_id: string;
}): Promise<ICartOrder> => {
  const { order } = await apiRequest<{
    order: {
      createdAt: string;
      id: string;
      status: ICartOrder['status'];
      totalAmount: number;
      updatedAt: string;
      userId: string;
    };
  }>('/api/orders', {
    body: JSON.stringify({ paymentMethod: paymentDetails.paymentMethod }),
    method: 'POST',
  });

  authenticatedCart = true;
  setItems([]);
  return {
    created_at: order.createdAt,
    id: order.id,
    items: [],
    status: order.status,
    total_amount: order.totalAmount,
    updated_at: order.updatedAt,
    user_id: order.userId,
  };
};

export const createOrder = async (
  paymentMethodId: string,
  shippingAddress: ShippingAddress,
) => {
  const { order } = await apiRequest<{ order: unknown }>('/api/orders', {
    body: JSON.stringify({ paymentMethod: paymentMethodId, shippingAddress }),
    method: 'POST',
  });
  setItems([]);
  return order;
};

export const handleSignOutOfAppCleanupCartLocalStorage = () => {
  authenticatedCart = false;
  saveLocalCart([]);
  setItems([], false);
};
