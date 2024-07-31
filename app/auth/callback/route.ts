// app/auth/callback/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {

      // Check if there's a pending email change
      const pendingEmail = data.user.user_metadata.pendingEmailChange;
      if (pendingEmail && pendingEmail === data.user.email) {

        // Email change confirmed, clear the pending change
        await supabase.auth.updateUser({
          data: { pendingEmailChange: null }
        });

        // Redirect to a confirmation page
        return NextResponse.redirect(`${origin}/email-change-confirmed`);
      }
    }
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}`);
}
