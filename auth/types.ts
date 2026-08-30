import type { Role } from '@/utils/roles';

export interface AppUser {
  app_metadata: { roles: Role[] };
  created_at: string;
  email: string;
  id: string;
  user_metadata: Record<string, unknown>;
}

export interface AppSession {
  user: AppUser;
}
