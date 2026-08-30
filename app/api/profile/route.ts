import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { assertSameOrigin, jsonError, readJsonObject } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { profileUpdates, serializeProfile } from '@/db/profile';
import { profiles } from '@/db/schema';
import { ROLES, type Role } from '@/utils/roles';

const emulatableRoles = new Set<Role>([
  ROLES.STORE_MANAGER,
  ROLES.INVENTORY_MANAGER,
  ROLES.SALES_ASSOCIATE,
  ROLES.USER,
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError('Authentication required.', 401);
  }

  const [profile] = await getDatabase()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return NextResponse.json({
    profile: profile ? serializeProfile(profile) : null,
    user,
  });
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) {
      return jsonError('Authentication required.', 401);
    }

    const body = await readJsonObject(request);
    const updates = profileUpdates(body);

    if ('emulating_role' in body) {
      if (!user.app_metadata.roles.includes(ROLES.ADMIN)) {
        return jsonError('Administrator access required.', 403);
      }

      const requestedRole = body.emulating_role;
      if (
        requestedRole !== null &&
        (typeof requestedRole !== 'string' ||
          !emulatableRoles.has(requestedRole as Role))
      ) {
        return jsonError('Invalid emulated role.', 400);
      }

      updates.emulatingRole = requestedRole;
    }

    const [profile] = await getDatabase()
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, user.id))
      .returning();

    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch {
    return jsonError('Unable to update profile. Please try again.', 500);
  }
}
