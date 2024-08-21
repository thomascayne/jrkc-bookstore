// Directory: /middleware.ts
import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res }); // Use both req and res
  
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect if not authenticated
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/'; // Redirect to homepage
    return NextResponse.redirect(url);
  }

  return res; // Allow the request if authenticated
}

export const config = {
  matcher: ['/sales/customer-info/:path*'], // Apply to protected routes
};
