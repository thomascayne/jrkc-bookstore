// contexts/UserProfileContext.tsx
"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/interfaces/UserProfile';
import { createClient } from '@/utils/supabase/client';

interface UserProfileContextType {
  error: unknown;
  isLoading: boolean;
  profile: UserProfile | null;
  session_token: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const userProfileData = useUserProfile();
  const [session_token, setSession_token] = React.useState<string | null>(null);

  useEffect(() => {
    const supabaseClient = createClient();

    const getSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      setSession_token(session?.access_token ?? null);
      
    };
    getSession();

  },[])

  const contextValue = React.useMemo(() => ({ ...userProfileData, session_token }), [session_token, userProfileData]);

  return (
    <UserProfileContext.Provider value={contextValue}>
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
      session_token: null,
    };
  }
  return context;
};


export const useSessionFromUserProfileContext = () => {
  const { session_token } = useUserProfileContext();
  return session_token;
};