import {
  getDropdownRoles,
  getRoleColor,
  getRoleLabel,
  Role,
} from "@/utils/roles";
// app/components/RoleSwitcher.tsx
import { createClient } from "@/utils/supabase/client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
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
    const supabase = createClient();
    if (key === "stop") {
      await supabase
        .from("profiles")
        .update({ emulating_role: null })
        .eq("id", user?.id);

      onRoleChange(null);
    } else {
      await supabase
        .from("profiles")
        .update({ emulating_role: key })
        .eq("id", user?.id);
      onRoleChange(key as Role);
    }
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
