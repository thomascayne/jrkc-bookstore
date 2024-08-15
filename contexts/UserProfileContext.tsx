// contexts/UserProfileContext.tsx
"use client";

import React, { createContext, useContext } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/interfaces/UserProfile';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: unknown;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const userProfileData = useUserProfile();

  return (
    <UserProfileContext.Provider value={userProfileData}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === null) {
    console.warn(
      'useUserProfileContext must be used within a UserProfileProvider',
    );
    return {
      profile: null,
      isLoading: false,
    };
  }
  return context;
};
