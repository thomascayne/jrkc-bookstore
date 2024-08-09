// app/profile/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileAddress from "@/app/profile/ProfileAddress";
import ProfileAdminPanel from "@/app/profile/ProfileAdminPanel";
import AuthNavbar from "@/components/AuthNavbar";
import ProfilePersonalInformation from "@/app/profile/ProfilePersonalInformation";

interface Tab {
  component: React.ComponentType<{ user: User | null }>;
  isVisible: (role: string[]) => boolean;
  key: string;
  label: string;
}

const tabs: Tab[] = [
  {
    component: ProfilePersonalInformation,
    isVisible: (roles: string[]) => roles.includes("USER"),
    key: "personal-information",
    label: "Personal Information",
  },
  {
    component: ProfileAddress,
    isVisible: (roles: string[]) => roles.includes("USER"), // Always visible
    key: "address",
    label: "Address",
  },
  {
    component: ProfileAdminPanel,
    isVisible: (roles: string[]) => roles.includes("ADMIN"), // Only visible to admins === "ADMIN",
    key: "admin",
    label: "Admin Panel",
  },
];

export default function ProfilePage() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const activeTab = searchParams.get("tab") || tabs[0].key;
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUserAndRole() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log("User is not authenticated");
          return;
        }

        setUser(session.user);

        if (session.user) {
          const { data: userData, error: userError } = await supabase
            .from("user_roles")
            .select("roles")
            .eq("id", session.user.id)
            .maybeSingle();

          if (userError) {
            console.error("Error fetching user role:", userError);
          }

          // Check if user is an admin
          // Set user role
          if (userData && userData.roles) {
            setUserRoles(userData.roles);
          } else {
            setUserRoles(["USER"]); // Default role if no roles are set
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
    getUserAndRole();
  }, [supabase]);

  const handleTabChange = (tab: string) => {
    router.push(`/profile?tab=${tab}`);
  };

  const visibleTabs = tabs.filter((tab) => tab.isVisible(userRoles));

  return (
    <>
      <AuthNavbar initialUser={user} />

      <div className="profile-page-container container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="flex mb-4 border-b border-gray-200 dark:border-gray-600 pb-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`mx-2 p-2 ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:text-black"
              }`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {visibleTabs.map(
          (tab) =>
            activeTab === tab.key && <tab.component key={tab.key} user={user} />
        )}
      </div>
    </>
  );
}
