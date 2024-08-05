// stores/cartStore.ts
import { Store } from '@tanstack/react-store';
import { ICartItem } from '@/interfaces/ICart';
import { IBook } from '@/interfaces/IBook';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface CartState {
    items: ICartItem[];
}

const LOCAL_STORAGE_KEY = 'cart';
const isClient = typeof window !== 'undefined';

export const cartStore = new Store<CartState>({ items: [] });

const loadLocalCart = (): ICartItem[] => {
    if (isClient) {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
};

const saveLocalCart = (items: ICartItem[]) => {
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
};

export const fetchCart = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

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

            const localItems = loadLocalCart();
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
            const localItems = loadLocalCart();
            cartStore.setState((state) => ({ ...state, items: localItems }));
        }
    } catch (error) {
        console.error('Error in fetchCart:', error);
    }
};

const mergeLocalCartWithDatabase = async (localItems: ICartItem[], userId: string) => {
    for (const item of localItems) {
        await addItem(item.book, item.quantity, userId);
    }
};

export const addItem = async (book: IBook, quantity: number = 1, userId?: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const currentPrice = book.list_price;
        const discountPercentage = book.is_promotion ? book.discount_percentage : 0;
        const discountedPrice = calculateDiscountedPrice(book);


        if (user || userId) {
            // User is signed in, add to database
            const actualUserId = userId || user!.id;
            let { data: cart, error: cartError } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', actualUserId)
                .single();

            if (cartError) {
                const { data: newCart, error: newCartError } = await supabase
                    .from('carts')
                    .insert({ user_id: actualUserId })
                    .select()
                    .single();
                if (newCartError) {
                    console.error('Error creating new cart:', newCartError);
                    return;
                }
                cart = newCart;
            }

            const { data: cartItem, error: upsertError } = await supabase
                .from('cart_items')
                .upsert({
                    cart_id: cart!.id,
                    book_id: book.id,
                    quantity: quantity,
                })
                .select('*, books(*)')
                .single();

            if (upsertError) {
                console.error('Error updating cart item:', upsertError);
                return;
            }

            cartStore.setState((state) => ({
                items: [...state.items.filter(item => item.book_id !== book.id), cartItem!],
            }));
        } else {
            // Guest user, add to local storage
            cartStore.setState((state) => {
                const existingItem = state.items.find(item => item.book_id === book.id);
                let newItems;
                if (existingItem) {
                    newItems = state.items.map(item =>
                        item.book_id === book.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newItems = [...state.items, { book_id: book.id, quantity, book } as ICartItem];
                }
                saveLocalCart(newItems);
                return { items: newItems };
            });
        }
    } catch (error) {
        console.error('Error in addItem:', error);
    }
};

export const removeItem = async (bookId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('book_id', bookId)
                .eq('cart.user_id', user.id);

            if (error) {
                console.error('Error removing item from database:', error);
                return;
            }
        }

        cartStore.setState((state) => {
            const newItems = state.items.filter(item => item.book_id !== bookId);
            saveLocalCart(newItems);
            return { items: newItems };
        });
    } catch (error) {
        console.error('Error in removeItem:', error);
    }
};

export const updateQuantity = async (bookId: string, quantity: number) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: updatedItem, error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('book_id', bookId)
                .eq('cart.user_id', user.id)
                .select('*, books(*)')
                .single();

            if (error) {
                console.error('Error updating quantity in database:', error);
                return;
            }

            cartStore.setState((state) => ({
                items: state.items.map(item => item.book_id === bookId ? updatedItem! : item),
            }));
        } else {
            cartStore.setState((state) => {
                const newItems = state.items.map(item =>
                    item.book_id === bookId ? { ...item, quantity } : item
                );
                saveLocalCart(newItems);
                return { items: newItems };
            });
        }
    } catch (error) {
        console.error('Error in updateQuantity:', error);
    }
};

export const getTotal = () => {
    return cartStore.state.items.reduce(
        (sum, item) => sum + calculateDiscountedPrice(item.book) * item.quantity,
        0
    );
};

export const getCartItemCount = () => {
    return cartStore.state.items.reduce((sum, item) => sum + item.quantity, 0);
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

export const calculateDiscountedPrice = (book: IBook) => {
    if (book.is_promotion && book.discount_percentage) {
        const discountAmount = book.list_price * (book.discount_percentage / 100);
        return book.list_price - discountAmount;
    }
    return book.list_price;
};