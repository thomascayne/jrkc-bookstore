// utils/supabase/recommendationsApi.ts

import { supabaseClient } from '@/utils/supabase/serviceClient';

export const fetchRecommendations = async (customerId: string) => {
  const { data, error } = await supabaseClient
    .from('recommendations')
    .select('id, product_name, recommendation_reason')
    .eq('customer_id', customerId);

  if (error) {
    console.error('Error fetching recommendations:', error);
    return null;
  }

  return data;
};
    