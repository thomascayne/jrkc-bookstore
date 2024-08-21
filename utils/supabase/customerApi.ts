<<<<<<< HEAD
// Directory: /utils/supabase/customerApi.ts
// API functions for handling customer data, purchase history, and recommendations using .rpc() to bypass authentication

import { supabase } from '@/utils/supabase/client'; // Import the initialized Supabase client

// Fetch all customers using the rls_fetch_customers RPC function
export const fetchCustomers = async (): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_customers'); // Call the custom RPC function to fetch customers

  // Check if there's an error fetching data
=======
// utils/supabase/customerApi.ts
import { supabase } from '@/utils/supabase/client';

// Fetch customer list using an RPC function
export const fetchCustomers = async () => {
  const { data, error } = await supabase.rpc('rls_fetch_customers');
>>>>>>> c6ce44c (Customer info partially working)
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
<<<<<<< HEAD

  // Return customer data
  return data || [];
};

// Fetch customer details by ID using the rls_fetch_customer_details RPC function
export const fetchCustomerDetails = async (customerId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('rls_fetch_customer_details', {
    p_customer_id: customerId, // Pass the customer ID as a parameter to the RPC function
  });

  // Check if there's an error fetching data
  if (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }

  // Return the customer details
  return data;
};

// Fetch customer recommendations using the rls_fetch_customer_recommendations RPC function
export const fetchRecommendations = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_customer_recommendations', {
    p_customer_id: customerId, // Pass the customer ID as a parameter to fetch recommendations
  });

  // Check if there's an error fetching data
=======
  return data || [];
};

// Fetch customer details using RPC
export const fetchCustomerDetails = async (customerId: string) => {
  const { data, error } = await supabase.rpc('get_customer_details', { customer_id: customerId });
  if (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
  return data || {};
};

// Update customer information
export const updateCustomerInfo = async (customerId: string, updatedData: any) => {
  const { data, error } = await supabase.rpc('update_customer_info', {
    customer_id: customerId,
    ...updatedData,
  });
  if (error) {
    console.error('Error updating customer info:', error);
    throw error;
  }
  return data;
};

// Fetch customer recommendations
export const fetchRecommendations = async (customerId: string) => {
  const { data, error } = await supabase.rpc('get_customer_recommendations', { customer_id: customerId });
>>>>>>> c6ce44c (Customer info partially working)
  if (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
<<<<<<< HEAD

  // Return the recommendations
  return data || [];
};

// Fetch customer purchase history using the rls_fetch_purchase_history RPC function
export const fetchPurchaseHistory = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_purchase_history', {
    p_customer_id: customerId, // Pass the customer ID to fetch purchase history
  });

  // Check if there's an error fetching data
=======
  return data || [];
};

// Fetch customer purchase history
export const fetchPurchaseHistory = async (customerId: string) => {
  const { data, error } = await supabase.rpc('get_purchase_history', { customer_id: customerId });
>>>>>>> c6ce44c (Customer info partially working)
  if (error) {
    console.error('Error fetching purchase history:', error);
    throw error;
  }
<<<<<<< HEAD

  // Return the purchase history
=======
>>>>>>> c6ce44c (Customer info partially working)
  return data || [];
};
