// Directory: /utils/supabase/serviceClient.ts

// Supabase client setup

import { createClient } from '@supabase/supabase-js';

// Create a singleton Supabase client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
