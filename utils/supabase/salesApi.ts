// Directory: /utils/supabase/salesApi.ts

import { supabase } from '@/utils/supabase/client';

/**
 * Fetch sales data for a specific date range using a custom RPC function in Supabase.
 * This function uses the .rpc protocol to bypass authentication policies.
 * 
 * @param {string} startDate - The start date for the sales data report (YYYY-MM-DD format).
 * @param {string} endDate - The end date for the sales data report (YYYY-MM-DD format).
 * @returns {Promise<any[]>} - Returns a promise that resolves to an array of sales data.
 * 
 * @example
 * const salesData = await fetchSalesData('2023-01-01', '2023-01-07');
 * console.log(salesData);
 */
export const fetchSalesData = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    // Call the custom Supabase RPC function 'fetch_sales_data'
    const { data, error } = await supabase.rpc('fetch_sales_data', {
      start_date: startDate, // Passing the start date as a parameter
      end_date: endDate      // Passing the end date as a parameter
    });

    if (error) {
      // If there is an error, log and throw it for proper error handling
      console.error('Error fetching sales data:', error.message);
      throw error;
    }

    // Return the fetched sales data
    return data || [];
  } catch (error) {
    // Log any unexpected errors that occur during the fetch operation
    console.error('Unexpected error fetching sales data:', error);
    throw error;
  }
};

/**
 * Fetch the total sales for a given period (e.g., daily, weekly) using a custom RPC function.
 * This can be used for any aggregated sales reporting.
 * 
 * @param {string} startDate - The start date for the aggregated sales report.
 * @param {string} endDate - The end date for the aggregated sales report.
 * @returns {Promise<any[]>} - Returns a promise that resolves to aggregated sales data.
 * 
 * @example
 * const totalSales = await fetchTotalSales('2023-01-01', '2023-01-31');
 * console.log(totalSales);
 */
export const fetchTotalSales = async (startDate: string, endDate: string): Promise<any[]> => {
  try {
    // Call the custom Supabase RPC function 'fetch_total_sales'
    const { data, error } = await supabase.rpc('fetch_total_sales', {
      start_date: startDate, // Passing the start date as a parameter
      end_date: endDate      // Passing the end date as a parameter
    });

    if (error) {
      // If there is an error, log and throw it for proper error handling
      console.error('Error fetching total sales:', error.message);
      throw error;
    }

    // Return the fetched aggregated sales data
    return data || [];
  } catch (error) {
    // Log any unexpected errors that occur during the fetch operation
    console.error('Unexpected error fetching total sales:', error);
    throw error;
  }
};
