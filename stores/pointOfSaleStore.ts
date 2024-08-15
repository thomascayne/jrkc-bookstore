// stores/pointOfSaleStore.ts

import { IOrder } from '@/interfaces/IOrder';
import { IOrderItem } from '@/interfaces/IOrderItem';
import { Store } from '@tanstack/react-store';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

// Interfaces
interface PointOfSaleState {
    currentOrder: IOrder | null;
    orderItems: IOrderItem[];
    isInitialized: boolean;
}

// Constants
const LOCAL_STORAGE_KEY = 'pos_transaction';
const isClient = typeof window !== 'undefined';

const supabase = createClient();

// Create the store
export const pointOfSaleStore = new Store<PointOfSaleState>({
    currentOrder: null,
    orderItems: [],
    isInitialized: false
});

const loadLocalTransaction = (): PointOfSaleState | null => {
    if (isClient) {
        const storedTransaction = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedTransaction ? JSON.parse(storedTransaction) : null;
    }
    return null;
};

// Helper functions
const saveLocalTransaction = (state: PointOfSaleState) => {
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
};

// Store functions

export const addItem = async (book: {
    id: string;
    price: number;
    category_id: number;
    isbn13: string;
    is_promotion?: boolean;
    discount?: number;
    discount_percentage?: number;
}, quantity: number = 1) => {

    console.log("addItem book", book);
    const { data: { user }, error } = await supabase.auth.getUser();

    pointOfSaleStore.setState((state) => {
        if (!state.currentOrder) {
            console.error('No current order initialized');
            const newOrder: IOrder = {
                customer_email: '',
                customer_phone: '',
                order_date: new Date().toISOString(),
                sales_person_id: user!.id,
                status: 'pending',
                total_amount: 0,
                transaction_id: uuidv4(),
            };

            state = { ...state, currentOrder: newOrder, orderItems: [] };

            return state;
        }

        const existingItem = state.orderItems.find(item => item.book_id === book.id);
        let updatedItems: IOrderItem[];

        if (existingItem) {
            updatedItems = state.orderItems.map(item =>
                item.book_id === book.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            const calculatePrice = (price: number, quantity: number, isPromotion: boolean, discount: number) => {
                if (isPromotion) {
                    return price * quantity * (1 - discount);
                }
                return price * quantity;
            };

            const newItem: IOrderItem = {
                id: uuidv4(),
                book_id: book.id,
                category_id: book.category_id,
                discount_percentage: book.discount_percentage,
                isbn13: book.isbn13,
                is_promotion: book.is_promotion || false,
                price_per_unit: book.price,
                price: calculatePrice(book.price, quantity, book.is_promotion || false, book.discount || 0),
                quantity,
                status: 'pending',

            };
            updatedItems = [...state.orderItems, newItem];
        }

        const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const updatedOrder: IOrder = {
            ...state.currentOrder,
            total_amount: totalAmount
        };

        const newState = { ...state, currentOrder: updatedOrder, orderItems: updatedItems };
        saveLocalTransaction(newState);
        return newState;
    });

    // Sync with database
    if (pointOfSaleStore.state.orderItems.length === 1) {
        // This is the first item, so create the order in the database
        console.log("pointOfSaleStore.state.currentOrder", pointOfSaleStore.state.currentOrder);
        console.log("pointOfSaleStore.state.orderItems", pointOfSaleStore.state.orderItems);

        await supabase.rpc('initialize_transaction', {
            p_sales_person_id: pointOfSaleStore.state.currentOrder?.sales_person_id,
            p_local_transaction: {
                order: pointOfSaleStore.state.currentOrder,
                order_items: pointOfSaleStore.state.orderItems
            }
        });
    } else {
        // Update existing order
        console.log("Updating order...", pointOfSaleStore.state.currentOrder);
        console.log("Updating order items...", pointOfSaleStore.state.orderItems);

        await supabase.rpc('update_point_of_sale_order', {
            p_order: pointOfSaleStore.state.currentOrder,
            p_items: pointOfSaleStore.state.orderItems
        });
        console.log("got here")
    }
};

export const clearTransaction = () => {
    pointOfSaleStore.setState((state) => ({
        ...state,
        currentOrder: null,
        orderItems: [],
        isInitialized: true
    }));
    if (isClient) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
};

export const completeTransaction = async () => {
    // Here you would typically send the transaction to a backend API
    const completedTransaction = { ...pointOfSaleStore.state };
    clearTransaction();
    return completedTransaction;
};

export const getItemCount = () => {
    return pointOfSaleStore.state.orderItems.reduce((sum, item) => sum + item.quantity, 0);
};

export const getTotal = () => {
    return pointOfSaleStore.state.currentOrder?.total_amount || 0;
};

export const initializeTransaction = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const salesPersonId = user?.id;

    if (!salesPersonId) {
        console.error('No authenticated user found');
        return;
    }

    const localTransaction = loadLocalTransaction();

    if (localTransaction && localTransaction.currentOrder) {
        // Check if the local transaction exists in the database
        const { data, error } = await supabase
            .rpc('get_pending_order', {
                p_transaction_id: localTransaction.currentOrder.transaction_id,
                p_sales_person_id: salesPersonId
            });

        if (error) {
            console.error('Error fetching pending order:', error);
            return;
        }

        if (data) {
            // If the order exists in the database, use it
            pointOfSaleStore.setState((state) => ({
                ...state,
                currentOrder: data.order,
                orderItems: data.order_items,
                isInitialized: true
            }));
        } else {
            // If the order doesn't exist in the database, use the local data
            pointOfSaleStore.setState((state) => ({
                ...state,
                currentOrder: localTransaction.currentOrder,
                orderItems: localTransaction.orderItems,
                isInitialized: true
            }));
        }
    } else {
        // Create a new order in local state only
        const newOrder: IOrder = {
            customer_email: '',
            customer_phone: '',
            order_date: new Date().toISOString(),
            sales_person_id: salesPersonId,
            status: 'pending',
            total_amount: 0,
            transaction_id: uuidv4(),
        };

        pointOfSaleStore.setState((state) => ({
            ...state,
            currentOrder: newOrder,
            orderItems: [],
            isInitialized: true
        }));
    }

    saveLocalTransaction(pointOfSaleStore.state);
};

const syncOrderWithDatabase = async (localTransaction: PointOfSaleState) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .rpc('sync_point_of_sales_order', {
            order: localTransaction.currentOrder,
            items: localTransaction.orderItems
        });

    if (error) {
        console.error('Error syncing order with database:', error);
        return;
    }

    pointOfSaleStore.setState((state) => ({
        ...state,
        currentOrder: data.order,
        orderItems: data.order_items,
        isInitialized: true
    }));

    saveLocalTransaction(pointOfSaleStore.state);
};

export const removeItem = (bookId: string) => {
    pointOfSaleStore.setState((state) => {
        if (!state.currentOrder) return state;

        const updatedItems = state.orderItems.filter(item => item.book_id !== bookId);
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const updatedOrder: IOrder = {
            ...state.currentOrder,
            total_amount: totalAmount
        };

        const newState = { ...state, currentOrder: updatedOrder, orderItems: updatedItems };
        saveLocalTransaction(newState);
        return newState;
    });
};

// Separate function to handle database update
const updateDatabase = (state: any) => {
    supabase.rpc('update_point_of_sale_order', {
        p_order: state.currentOrder,
        p_items: state.orderItems
    }).then((response) => {
        if (response.error) {
            console.error('Error updating order in database:', response.error);
        }
    });
}

export const updateOrderDetails = (details: Partial<IOrder>) => {
    pointOfSaleStore.setState((state) => {
        if (!state.currentOrder) return state;

        const updatedOrder: IOrder = {
            ...state.currentOrder,
            ...details
        };

        const newState = { ...state, currentOrder: updatedOrder };
        saveLocalTransaction(newState);
        return newState;
    });
};
export const updateQuantity = (bookId: string, quantity: number) => {
    pointOfSaleStore.setState((state) => {
        if (!state.currentOrder) return state;

        const updatedItems = state.orderItems.map(item =>
            item.book_id === bookId ? { ...item, quantity, price: item.price_per_unit * quantity } : item
        );
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const updatedOrder: IOrder = {
            ...state.currentOrder,
            total_amount: totalAmount
        };

        const newState = { ...state, currentOrder: updatedOrder, orderItems: updatedItems };

        updateDatabase(newState);
        
        saveLocalTransaction(newState);
        return newState;
    });
};
