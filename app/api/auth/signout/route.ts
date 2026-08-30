import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError } from '@/auth/http';
import { deleteCurrentSession } from '@/auth/session';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await deleteCurrentSession();
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError('Unable to sign out. Please try again.', 500);
  }
}
