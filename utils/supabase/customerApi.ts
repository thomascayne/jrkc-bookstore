// utils/api/customerApi.ts

import { supabaseServer } from '@/utils/supabase/serviceClient';

export async function fetchCustomersServerSide() {
  const { data, error } = await supabaseServer
    .from('customers')
    .select('*');

  if (error) {
    console.error('Error fetching customers:', error);
    return null;
  }

  return data;
}