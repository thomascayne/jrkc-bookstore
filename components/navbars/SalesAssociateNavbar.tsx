// components/SalesAssociateNavbar.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
} from "@nextui-org/react";
import { User } from "@supabase/supabase-js";
import {
  FaCashRegister,
  FaAddressBook,
  FaSearch,
  FaChartLine,
  FaRegUser,
} from "react-icons/fa";
import { VscSignOut } from "react-icons/vsc";
import ThemeSwitch, { Theme } from "@/components/ThemeSwitcher";
import AppLogo from "@/components/AppLogo";
import { getRoleColor, Role, ROLES } from "@/utils/roles";
import RoleSwitcher from "@/components/RoleSwitcher";
import useSignOut from "@/hooks/useSignOut";

interface SalesAssociateNavbarProps {
  emulatedRole: Role | null;
  isAdmin: boolean;
  onRoleChange: (role: Role | null) => void;
  user: User | null;
}

function SalesAssociateNavbar({
  emulatedRole,
  isAdmin,
  onRoleChange,
  user,
}: SalesAssociateNavbarProps) {
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

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const menuItems = [
    { item: "POS", icon: <FaCashRegister />, href: "/pos" },
    { item: "Customer Info", icon: <FaAddressBook />, href: "/customers" },
    { item: "Inventory Search", icon: <FaSearch />, href: "/inventory-search" },
    { item: "Top Sellers", icon: <FaChartLine />, href: "/top-sellers" },
    { item: "Profile", icon: <FaRegUser />, href: "/profile" },
  ];

  const navbarStyle = useMemo(() => ({
    backgroundColor: getRoleColor(emulatedRole || ROLES.ADMIN),
    color: "black",
    transition: "background-color 0.3s ease",
  }), [emulatedRole]);

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
        <NavbarItem>
          {isAdmin && (
            <RoleSwitcher
              user={user}
              emulatedRole={emulatedRole}
              onRoleChange={onRoleChange}
            />
          )}
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch onThemeChange={handleThemeChange} initialTheme={theme} />
        </NavbarItem>
        <NavbarItem>
          <button className="py-2 px-3 flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full">
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
          <Button
            onClick={signOut}
            type="button"
            variant="flat"
            startContent={<VscSignOut />}
            className="w-full justify-start"
          >
            Sign Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}

export default React.memo(SalesAssociateNavbar);
