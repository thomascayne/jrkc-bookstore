// stores/cartStore.ts

import { Store } from '@tanstack/react-store';
import { IBook } from '@/interfaces/IBook';

export interface CartState {
    items: IBook[];
}

const isClient = typeof window !== 'undefined';
const LOCAL_STORAGE_KEY = 'cart';

export const loadCartFromLocalStorage = (): CartState => {
    if (isClient) {
        const cartData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cartData) {
            return JSON.parse(cartData);
        }
    }
    return { items: [] };
};

export const saveCartToLocalStorage = (state: CartState) => {
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
};

export const defaultState: CartState = isClient ? loadCartFromLocalStorage() : { items: [] };

export const cartStore = new Store(defaultState);

export const addItem = (item: IBook) => {
    cartStore.setState((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        const updatedItems = existingItem
            ? state.items.map((i) => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i)
            : [...state.items, { ...item, quantity: 1 }];
        const newState = { items: updatedItems };
        saveCartToLocalStorage(newState);
        return newState;
    });
};

export const removeItem = (id: string) => {
    cartStore.setState((state) => {
        const newState = { items: state.items.filter((item) => item.id !== id) };
        saveCartToLocalStorage(newState);
        return newState;
    });
};

export const updateQuantity = (id: string, quantity: number) => {
    cartStore.setState((state) => {
        const newState = {
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            ),
        };
        saveCartToLocalStorage(newState);
        return newState;
    });
};

export const calculateDiscountedPrice = (item: IBook) => {
    if (item.is_promotion && item.discount_percentage) {
        const discountAmount = item.list_price * (item.discount_percentage / 100);
        return item.list_price - discountAmount;
    }
    return item.list_price;
};


export const getTotal = () => {
    return cartStore.state.items.reduce(
        (sum, item) => sum + calculateDiscountedPrice(item) * item.quantity,
        0
    );
};

export const getCartItemCount = () => {
    return cartStore.state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
};