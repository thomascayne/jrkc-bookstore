// utils/supabase/fetchCustomers.ts

import { supabaseServer } from '@/utils/supabase/serviceClient';

export async function fetchCustomersServerSide() {
  console.log('Fetching customers from Supabase...'); // Debugging log
  const { data, error } = await supabaseServer
    .from('customers')
    .select('*');

  if (error) {
    console.error('Error fetching customers:', error.message);
    return null;
  }

  console.log('Customer data fetched:', data); // Debugging log
  return data;
}
