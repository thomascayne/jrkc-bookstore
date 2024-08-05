// stores/cartStore.ts

import { IBook } from '@/interfaces/IBook';
import { ICartItem } from '@/interfaces/ICart';
import { createClient } from '@/utils/supabase/client';
import { Store } from '@tanstack/react-store';

const supabase = createClient();

export interface CartState {
    items: ICartItem[];
    isInitialized: boolean;
}

const LOCAL_STORAGE_KEY = 'cart';
const isClient = typeof window !== 'undefined';

export const cartStore = new Store<CartState>({ items: [], isInitialized: false });

export const addItem = async (book: IBook, quantity: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    const newItem: ICartItem = { book_id: book.id, quantity, book };

    if (user) {
        // Add item to database for authenticated users
        const { error } = await supabase.from('cart_items').upsert({
            cart_id: (await getUserCart(user.id)).id,
            book_id: book.id,
            quantity
        });

        if (error) {
            console.error('Error adding item to cart:', error);
            return;
        }
    }

    cartStore.setState((state) => {
        const existingItem = state.items.find(item => item.book_id === book.id);
        const updatedItems = existingItem
            ? state.items.map(item =>
                item.book_id === book.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
            : [...state.items, newItem];

        if (!user) {
            saveLocalCart(updatedItems);
        }

        return { items: updatedItems };
    });
};

export const calculateDiscountedPrice = (book: IBook) => {
    if (!book) return 0;
    if (book.is_promotion && book.discount_percentage) {
        const discountAmount = book.list_price * (book.discount_percentage / 100);
        return book.list_price - discountAmount;
    }
    return book.list_price;
};

const clearLocalCart = () => {
    if (isClient) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
};

export const createOrder = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return;
        }

        const total = getTotal();

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                total_amount: total,
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return;
        }

        const orderItems = cartStore.state.items.map(item => ({
            order_id: order!.id,
            book_id: item.book_id,
            quantity: item.quantity,
            price: calculateDiscountedPrice(item.book),
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error inserting order items:', itemsError);
            return;
        }

        // Update book quantities
        for (const item of cartStore.state.items) {
            const { error: updateError } = await supabase
                .from('books')
                .update({
                    quantity: item.book.quantity - item.quantity,
                    available_quantity: item.book.available_quantity - item.quantity
                })
                .eq('id', item.book_id);

            if (updateError) {
                console.error('Error updating book quantities:', updateError);
            }
        }

        // Clear the cart
        await supabase
            .from('cart_items')
            .delete()
            .eq('cart.user_id', user.id);

        cartStore.setState((state) => ({ ...state, items: [] }));
        if (isClient) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        return order;
    } catch (error) {
        console.error('Error in createOrder:', error);
    }
};


export const fetchCart = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const localItems = loadLocalCart();

        if (user) {
            const { data: cart, error } = await supabase
                .from('carts')
                .select('*, cart_items(*, books(*))')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching cart:', error);
                return;
            }

            if (localItems.length > 0) {
                // Merge local cart with database cart
                await mergeLocalCartWithDatabase(localItems, user.id);
                if (isClient) {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }

            cartStore.setState((state) => ({ ...state, items: cart?.cart_items || [] }));
        } else {
            // Load cart from local storage for guest users
            cartStore.setState((state) => ({ ...state, items: localItems }));
        }
    } catch (error) {
        console.error('Error in fetchCart:', error);
    }
};

export const getCartItemCount = () => {
    if (!cartStore.state || !cartStore.state.items) {
        return 0;
    }

    return cartStore.state.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const getTotal = () => {
    if (!cartStore.state || !cartStore.state.items) {
        return 0;
    }

    return cartStore.state.items.reduce(
        (sum, item) => sum + calculateDiscountedPrice(item.book) * item.quantity,
        0
    );
};

const getUserCart = async (userId: string) => {
    const { data: cart, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({ user_id: userId })
            .select()
            .single();

        if (createError) {
            throw new Error('Failed to create cart');
        }

        return newCart!;
    }

    return cart;
};


export const initializeCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let items: ICartItem[] = [];

    if (user) {
        // Fetch cart from database for authenticated users
        const { data: cart, error } = await supabase
            .from('carts')
            .select('*, cart_items(*, books(*))')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching cart:', error);
        } else {
            items = cart?.cart_items || [];
        }

        // Merge with local storage items
        const localItems = loadLocalCart();
        if (localItems.length > 0) {
            await mergeLocalCartWithDatabase(localItems, user.id);
            items = [...items, ...localItems];
            clearLocalCart();
        }
    } else {
        // Load cart from local storage for guest users
        items = loadLocalCart();
    }

    cartStore.setState((state) => ({ ...state, items, isInitialized: true }));
};


const loadLocalCart = (): ICartItem[] => {
    if (isClient) {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
};


const mergeLocalCartWithDatabase = async (localItems: ICartItem[], userId: string) => {
    const cart = await getUserCart(userId);
    for (const item of localItems) {
        await supabase.from('cart_items').upsert({
            cart_id: cart.id,
            book_id: item.book_id,
            quantity: item.quantity
        });
    }
};


export const removeItem = async (bookId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Remove item from database for authenticated users
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', (await getUserCart(user.id)).id)
            .eq('book_id', bookId);

        if (error) {
            console.error('Error removing item from cart:', error);
            return;
        }
    }

    cartStore.setState((state) => {
        const updatedItems = state.items.filter(item => item.book_id !== bookId);
        if (!user) {
            saveLocalCart(updatedItems);
        }
        return { ...state, items: updatedItems };
    });
};

const saveLocalCart = (items: ICartItem[]) => {
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
};

const updateDatabaseCart = async (userId: string) => {
    const { items } = cartStore.state;

    // First, clear the existing cart items for this user
    await supabase.from('cart_items').delete().eq('user_id', userId);

    // Then, insert the new cart items
    for (const item of items) {
        await supabase.from('cart_items').insert({
            user_id: userId,
            book_id: item.book_id,
            quantity: item.quantity
        });
    }
};

export const updateQuantity = async (bookId: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Update quantity in database for authenticated users
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('cart_id', (await getUserCart(user.id)).id)
            .eq('book_id', bookId);

        if (error) {
            console.error('Error updating item quantity:', error);
            return;
        }
    }

    cartStore.setState((state) => {
        const updatedItems = state.items.map(item =>
            item.book_id === bookId ? { ...item, quantity } : item
        );

        if (!user) {
            saveLocalCart(updatedItems);
        }
        return { ...state, items: updatedItems };
    });
};
