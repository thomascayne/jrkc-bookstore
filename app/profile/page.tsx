// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { AppUser as User } from "@/auth/types";
import { apiRequest } from "@/utils/apiClient";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileAddress from "@/app/profile/ProfileAddress";
import ProfileAdminPanel from "@/app/profile/ProfileAdminPanel";
import ProfilePersonalInformation from "@/app/profile/ProfilePersonalInformation";
import ProfileOrderHistory from "@/app/profile/ProfileOrderHistory";

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
  {
    component: ProfileOrderHistory,
    isVisible: (roles: string[]) => roles.length === 1 && roles[0] === "USER",
    key: "order-history",
    label: "Order History",
  }
];

export default function ProfilePage() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const activeTab = searchParams?.get("tab") || tabs[0].key;
  const router = useRouter();
  useEffect(() => {
    async function getUserAndRole() {
      try {
        const { user: authenticatedUser } = await apiRequest<{
          user: User | null;
        }>("/api/auth/session");

        if (!authenticatedUser) {
          router.push("/signin");
          return;
        }

        setUser(authenticatedUser);
        setUserRoles(authenticatedUser.app_metadata.roles);
      } catch {
        router.push("/signin");
      }
    }
    void getUserAndRole();
  }, [router]);

  const handleTabChange = (tab: string) => {
    router.push(`/profile?tab=${tab}`);
  };

  const visibleTabs = tabs.filter((tab) => tab.isVisible(userRoles));

  return (
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
  );
}
