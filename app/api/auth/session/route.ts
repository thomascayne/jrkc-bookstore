import { NextResponse } from 'next/server';

import { getCurrentUserWithProfile } from '@/auth/session';
import { serializeProfile } from '@/db/profile';

export async function GET() {
  const authenticated = await getCurrentUserWithProfile();
  return NextResponse.json(
    authenticated
      ? {
          profile: authenticated.profile
            ? serializeProfile(authenticated.profile)
            : null,
          user: authenticated.user,
        }
      : { profile: null, user: null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
