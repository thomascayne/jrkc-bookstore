// utils\supabase\client.ts
// https://github.com/vercel/next.js/blob/canary/examples/with-supabase/utils/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";
// Create a Supabase client for browser-side operations. This can be used to interact with Supabase from the client-side. It is very importatnt
// that you enable RLS on your tables to ensure that your client-side operations are secure. Ideally, you would only enablle Read access on your client-side operations.

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
