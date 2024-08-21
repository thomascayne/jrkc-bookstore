// Directory: /utils/supabase/salesApi.ts
// API functions for handling sales data using .rpc() to bypass authentication

import { supabase } from '@/utils/supabase/client';

// Fetch sales data for the given date range using a custom Supabase RPC function
export const fetchSalesData = async (startDate: string, endDate: string): Promise<any[]> => {
  const { data, error } = await supabase.rpc('rls_fetch_sales_data', {
    start_date: startDate, // Pass the start date
    end_date: endDate,     // Pass the end date
  });

  if (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }

  return data || [];
};
