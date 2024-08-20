// Directory: /utils/supabase/customerApi.ts

import { supabaseClient } from './serviceClient';

// Fetch all customers from the 'customers' table
export const fetchAllCustomers = async () => {
  const { data, error } = await supabaseClient.from('customers').select('*');
  if (error) throw error;
  return data;
};

// Fetch details for a specific customer by customerId
export const fetchCustomerDetails = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
  if (error) throw error;
  return data;
};

// Fetch recommendations for a specific customer by customerId
export const fetchRecommendations = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .from('recommendations')
    .select('*')
    .eq('customer_id', customerId);
  
  if (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }

  return data;
};
