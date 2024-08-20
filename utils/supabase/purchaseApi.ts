// Directory: /utils/supabase/purchaseApi.ts

import { supabaseClient } from './serviceClient';

export const fetchPurchaseHistory = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .from('purchases')
    .select('*')
    .eq('customer_id', customerId);

  if (error) throw error;
  return data;
};
