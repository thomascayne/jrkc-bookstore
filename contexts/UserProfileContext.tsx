// Directory: contexts/UserProfileContext.tsx

"use client"; // Mark this as a client component

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfile } from '@/interfaces/UserProfile';
import { supabaseClient } from '@/utils/supabase/serviceClient';

interface UserProfileContextProps {
  profile: UserProfile | null;
  sessionToken: string | null;
}

// Creating the context for user profile and session token
const UserProfileContext = createContext<UserProfileContextProps | undefined>(undefined);

/**
 * Provider component for user profile context
 * It provides the current user's profile and session token to the rest of the app.
 */
export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfileAndSession = async () => {
      try {
        // Fetch user details
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) {
          throw userError;
        }
        setProfile(userData.user as UserProfile);

        // Fetch session details
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }
        setSessionToken(sessionData.session?.access_token || null);
      } catch (error) {
        console.error('Failed to fetch user profile and session:', error);
      }
    };

    fetchUserProfileAndSession();
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, sessionToken }}>
      {children}
    </UserProfileContext.Provider>
  );
};

/**
 * Hook to use user profile context in functional components.
 */
export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
};
