// utils\supabase\inventoryApi.ts

import { BookCategory } from '@/interfaces/BookCategory';
import { IBookInventory } from '@/interfaces/IBookInventory';
import { InventoryItem } from '@/interfaces/inventoryItem';
import { supabase } from '@/utils/supabase/client';

interface BookWithCategory extends IBookInventory {
    category_name: string;
}


export const fetchInventory = async (): Promise<BookWithCategory[]> => {
    const { data, error } = await supabase
        .rpc('rls_fetch_inventory');

    if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }

    return data || [];
};

// Fetch all categories from the database
export const fetchCategories = async (): Promise<BookCategory[]> => {
    const { data, error } = await supabase
        .rpc('get_categories')
        .select();

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

// Add a new book to the inventory
export const addBookToInventory = async (
    book_id: string,
    quantity: number,
    price: number,
    categoryId: string,
    title: string
) => {
    const { data, error } = await supabase.rpc('add_book_to_inventory', {
        p_book_id: book_id,
        p_quantity: quantity,
        p_price: price,
        p_category_id: categoryId,
        p_title: title
    });

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

// Update the quantity of an existing book in the inventory
export const updateInventoryQuantity = async (id: string, quantity: number) => {
    const { error } = await supabase.rpc('update_inventory_quantity', {
        p_book_id: id,
        p_new_quantity: quantity
      });
      return !error;
  };

// Update the price of an existing book in the inventory
export const updateBookPrice = async (id: string, price: number) => {
    const { error } = await supabase.rpc('update_book_price', {
        p_book_id: id,
        p_new_price: price
      });
      return !error;
  };