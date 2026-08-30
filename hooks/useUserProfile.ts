import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { AppSession, AppUser } from '@/auth/types';
import type { UserProfile } from '@/interfaces/UserProfile';
import { apiRequest } from '@/utils/apiClient';

interface UserProfileData {
  profile: UserProfile | null;
  session: AppSession | null;
  user: AppUser | null;
}

export function useUserProfile() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery<UserProfileData, Error>({
    queryFn: async () => {
      const response = await apiRequest<{
        profile: UserProfile | null;
        user: AppUser | null;
      }>('/api/auth/session');

      return {
        profile: response.profile,
        session: response.user ? { user: response.user } : null,
        user: response.user,
      };
    },
    queryKey: ['userProfile'],
    staleTime: 1000 * 60 * 5,
  });

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!data?.user) {
      throw new Error('No user logged in.');
    }

    const { profile } = await apiRequest<{ profile: UserProfile }>(
      '/api/profile',
      {
        body: JSON.stringify(updates),
        method: 'PATCH',
      },
    );

    queryClient.setQueryData<UserProfileData>(['userProfile'], (current) => ({
      profile,
      session: current?.session ?? null,
      user: current?.user ?? null,
    }));
    return profile;
  };

  const signOut = async () => {
    await apiRequest<{ ok: true }>('/api/auth/signout', { method: 'POST' });
    queryClient.setQueryData(['userProfile'], null);
    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  return {
    access_token: data?.user ? 'cookie-session' : null,
    error,
    isLoading,
    profile: data?.profile ?? null,
    session: data?.session ?? null,
    signOut,
    updateProfile,
  };
}
