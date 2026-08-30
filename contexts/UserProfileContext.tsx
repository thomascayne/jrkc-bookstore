'use client';

import React, { createContext, useContext } from 'react';

import { useUserProfile } from '@/hooks/useUserProfile';
import type { UserProfile } from '@/interfaces/UserProfile';

interface UserProfileContextType {
  error: unknown;
  isLoading: boolean;
  profile: UserProfile | null;
  session_token: string | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const userProfileData = useUserProfile();
  const contextValue = React.useMemo(
    () => ({
      ...userProfileData,
      session_token: userProfileData.session ? 'cookie-session' : null,
    }),
    [userProfileData],
  );

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === null) {
    throw new Error(
      'useUserProfileContext must be used within a UserProfileProvider',
    );
  }
  return context;
};

export const useSessionFromUserProfileContext = () => {
  const { session_token } = useUserProfileContext();
  return session_token;
};
