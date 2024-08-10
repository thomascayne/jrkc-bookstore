// utils\supabase\inventoryApi.ts

import { InventoryItem } from '@/interfaces/inventoryItem';
import { supabase } from './client';

// Fetch all inventory items from the database
export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase.from('inventory').select('*');
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
) => {
  const { data, error } = await supabase
    .from('inventory')
    .insert([{ book_id, quantity, available_quantity: quantity, price }]);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update the quantity of an existing book in the inventory
export const updateInventoryQuantity = async (id: string, quantity: number) => {
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity })
    .match({ id });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update the price of an existing book in the inventory
export const updateBookPrice = async (id: string, price: number) => {
  const { data, error } = await supabase
    .from('inventory')
    .update({ price })
    .match({ id });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};
