import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { hashPassword, verifyPassword } from '@/auth/password';
import { deleteCurrentSession, getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { sessions, users } from '@/db/schema';

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError('Authentication required.', 401);
    const body = await readJsonObject(request);
    const database = getDatabase();

    if (typeof body.email === 'string') {
      const email = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonError('Invalid email address.', 400);
      }
      await database
        .update(users)
        .set({ email, updatedAt: new Date() })
        .where(eq(users.id, currentUser.id));
      return NextResponse.json({ email, ok: true });
    }

    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';
    if (newPassword.length < 8 || newPassword.length > 128) {
      return jsonError('New password does not meet requirements.', 400);
    }

    const [userRecord] = await database
      .select()
      .from(users)
      .where(eq(users.id, currentUser.id))
      .limit(1);
    if (
      !userRecord ||
      !(await verifyPassword(currentPassword, userRecord.passwordHash))
    ) {
      return jsonError('Current password is incorrect.', 401);
    }

    const passwordHash = await hashPassword(newPassword);
    await database.transaction(async (transaction) => {
      await transaction
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.id));
      await transaction
        .delete(sessions)
        .where(eq(sessions.userId, currentUser.id));
    });
    await deleteCurrentSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return jsonError('That email address is already in use.', 409);
    }
    return jsonError('Unable to update account.', 500);
  }
}
