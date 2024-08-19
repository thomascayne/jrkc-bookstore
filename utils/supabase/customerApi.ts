// utils/supabase/customerApi.ts

import { supabase } from './client';
import { UserProfile } from '@/interfaces/UserProfile';

export const fetchCustomers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from('customers').select('*');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data || [];
};
