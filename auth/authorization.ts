import type { AppUser } from '@/auth/types';
import type { Role } from '@/utils/roles';

export function hasAnyRole(user: AppUser, allowedRoles: readonly Role[]) {
  return user.app_metadata.roles.some((role) => allowedRoles.includes(role));
}
