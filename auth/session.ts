import { createHash, randomBytes } from 'node:crypto';

import { and, eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

import type { AppUser } from '@/auth/types';
import { getDatabase } from '@/db/client';
import { profiles, sessions, userRoles, users } from '@/db/schema';
import { ROLES, type Role } from '@/utils/roles';

const sessionCookieName = 'jrkc_session';
const sessionLifetimeMilliseconds = 30 * 24 * 60 * 60 * 1_000;

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('base64url');
}

function mapUser(user: typeof users.$inferSelect, roles: Role[]): AppUser {
  return {
    app_metadata: { roles: roles.length > 0 ? roles : [ROLES.USER] },
    created_at: user.createdAt.toISOString(),
    email: user.email,
    id: user.id,
    user_metadata: {},
  };
}

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionLifetimeMilliseconds);

  await getDatabase().insert(sessions).values({
    expiresAt,
    tokenHash: hashSessionToken(token),
    userAgent: userAgent?.slice(0, 512) || null,
    userId,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    expires: expiresAt,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await getDatabase()
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }

  const database = getDatabase();
  const [sessionRecord] = await database
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.isDeleted, false),
      ),
    )
    .limit(1);

  if (!sessionRecord) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  const assignedRoles = await database
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, sessionRecord.user.id));

  return mapUser(
    sessionRecord.user,
    assignedRoles.map(({ role }) => role),
  );
}

export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [profile] = await getDatabase()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return { profile: profile ?? null, user };
}
