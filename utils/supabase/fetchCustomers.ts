import { supabaseClient } from '@/utils/supabase/serviceClient';

/**
 * Fetch a list of all customers for display in the CRM.
 * This function is accessible by admins, sales associates, and super users.
 * @returns An array of customer objects containing relevant data.
 */
export const fetchAllCustomers = async () => {
  const { data, error } = await supabaseClient
    .from('customers')
    .select('id, name, email, phone, address, created_at');

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch customer details by ID.
 * This function is used when viewing or editing a specific customer's profile.
 * @param customerId - The ID of the customer to fetch.
 * @returns The customer object with detailed information.
 */
export const fetchCustomerById = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .from('customers')
    .select('id, name, email, phone, address, created_at')
    .eq('id', customerId)
    .single();

  if (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }

  return data;
};

/**
 * Search for customers by name, email, or phone.
 * This function allows sales associates or admins to quickly find a customer using search terms.
 * @param query - The search term to find customers.
 * @returns An array of customers matching the search term.
 */
export const searchCustomers = async (query: string) => {
  const { data, error } = await supabaseClient
    .from('customers')
    .select('id, name, email, phone, address')
    .ilike('name', `%${query}%`)
    .or(`email.ilike.%${query}%`)
    .or(`phone.ilike.%${query}%`);

  if (error) {
    console.error('Error searching for customers:', error);
    throw error;
  }

  return data;
};

/**
 * Fetch a summary of customer activity for dashboards.
 * This could include things like recent purchases, total spend, etc.
 * @param customerId - The ID of the customer.
 * @returns A summary of customer activity.
 */
export const fetchCustomerActivitySummary = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .rpc('get_customer_activity_summary', { p_customer_id: customerId });

  if (error) {
    console.error('Error fetching customer activity summary:', error);
    throw error;
  }

  return data;
};
