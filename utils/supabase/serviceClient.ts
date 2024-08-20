import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded properly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if the environment variables are properly set
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key environment variables');
}

// Create a Supabase client using the Service Role Key for server-side operations
export const supabaseServer = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
