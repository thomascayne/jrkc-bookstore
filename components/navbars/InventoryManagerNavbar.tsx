// components/InventoryManagerNavbar.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
} from '@nextui-org/react';
import { User } from '@supabase/supabase-js';
import {
  FaBoxes,
  FaFileInvoice,
  FaTruck,
  FaChartBar,
  FaRegUser,
} from 'react-icons/fa';
import { VscSignIn, VscSignOut } from 'react-icons/vsc';
import ThemeSwitch, { Theme } from '@/components/ThemeSwitcher';
import AppLogo from '@/components/AppLogo';
import { getRoleColor, Role, ROLES } from '@/utils/roles';
import RoleSwitcher from '@/components/RoleSwitcher';
import useSignOut from '@/hooks/useSignOut';
import { useRouter } from 'next/navigation';

interface InventoryManagerNavbarProps {
  emulatedRole: Role | null;
  isAdmin: boolean;
  onRoleChange: (role: Role | null) => void;
  user: User | null;
}

function InventoryManagerNavbar({
  emulatedRole,
  isAdmin,
  onRoleChange,
  user,
}: InventoryManagerNavbarProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const signOut = useSignOut();
  const router = useRouter();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setTheme('dark');
    }
  }, []);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  const menuItems = [
    { item: 'Inventory', icon: <FaBoxes />, href: '/admin/inventory' },
    {
      item: 'Purchase Orders',
      icon: <FaFileInvoice />,
      href: '/purchase-orders',
    },
    { item: 'Suppliers', icon: <FaTruck />, href: '/suppliers' },
    {
      item: 'Inventory Reports',
      icon: <FaChartBar />,
      href: '/inventory-reports',
    },
  ];

  const horizontalMenuItems = useMemo(
    () => [
      ...(user
        ? [
            {
              item: 'Profile',
              icon: <FaRegUser className="mr-1" />,
              href: '/profile',
            },
            {
              item: 'Sign Out',
              icon: <VscSignOut className="mr-1" />,
              href: '#',
              onClick: signOut,
            },
          ]
        : [
            {
              item: 'Sign In',
              icon: <VscSignIn className="mr-1" />,
              href: '/signin',
            },
          ]),
    ],
    [user, signOut],
  );

  const userMenuItems = useMemo(
    () => [
      ...(user
        ? [
            {
              item: 'Profile',
              icon: <FaRegUser />,
              href: '/profile',
            },
          ]
        : []),
      {
        item: user ? 'Sign Out' : 'Sign In',
        icon: user ? <VscSignOut /> : <VscSignIn />,
        href: user ? '#' : '/signin',
        onClick: user ? signOut : undefined,
      },
    ],
    [user, signOut],
  );

  const navbarStyle = useMemo(
    () => ({
      backgroundColor: getRoleColor(emulatedRole || ROLES.ADMIN),
      color: 'black',
      transition: 'background-color 0.3s ease',
    }),
    [emulatedRole],
  );

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

        {horizontalMenuItems.map((item, index) => (
          <NavbarItem key={`${item.item}-${index}`}>
            <Link
              href={item.href}
              onClick={item.onClick}
              className="hidden sm:flex py-2 px-3 no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
            >
              {item.icon}
              <span>{item.item}</span>
            </Link>
          </NavbarItem>
        ))}

        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
      </NavbarContent>

      <NavbarContent className="flex flex-col sm:hidden">
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

          {userMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.item}-${index}`}>
              <Link
                color="foreground"
                className="py-2 px-3 cursor-pointer flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
                href={item.href}
                size="lg"
                onClick={item.onClick}
              >
                {item.icon}
                <span className="ml-2">{item.item}</span>
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </NavbarContent>
    </Navbar>
  );
}

export default React.memo(InventoryManagerNavbar);
