import { createBrowserClient } from '@supabase/ssr';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function requireSupabaseEnvironment() {
  if (!supabaseAnonKey || !supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.',
    );
  }

  return { supabaseAnonKey, supabaseUrl };
}

export const createClient = () => {
  const environment = requireSupabaseEnvironment();

  return createBrowserClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );
};

export const supabase = createClient();
