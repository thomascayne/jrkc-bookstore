// Directory: /utils/supabase/adminApi.ts

import { supabaseClient } from './serviceClient'; // Ensure this path is correct

export const fetchAdminDetails = async () => {
  const { data, error } = await supabaseClient.from('admins').select('*');
  if (error) throw error;
  return data;
};
