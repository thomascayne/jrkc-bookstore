// utils/supabase/client.ts
// https://github.com/vercel/next.js/blob/canary/examples/with-supabase/utils/supabase/client.ts

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Environment variables for Supabase
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Client-side Supabase client
export const createClient = () => createPagesBrowserClient();
