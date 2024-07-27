// components/AuthNavbar.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { ROLES, Role } from "@/utils/roles";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import CustomerNavbar from "@/components/navbars/CustomerNavbar";
import InventoryManagerNavbar from "@/components/navbars/InventoryManagerNavbar";
import SalesAssociateNavbar from "@/components/navbars/SalesAssociateNavbar";
import StoreManagerNavbar from "@/components/navbars/StoreManagerNavbar";
import SystemAdminNavbar from "@/components/navbars/SystemAdminNavbar";
import NavbarLoadingSkeleton from "@/components/navbars/NavbarLoadingSkeleton";

interface AuthNavbarProps {
  initialUser: User | null;
}

export default function AuthNavbar({ initialUser }: AuthNavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userRoles, setUserRoles] = useState<Role[]>([ROLES.USER]);
  const [loading, setLoading] = useState(true);
  const [emulatedRole, setEmulatedRole] = useState<Role | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      setLoading(true);

      if (!user) {
        setUserRoles([ROLES.USER]);
        setEmulatedRole(null);
        setLoading(false);
        return;
      }

      // Fetch user roles from the database
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase
        .from("user_roles")
        .select("roles")
        .eq("id", user.id)
        .maybeSingle();

      if (userError) {
        // good place to log
        console.error("Error fetching user role:", userError);
      }

      if (userData && userData.roles) {
        setUserRoles(userData.roles);
      } else {
        // Default role if no roles are set
        setUserRoles([ROLES.USER]);
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("emulating_role")
        .eq("id", user.id)
        .single();

      if (profileData && profileData.emulating_role) {
        setEmulatedRole(profileData.emulating_role as Role);
      } else {
        setEmulatedRole(null);
      }

      setLoading(false);
    }

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRoleChange = (role: Role | null) => {
    setEmulatedRole(role);
  };

  if (loading) {
    return <NavbarLoadingSkeleton />;
  }

  const highestRole = userRoles.reduce((highest, role) => {
    const roleOrder = [
      ROLES.ADMIN,
      ROLES.STORE_MANAGER,
      ROLES.INVENTORY_MANAGER,
      ROLES.SALES_ASSOCIATE,
      ROLES.USER,
    ];
    return roleOrder.indexOf(role as Role) < roleOrder.indexOf(highest as Role)
      ? role
      : highest;
  }, ROLES.USER);

  const isAdmin = highestRole === ROLES.ADMIN;
  const activeRole = emulatedRole || highestRole;

  const navbarProps = {
    user,
    isAdmin,
    emulatedRole,
    onRoleChange: handleRoleChange,
  };

  switch (activeRole) {
    case ROLES.ADMIN:
      return <SystemAdminNavbar {...navbarProps} />;
    case ROLES.STORE_MANAGER:
      return <StoreManagerNavbar {...navbarProps} />;
    case ROLES.INVENTORY_MANAGER:
      return <InventoryManagerNavbar {...navbarProps} />;
    case ROLES.SALES_ASSOCIATE:
      return <SalesAssociateNavbar {...navbarProps} />;
    case ROLES.USER:
    default:
      return <CustomerNavbar {...navbarProps} />;
  }
}
