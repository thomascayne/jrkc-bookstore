import { and, count, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { verifyPassword } from '@/auth/password';
import { createSession } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { authenticationAttempts, users } from '@/db/schema';

const maximumFailures = 5;
const rateLimitWindowMilliseconds = 15 * 60 * 1_000;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonObject(request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const database = getDatabase();
    const [failureCount] = await database
      .select({ value: count() })
      .from(authenticationAttempts)
      .where(
        and(
          eq(authenticationAttempts.email, email),
          eq(authenticationAttempts.succeeded, false),
          gt(
            authenticationAttempts.createdAt,
            new Date(Date.now() - rateLimitWindowMilliseconds),
          ),
        ),
      );

    if (failureCount.value >= maximumFailures) {
      return jsonError('Too many sign-in attempts. Try again later.', 429);
    }

    const [user] = await database
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isDeleted, false)))
      .limit(1);
    const passwordMatches = user
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      await database.insert(authenticationAttempts).values({
        email,
        ipAddress:
          request.headers.get('cf-connecting-ip') ??
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          null,
      });
      return jsonError('Incorrect email or password.', 401);
    }

    await database
      .delete(authenticationAttempts)
      .where(eq(authenticationAttempts.email, email));
    await createSession(user.id, request.headers.get('user-agent'));

    return NextResponse.json({ ok: true });
  } catch {
    return jsonError('Unable to sign in. Please try again.', 500);
  }
}
