import { count, desc, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { jsonError } from '@/auth/http';
import { getCurrentUser } from '@/auth/session';
import { getDatabase } from '@/db/client';
import { users } from '@/db/schema';
import { ROLES } from '@/utils/roles';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.app_metadata.roles.includes(ROLES.ADMIN)) {
    return jsonError('Administrator access required.', 403);
  }

  const database = getDatabase();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const [total] = await database
    .select({ value: count() })
    .from(users)
    .where(eq(users.isDeleted, false));
  const [newThisMonth] = await database
    .select({ value: count() })
    .from(users)
    .where(gt(users.createdAt, monthStart));
  const recentUsers = await database
    .select({ createdAt: users.createdAt, email: users.email, id: users.id })
    .from(users)
    .where(eq(users.isDeleted, false))
    .orderBy(desc(users.createdAt))
    .limit(5);

  return NextResponse.json({
    newThisMonth: newThisMonth.value,
    recentUsers: recentUsers.map((user) => ({
      created_at: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
    })),
    total: total.value,
  });
}
