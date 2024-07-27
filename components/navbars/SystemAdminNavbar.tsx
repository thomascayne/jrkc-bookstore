// components/SystemAdminNavbar.tsx
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
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { MdDashboard, MdSettings, MdSecurity } from "react-icons/md";
import {
  FaUsers,
  FaCog,
  FaChartBar,
  FaRegUser,
  FaCashRegister,
  FaAddressBook,
  FaSearch,
  FaBoxes,
  FaFileInvoice,
  FaTruck,
  FaPlug,
  FaClipboardList,
  FaChevronDown,
} from "react-icons/fa";
import { VscSignOut } from "react-icons/vsc";
import ThemeSwitch, { Theme } from "@/components/ThemeSwitcher";
import AppLogo from "@/components/AppLogo";
import { getRoleColor, Role, ROLES } from "@/utils/roles";
import RoleSwitcher from "@/components/RoleSwitcher";
import useSignOut from "@/hooks/useSignOut";

interface SystemAdminNavbarProps {
  emulatedRole: Role | null;
  isAdmin: boolean;
  onRoleChange: (role: Role | null) => void;
  user: User | null;
}

export default function SystemAdminNavbar({
  emulatedRole,
  isAdmin,
  onRoleChange,
  user,
}: SystemAdminNavbarProps) {
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
    // Store Manager items
    { item: "Dashboard", icon: <MdDashboard />, href: "/dashboard" },
    { item: "User Management", icon: <FaUsers />, href: "/users" },
    { item: "System Settings", icon: <FaCog />, href: "/settings" },
    { item: "Reports", icon: <FaChartBar />, href: "/reports" },
    { item: "separator", icon: null, href: "" },

    // Sales Associate items
    { item: "POS", icon: <FaCashRegister />, href: "/pos" },
    { item: "Customer Info", icon: <FaAddressBook />, href: "/customers" },
    { item: "Inventory Search", icon: <FaSearch />, href: "/inventory-search" },
    { item: "Top Sellers", icon: <FaChartBar />, href: "/top-sellers" },
    { item: "separator", icon: null, href: "" },

    // Inventory Manager items
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
    { item: "separator", icon: null, href: "" },

    // System Admin specific items
    {
      item: "System Integration",
      icon: <FaPlug />,
      href: "/system-integration",
    },
    {
      item: "Security Settings",
      icon: <MdSecurity />,
      href: "/security-settings",
    },
    { item: "Logs", icon: <FaClipboardList />, href: "/logs" },

    // Profile (common for all)
    { item: "Profile", icon: <FaRegUser />, href: "/profile" },
  ];

  const navbarStyle = {
    backgroundColor: getRoleColor(emulatedRole || ROLES.ADMIN),
    color: "black",
    gap: "0rem",
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

      <NavbarContent className="hidden lg:flex gap-4" justify="center">
        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="py-0 bg-transparent data-[hover=true]:bg-gray-200 rounded-none"
                startContent={<FaCog />}
                radius="sm"
                variant="light"
                endContent={<FaChevronDown />}
              >
                System
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="System functions"
            className="w-[340px]"
            itemClasses={{
              base: "gap-1",
            }}
          >
            {menuItems.slice(0, 4).map((menu) => (
              <DropdownItem
                key={menu.item}
                description={menu.item}
                startContent={menu.icon}
              >
                <Link href={menu.href}>{menu.item}</Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="py-0 bg-transparent data-[hover=true]:bg-gray-200 rounded-none"
                startContent={<FaCashRegister />}
                radius="sm"
                variant="light"
                endContent={<FaChevronDown />}
              >
                Sales
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Sales functions"
            className="w-[340px]"
            itemClasses={{
              base: "gap-4",
            }}
          >
            {menuItems.slice(4, 8).map((menu) => (
              <DropdownItem
                key={menu.item}
                description={menu.item}
                startContent={menu.icon}
              >
                <Link href={menu.href}>{menu.item}</Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="py-0 bg-transparent data-[hover=true]:bg-gray-200 rounded-none"
                startContent={<FaBoxes />}
                radius="sm"
                variant="light"
                endContent={<FaChevronDown />}
              >
                Inventory
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Inventory functions"
            className="w-[340px]"
            itemClasses={{
              base: "gap-4",
            }}
          >
            {menuItems.slice(8, 12).map((menu) => (
              <DropdownItem
                key={menu.item}
                description={menu.item}
                startContent={menu.icon}
              >
                <Link href={menu.href}>{menu.item}</Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="py-0 bg-transparent data-[hover=true]:bg-gray-200 rounded-none"
                startContent={<MdSettings />}
                radius="sm"
                variant="light"
                endContent={<FaChevronDown />}
              >
                Admin
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Admin functions"
            className="w-[340px]"
            itemClasses={{
              base: "gap-4",
            }}
          >
            {menuItems.slice(12).map((menu) => (
              <DropdownItem
                key={menu.item}
                description={menu.item}
                startContent={menu.icon}
              >
                <Link href={menu.href}>{menu.item}</Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
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
          className="lg:hidden"
        />
      </NavbarContent>

      <NavbarMenu className="gap-0">
        {menuItems.map((menu, index) => (
          <NavbarMenuItem key={`${menu.item}-${index}`}>
            {menu.item === "separator" ? (
              <hr className="w-full" />
            ) : (
              <Link
                color="foreground"
                className="py-2 px-3 transition-all ease-in-out duration-200 hover:bg-gray-200 w-full"
                href={menu.href}
                size="lg"
              >
                {menu.icon}
                <span className="ml-2">{menu.item}</span>
              </Link>
            )}
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
