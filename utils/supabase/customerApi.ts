// utils/supabase/customerApi.ts
import { supabase } from '@/utils/supabase/client';

// Fetch customer list using an RPC function
export const fetchCustomers = async () => {
  const { data, error } = await supabase.rpc('rls_fetch_customers');
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
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
  if (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
  return data || [];
};

// Fetch customer purchase history
export const fetchPurchaseHistory = async (customerId: string) => {
  const { data, error } = await supabase.rpc('get_purchase_history', { customer_id: customerId });
  if (error) {
    console.error('Error fetching purchase history:', error);
    throw error;
  }
  return data || [];
};
