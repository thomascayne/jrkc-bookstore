// components/InventoryManagerNavbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import {
  FaBoxes,
  FaFileInvoice,
  FaTruck,
  FaChartBar,
  FaRegUser,
} from "react-icons/fa";
import { VscSignOut } from "react-icons/vsc";
import ThemeSwitch, { Theme } from "@/components/ThemeSwitcher";
import AppLogo from "@/components/AppLogo";
import { getRoleColor, Role, ROLES } from "@/utils/roles";
import RoleSwitcher from "@/components/RoleSwitcher";
import useSignOut from "@/hooks/useSignOut";

interface InventoryManagerNavbarProps {
  emulatedRole: Role | null;
  isAdmin: boolean;
  onRoleChange: (role: Role | null) => void;
  user: User | null;
}

export default function InventoryManagerNavbar({
  emulatedRole,
  isAdmin,
  onRoleChange,
  user,
}: InventoryManagerNavbarProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const signOut = useSignOut();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const menuItems = [
    { item: "Inventory", icon: <FaBoxes />, href: "/inventory" },
    {
      item: "Purchase Orders",
      icon: <FaFileInvoice />,
      href: "/purchase-orders",
    },
    { item: "Suppliers", icon: <FaTruck />, href: "/suppliers" },
    {
      item: "Inventory Reports",
      icon: <FaChartBar />,
      href: "/inventory-reports",
    },
    { item: "Profile", icon: <FaRegUser />, href: "/profile" },
  ];

  const navbarStyle = {
    backgroundColor: getRoleColor(emulatedRole || ROLES.ADMIN),
    color: "black",
    transition: "background-color 0.3s ease",
  };

  return (
    <Navbar
      className="py-1 fixed top-0 left-0 right-0 z-50 shadow-lg"
      isBordered
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
      position="static"
      style={isAdmin && emulatedRole ? navbarStyle : {}}
    >
      <NavbarContent>
        <NavbarBrand>
          <Link
            href="/"
            className="border-transparent hover:border-current border-1 rounded-md p-1"
          >
            <AppLogo />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.item}>
            <Link
              color="foreground"
              href={item.href}
              className="flex items-center border-transparent hover:border-current border-1 rounded-md p-1"
            >
              {item.icon}
              <span className="ml-2">{item.item}</span>
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <div className="gap-2">
          {isAdmin && (
            <RoleSwitcher
              user={user}
              emulatedRole={emulatedRole}
              onRoleChange={onRoleChange}
            />
          )}
        </div>
        <NavbarItem>
          <ThemeSwitch onThemeChange={handleThemeChange} initialTheme={theme} />
        </NavbarItem>
        <NavbarItem>
          <button
            onClick={signOut}
            className="py-2 px-3 flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
          >
            <VscSignOut className="mr-1" />
            <span>Sign Out</span>
          </button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.item}-${index}`}>
            <Link
              color="foreground"
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.icon}
              <span className="ml-2">{item.item}</span>
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <button
            onClick={signOut}
            className="py-2 px-3 flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
          >
            <VscSignOut className="mr-1" />
            <span>Sign Out</span>
          </button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
