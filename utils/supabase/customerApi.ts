// Directory: /utils/supabase/customerApi.ts
// API functions for handling customer data, purchase history, and recommendations using .rpc() to bypass authentication

import { supabase } from '@/utils/supabase/client';

// Fetch all customers using the rls_fetch_customers RPC function
export const fetchCustomers = async (): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_customers'); // Call the custom RPC function

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data || []; // Return customer data
};

// Fetch customer details by ID using the rls_fetch_customer_details RPC function
export const fetchCustomerDetails = async (customerId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('rls_fetch_customer_details', {
    p_customer_id: customerId, // Pass the customer ID as a parameter to the RPC function
  });

  if (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }

  return data; // Return the customer details
};

// Fetch customer recommendations using the rls_fetch_customer_recommendations RPC function
export const fetchRecommendations = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_customer_recommendations', {
    p_customer_id: customerId, // Pass the customer ID to fetch recommendations
  });

  if (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }

  return data || []; // Return recommendations
};

// Fetch customer purchase history using the rls_fetch_purchase_history RPC function
export const fetchPurchaseHistory = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_purchase_history', {
    p_customer_id: customerId, // Pass the customer ID to fetch purchase history
  });

  if (error) {
    console.error('Error fetching purchase history:', error);
    throw error;
  }

  return data || []; // Return purchase history
};
