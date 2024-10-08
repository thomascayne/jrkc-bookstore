// stores/cartStore.ts

import { IBookInventory } from '@/interfaces/IBookInventory';
import { ICustomerCart, ICustomerCartItem } from '@/interfaces/ICustomerCart';
import { ICartOrder, ICartOrderItem } from '@/interfaces/ICustomerCartOrder';
import { ShippingAddress } from '@/interfaces/ShippingAddress';
import { fetchBookFromSupabase } from '@/utils/bookFromSupabaseApi';
import { ApplicationLogError } from '@/utils/errorLogging';
import { createClient } from '@/utils/supabase/client';
import { Store } from '@tanstack/react-store';

const LOCAL_STORAGE_KEY = 'customer_cart';
const isClient = typeof window !== 'undefined';

const supabase = createClient();

export interface CartState {
    items: ICustomerCartItem[];
    isInitialized: boolean;
}

export const cartStore = new Store<CartState>({ items: [], isInitialized: false });

export const addCartItem = async (book: IBookInventory, quantity: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // For authenticated users, add item to database
        // add to use supabase.rpc because role level access was giving me trouble
        const { data: cartItems, error: cartError } = await supabase
            .rpc('add_to_cart', {
                p_book_id: book.id,
                p_quantity: quantity,
                p_current_price: book.list_price,
                p_is_promotion: book.is_promotion,
                p_discount_percentage: book.discount_percentage || 0,
            })

        if (cartError) {
            console.error('Error fetching cart:', cartError);
            return;
        }

        if (cartItems) {
            const itemsWithBooks = await Promise.all(cartItems.map(async (item: ICustomerCartItem) => {
                const bookData = await fetchBookFromSupabase<IBookInventory>(item.book_id);
                return {
                    ...item,
                    book: bookData,
                    discount_percentage: bookData.discount_percentage,
                    discounted_price: bookData.is_promotion ? calculateDiscountedPrice(bookData) : undefined
                } as ICustomerCartItem;
            }));

            cartStore.setState((state) => ({
                ...state,
                items: itemsWithBooks
            }));
        }
    } else {
        // For guest users, store in local state and localStorage
        cartStore.setState((state) => {
            const existingItem = state.items.find(item => item.book_id === book.id);

            let updatedItems;

            if (existingItem) {
                updatedItems = state.items.map(item =>
                    item.book_id === book.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const newItem: ICustomerCartItem = {
                    id: `local_${Date.now()}`, // Generate a temporary local ID
                    cart_id: 'local_cart',
                    book_id: book.id,
                    quantity,
                    current_price: book.list_price,
                    book
                };
                updatedItems = [...state.items, newItem];
            }
            if (isClient) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
            }
            return { ...state, items: updatedItems };
        });
    }
};

export const calculateDiscountedPrice = (book: IBookInventory) => {
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

export const createOrder = async (paymentMethodId: string, shippingAddress: ShippingAddress) => {
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
                payment_method_id: paymentMethodId,
                shipping_address: shippingAddress,
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
        await supabase.rpc('clear_cart');

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
            const { data: cartItems, error } = await supabase.rpc('get_cart_items');

            if (error) {
                console.error('fetchCart - Error fetching cart:', error);
                return;
            }

            if (cartItems) {
                const itemsWithBooks = await Promise.all(cartItems.map(async (item: ICustomerCartItem) => {
                    const bookData = await fetchBookFromSupabase<IBookInventory>(item.book_id);
                    return {
                        ...item,
                        book: bookData,
                        discount_percentage: bookData.discount_percentage,
                        discounted_price: bookData.is_promotion ? calculateDiscountedPrice(bookData) : undefined
                    } as ICustomerCartItem;
                }));


                if (localItems.length > 0) {
                    // Merge local cart with database cart

                    await mergeLocalCartWithDatabase(localItems, user.id);
                    if (isClient) {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                }

                cartStore.setState((state) => ({ ...state, items: itemsWithBooks || [] }));
            }
        } else {
            // Load cart from local storage for guest users
            cartStore.setState((state) => ({ ...state, items: localItems }));
        }
    } catch (error) {
        ApplicationLogError("fetchCart", "unexpected error", error);
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
            console.log('Failed to create cart in getUserCat', createError);
            throw new Error('Failed to create cart');
        }

        return newCart!;
    }

    return cart;
};

export const handleSignOutOfAppCleanupCartLocalStorage = () => {
    // Clear the local storage
    if (isClient) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // Clear the cart state
    cartStore.setState((state) => ({ ...state, items: [], isInitialized: false }));
};

export const initializeCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let items: ICustomerCartItem[] = [];

    const localItems = loadLocalCart();

    if (user) {
        // Merge local items with database items if there are any local items
        if (localItems.length > 0) {
            await mergeLocalCartWithDatabase(localItems, user.id);
            clearLocalCart();
        }

        // Fetch cart from database for authenticated users
        const { data: cartItems, error } = await supabase.rpc('get_cart_items');

        if (error) {
            console.error('Error fetching cart:', error);
        } else if (cartItems && cartItems.length > 0) {
            items = await Promise.all(cartItems.map(async (item: ICustomerCartItem) => {
                const bookData = await fetchBookFromSupabase<IBookInventory>(item.book_id);
                return {
                    ...item,
                    book: bookData,
                    discount_percentage: bookData.discount_percentage,
                    discounted_price: bookData.is_promotion ? calculateDiscountedPrice(bookData) : undefined
                } as ICustomerCartItem;
            }));

            // Update localStorage with the fetched items
            if (isClient) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
            }
        }
    } else {
        // For guest users, use the local storage items
        items = localItems;
    }

    cartStore.setState((state) => ({ ...state, items, isInitialized: true }));
};

const loadLocalCart = (): ICustomerCartItem[] => {
    if (isClient) {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
};


const mergeLocalCartWithDatabase = async (localItems: ICustomerCartItem[], userId: string) => {
    for (const item of localItems) {
        await supabase.rpc('merge_cart_item', {
            p_book_id: item.book_id,
            p_quantity: item.quantity,
            p_current_price: item.current_price
        });
    }
};


export const removeItem = async (bookId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Remove item from database for authenticated users
        const { error } = await supabase.rpc('remove_from_cart', { p_book_id: bookId });

        if (error) {
            console.error('Error removing item from cart:', error);
            return;
        }
    }

    cartStore.setState((state) => {
        const updatedItems = state.items.filter(item => item.book_id !== bookId);

        // Clear localStorage if the cart is now empty
        if (updatedItems.length === 0 && isClient) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else if (isClient) {
            // Update localStorage with the new cart state
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
        }

        return { ...state, items: updatedItems };
    });
};

const saveLocalCart = (items: ICustomerCartItem[]) => {
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
        const { error } = await supabase.rpc('update_cart_item_quantity', {
            p_book_id: bookId,
            p_quantity: quantity
        });

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


export const finalizePaidCartItems = async (paymentDetails: { paymentMethod: string, totalPaid: number, user_id: string }): Promise<ICartOrder> => {
    try {
        // 1. Fetch the current cart for the user
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('*, items:cart_items(*)')
            .eq('user_id', paymentDetails.user_id)
            .single();

        if (cartError) {
            throw new Error(`Error fetching cart: ${cartError.message}`);
        }

        const currentCart = cart as ICustomerCart;

        // 2. Create new order
        const { data: order, error: orderError } = await supabase.rpc('insert_order', {
            p_user_id: paymentDetails.user_id, // Assuming you have the user object
            p_status: 'paid',
            p_total_amount: paymentDetails.totalPaid,
            p_payment_method: paymentDetails.paymentMethod
        });

        if (orderError) {
            throw new Error(`Error creating order: ${orderError.message}`);
        }

        // 3. Move cart items to order_items
        const orderItems: Omit<ICartOrderItem, 'id' | 'book'>[] = currentCart.items.map(item => ({
            book_id: item.book_id,
            order_id: order.id,
            discount_percentage: item.discount_percentage,
            final_price: item.current_price,
            original_price: item.book.price,
            quantity: item.quantity,
        }));

        // 4. Insert order items
        const { data: insertedOrderItems, error: insertError } = await supabase.rpc('insert_order_items', {
            p_order_items: orderItems
        });

        if (insertError) {
            throw new Error(`Error inserting order items: ${insertError.message}`);
        }

        // 5. Clear the cart
        const { error: clearError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', currentCart.id);

        if (clearError) {
            throw new Error(`Error clearing cart: ${clearError.message}`);
        }

        // 6. Update local cart state
        cartStore.setState((state) => ({
            ...state,
            items: []
        }));

        // 7. Construct and return the ICartOrder object
        const finalOrder: ICartOrder = {
            id: order.id,
            user_id: order.user_id,
            status: order.status,
            total_amount: order.total_amount,
            created_at: order.created_at,
            updated_at: order.updated_at,
            items: insertedOrderItems as ICartOrderItem[]
        };

        return finalOrder;
    } catch (error) {
        console.error('Error in finalizePaidCartItems:', error);
        throw error;
    }
};
