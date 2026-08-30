import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { hashPassword } from '@/auth/password';
import { createSession } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { carts, profiles, userRoles, users } from '@/db/schema';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPassword(password: string) {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password) &&
    !/\s/.test(password)
  );
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonObject(request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!emailPattern.test(email) || !validPassword(password)) {
      return jsonError('Enter a valid email and a secure password.', 400);
    }

    const passwordHash = await hashPassword(password);
    const userId = await getDatabase().transaction(async (transaction) => {
      const [createdUser] = await transaction
        .insert(users)
        .values({ email, emailVerifiedAt: new Date(), passwordHash })
        .returning({ id: users.id });

      await transaction.insert(profiles).values({ userId: createdUser.id });
      await transaction.insert(userRoles).values({ userId: createdUser.id });
      await transaction.insert(carts).values({ userId: createdUser.id });
      return createdUser.id;
    });

    await createSession(userId, request.headers.get('user-agent'));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return jsonError('Unable to create account with those credentials.', 409);
    }

    return jsonError('Unable to create account. Please try again.', 500);
  }
}
