// components/AuthNavbar.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { ROLES, Role } from '@/utils/roles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import CustomerNavbar from '@/components/navbars/CustomerNavbar';
import InventoryManagerNavbar from '@/components/navbars/InventoryManagerNavbar';
import SalesAssociateNavbar from '@/components/navbars/SalesAssociateNavbar';
import SystemAdminNavbar from '@/components/navbars/SystemAdminNavbar';
import NavbarLoadingSkeleton from '@/components/navbars/NavbarLoadingSkeleton';

interface AuthNavbarProps {
  initialUser: User | null;
}
interface AuthState {
  user: User | null;
  userRoles: Role[];
  loading: boolean;
  emulatedRole: Role | null;
}

function useSupabaseClient() {
  return useMemo(() => createClient(), []);
}

// Custom hook for debounced loading state
function useDebouncedLoading(loading: boolean, delay: number) {
  const [debouncedLoading, setDebouncedLoading] = useState(loading);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLoading(loading), delay);
    return () => clearTimeout(timer);
  }, [loading, delay]);

  return debouncedLoading;
}


export default function AuthNavbar({ initialUser }: AuthNavbarProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initialUser,
    userRoles: initialUser?.app_metadata?.roles || [ROLES.USER],
    loading: !!initialUser,
    emulatedRole: null,
  });

  const debouncedLoading = useDebouncedLoading(authState.loading, 300);

  const supabase = useSupabaseClient();

  const fetchUserData = useCallback(async (user: User | null) => {
    if (!user) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        userRoles: [ROLES.USER],
        emulatedRole: null,
        loading: false,
      }));
      return;
    }

    try {
      const roles = user.app_metadata?.roles || [ROLES.USER];
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('emulating_role')
        .eq('id', user.id)
        .single();

      setAuthState(prev => ({
        ...prev,
        user,
        userRoles: roles as Role[],
        emulatedRole: profileData?.emulating_role || null,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // Only fetch initial user data if there's an initial user
    if (initialUser) {
      fetchUserData(initialUser);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        const user = session?.user ?? null;
        setAuthState(prev => ({ ...prev, user, loading: true }));
        fetchUserData(user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialUser, fetchUserData]);

  
  const handleRoleChange = (role: Role | null) => {
    setAuthState((prev) => ({ ...prev, emulatedRole: role }));
  };

  const activeRole = useMemo(() => {
    const highestRole = authState.userRoles.reduce((highest, role) => {
      const roleOrder = [
        ROLES.ADMIN,
        ROLES.STORE_MANAGER,
        ROLES.INVENTORY_MANAGER,
        ROLES.SALES_ASSOCIATE,
        ROLES.USER,
      ];
      return roleOrder.indexOf(role as Role) <
        roleOrder.indexOf(highest as Role)
        ? role
        : highest;
    }, ROLES.USER);

    return authState.emulatedRole || highestRole;
  }, [authState.userRoles, authState.emulatedRole]);

  const navbarProps = useMemo(
    () => ({
      user: authState.user,
      isAdmin: activeRole === ROLES.ADMIN,
      emulatedRole: authState.emulatedRole,
      onRoleChange: handleRoleChange,
    }),
    [authState.user, activeRole, authState.emulatedRole],
  );
  
  // Use a minimum display time for the loading state
  useEffect(() => {
    if (debouncedLoading) {
      const timer = setTimeout(() => {
        setAuthState(prev => ({ ...prev, loading: false }));
      }, 500); // Minimum display time of 500ms
      return () => clearTimeout(timer);
    }
  }, [debouncedLoading]);

  if (debouncedLoading) {
    return <NavbarLoadingSkeleton />;
  }

  switch (activeRole) {
    case ROLES.ADMIN:
      return <SystemAdminNavbar {...navbarProps} />;
    case ROLES.INVENTORY_MANAGER:
      return <InventoryManagerNavbar {...navbarProps} />;
    case ROLES.SALES_ASSOCIATE:
      return <SalesAssociateNavbar {...navbarProps} />;
    case ROLES.USER:
    default:
      return <CustomerNavbar {...navbarProps} />;
  }
}
