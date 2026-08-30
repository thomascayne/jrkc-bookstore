'use client';

import {
  getDropdownRoles,
  getRoleColor,
  getRoleLabel,
  Role,
} from "@/utils/roles";
// app/components/RoleSwitcher.tsx
import { apiRequest } from "@/utils/apiClient";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import type { AppUser as User } from "@/auth/types";
import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { FaPlay, FaStop } from "react-icons/fa";

interface RoleSwitcherProps {
  user: User | null;
  emulatedRole: Role | null;
  onRoleChange: (role: Role | null) => void;
}

export default function RoleSwitcher({
  user,
  emulatedRole,
  onRoleChange,
}: RoleSwitcherProps) {
  const handleRoleChange = async (key: string) => {
    if (!user) return;

    const role = key === "stop" ? null : (key as Role);
    await apiRequest("/api/profile", {
      body: JSON.stringify({ emulating_role: role }),
      method: "PATCH",
    });
    onRoleChange(role);
  };

  const dropdownRoles = getDropdownRoles();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          className="dark:text-black"
          endContent={<FaChevronDown />}
        >
          {emulatedRole ? (
            <div className="flex items-center">
              <FaStop className="mr-1 text-red-500" />
              <span className="dark:text-black">
                {getRoleLabel(emulatedRole)}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <FaPlay className="mr-1 text-blue-500" />
              <span className="dark:text-black">Role</span>
            </div>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Role selection"
        onAction={(key) => handleRoleChange(key as Role | "stop")}
        items={[...dropdownRoles, { key: "stop", label: "Stop Emulating" }]}
      >
        {(item) => (
          <DropdownItem key={item.key} textValue={item.label}>
            <div
              style={{
                backgroundColor:
                  item.key !== "stop" ? getRoleColor(item.key as Role) : "red",
                color: item.key === "stop" ? "black" : "black",
                padding: "8px",
                borderRadius: "4px",
                width: "100%",
              }}
            >
              {item.label}
            </div>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
