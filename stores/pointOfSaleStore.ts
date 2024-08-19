// stores/pointOfSaleStore.ts

import { IOrder } from '@/interfaces/IOrder';
import { IOrderItem } from '@/interfaces/IOrderItem';
import { createClient } from '@/utils/supabase/client';
import { Store } from '@tanstack/react-store';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
interface PointOfSaleState {
    currentOrder: IOrder | null;
    orderItems: IOrderItem[];
    isInitialized: boolean;
}

const supabase = createClient();

// Create the store
export const pointOfSaleStore = new Store<PointOfSaleState>({
    currentOrder: null,
    orderItems: [],
    isInitialized: false
});

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
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return;
    }

    let currentState = pointOfSaleStore.state;

    if (!currentState.currentOrder || !currentState.currentOrder.id) {
        const newOrder: IOrder = {
            id: uuidv4(),
            customer_email: '',
            customer_phone: '',
            order_date: new Date().toISOString(),
            sales_person_id: user.id,
            status: 'pending',
            total_amount: 0,
            transaction_id: uuidv4(),
        };
        currentState = { ...currentState, currentOrder: newOrder, orderItems: [] };
    }

    const existingItem = currentState.orderItems.find(item => item.book_id === book.id);
    let updatedItems: IOrderItem[];

    if (existingItem) {
        updatedItems = currentState.orderItems.map(item =>
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
            book_id: book.id,
            category_id: book.category_id,
            discount_percentage: book.discount_percentage,
            id: uuidv4(),
            is_promotion: book.is_promotion || false,
            isbn13: book.isbn13,
            price_per_unit: book.price,
            price: calculatePrice(book.price, quantity, book.is_promotion || false, book.discount || 0),
            quantity,
            status: 'pending'
        };
        updatedItems = [...currentState.orderItems, newItem];
    }

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
    const updatedOrder: IOrder = {
        ...currentState.currentOrder!,
        total_amount: totalAmount
    };

    const newState = { ...currentState, currentOrder: updatedOrder, orderItems: updatedItems };

    try {
        let data;
        let dbError;

        if (currentState.orderItems.length > 0) {
            // Update existing order
            const { data: updatedData, error: updateError } = await supabase.rpc('update_point_of_sale_order', {
                p_order: newState.currentOrder,
                p_items: newState.orderItems
            });
            data = updatedData;
            dbError = updateError;
        } else {
            // Create a new order
            const { data: createdData, error: createError } = await supabase.rpc('create_initial_order', {
                p_order: newState.currentOrder,
                p_items: newState.orderItems
            });
            data = createdData;
            dbError = createError;
        }

        if (dbError) {
            console.error("Updating Erroring order:", dbError);
            return;
        }

        pointOfSaleStore.setState((state) => ({
            ...state,
            currentOrder: data.order,
            orderItems: data.order_items,
            isInitialized: true
        }));
    } catch (error) {
        console.error("Exception during database update:", error);
    }
};

export const clearTransaction = () => {
    pointOfSaleStore.setState((state) => ({
        ...state,
        currentOrder: null,
        orderItems: [],
        isInitialized: true
    }));
};

export const closeOutRegisterWithPayment = async (
    orderId: string,
    transactionId: string,
    paymentMethod: string
) => {
    try {
        const { data, error } = await supabase.rpc('close_out_register_with_payment', {
            p_id: orderId,
            p_transaction_id: transactionId,
            p_payment_method: paymentMethod
        });

        if (error) return { success: false, error: error.message };
        return data;
    } catch (error: any) {
        console.error('Error closing out register:', error);
        return { success: false, error: error.message };
    }
};

export const completeTransaction = async () => {
    // Here you would typically send the transaction to a backend API
    const completedTransaction = { ...pointOfSaleStore.state };
    return completedTransaction;
};

export const getCurrentTransactionId = () => {
    return pointOfSaleStore.state.currentOrder?.transaction_id || null;
};

export const getItemCount = () => {
    return pointOfSaleStore.state.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
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

    // Create a new order in local state only
    const transactionId = uuidv4();
    const newOrder: IOrder = {
        customer_email: '',
        customer_phone: '',
        order_date: new Date().toISOString(),
        sales_person_id: salesPersonId,
        status: 'pending',
        total_amount: 0,
        transaction_id: transactionId,
    };

    pointOfSaleStore.setState((state) => ({
        ...state,
        currentOrder: newOrder,
        orderItems: [],
        isInitialized: true,
        currentTransactionId: transactionId
    }));


};

// export const removeItemit = (bookId: string) => {
//     pointOfSaleStore.setState((state) => {
//         if (!state.currentOrder) return state;

//         const updatedItems = state.orderItems.filter(item => item.book_id !== bookId);
//         const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
//         const updatedOrder: IOrder = {
//             ...state.currentOrder,
//             total_amount: totalAmount
//         };

//         const newState = { ...state, currentOrder: updatedOrder, orderItems: updatedItems };
//         return newState;
//     });
// };

export const removeItem = async (id: string) => {
    const { data, error } = await supabase.rpc('remove_order_item_marked_as_removed', {
        p_id: id,
        p_transaction_id: getCurrentTransactionId()
    });

    if (error) {
        console.error('Error removing item:', error);
        return;
    }

    if (data && data.success) {
        pointOfSaleStore.setState((state) => {
            if (!state.currentOrder) return state;

            const updatedItems = state.orderItems.filter(item => item.id !== id);
            const totalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);
            const updatedOrder: IOrder = {
                ...state.currentOrder,
                total_amount: totalAmount
            };

            const newState = { ...state, currentOrder: updatedOrder, orderItems: updatedItems };
            return newState;
        });

        // Check if the order has been removed (no items left)
        if (data.order_items.length === 0) {
            startNewTransaction();
        }
    } else {
        console.error('Error removing item:', data ? data.error : 'Unknown error');
    }
};

// Function to start a new transaction (to be implemented based on your app's logic)
const startNewTransaction = () => {
    pointOfSaleStore.setState((state) => ({
        ...state,
        currentOrder: null,
        orderItems: []
    }));

    // Additional logic for starting a new transaction...
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

        return newState;
    });
};
