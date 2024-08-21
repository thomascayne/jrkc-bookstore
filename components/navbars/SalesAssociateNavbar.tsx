// components/SalesAssociateNavbar.tsx
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
  Button,
} from '@nextui-org/react';
import { User } from '@supabase/supabase-js';
import {
  FaCashRegister,
  FaAddressBook,
  FaSearch,
  FaChartLine,
  FaRegUser,
} from 'react-icons/fa';
import { VscSignIn, VscSignOut } from 'react-icons/vsc';
import ThemeSwitch, { Theme } from '@/components/ThemeSwitcher';
import AppLogo from '@/components/AppLogo';
import { getRoleColor, Role, ROLES } from '@/utils/roles';
import RoleSwitcher from '@/components/RoleSwitcher';
import useSignOut from '@/hooks/useSignOut';
import { MdDashboard } from 'react-icons/md';

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
  const [theme, setTheme] = useState<Theme>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const signOut = useSignOut();

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

  const roleMenuItems = [
    { item: 'Dashboard', icon: <MdDashboard />, href: '/sales/dashboard' },
    { item: 'POS', icon: <FaCashRegister />, href: '/sales/point-of-sale' },
    { item: 'Customer Info', icon: <FaAddressBook />, href: '#' },
    { item: 'Inventory Search', icon: <FaSearch />, href: '#' },
    { item: 'Top Sellers', icon: <FaChartLine />, href: '#' },
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
  <div className="w-full flex items-center">
    <NavbarContent className="flex-grow-0 flex-shrink-0 mr-auto" justify='start'>
      <NavbarBrand>
        <Link
          href="/"
          className="border-transparent hover:border-current border-1 rounded-md p-1"
        >
          <AppLogo />
        </Link>
      </NavbarBrand>
    </NavbarContent>

    <NavbarContent className="hidden sm:flex flex-grow gap-2 !mx-auto" justify='center'>
      {roleMenuItems.map((item) => (
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

    <NavbarContent className="!ml-auto !flex-grow-0 flex items-center gap-0 !justify-end basis-0" justify="end" >
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

      <NavbarContent className="hidden sm:flex gap-0">
        {horizontalMenuItems.map((item, index) => (
          <NavbarItem key={`${item.item}-${index}`}>
            <Link
              href={item.href}
              onClick={item.onClick}
              className="flex py-2 px-3 no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center"
            >
              {item.icon}
              <span className="ml-1">{item.item}</span>
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden"
      />
    </NavbarContent>
  </div>

  <NavbarMenu className="mt-6 flex flex-col sm:hidden">
    {roleMenuItems.map((item, index) => (
      <NavbarMenuItem key={`${item.item}-${index}`}>
        <Link
          color="foreground"
          className="py-2 px-3 flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
          href={item.href}
          size="lg"
        >
          {item.icon}
          <span className="ml-2">{item.item}</span>
        </Link>
      </NavbarMenuItem>
    ))}

    <NavbarContent className="flex flex-col gap-0">
      {userMenuItems.map((item, index) => (
        <NavbarMenuItem key={`${item.item}-${index}`} className="w-full">
          <Link
            color="foreground"
            className="py-2 px-3 flex no-underline bg-transparent border-transparent transition-all ease-in-out duration-200 hover:bg-gray-200 items-center w-full"
            href={item.href}
            size="lg"
          >
            {item.icon}
            <span className="ml-2">{item.item}</span>
          </Link>
        </NavbarMenuItem>
      ))}
    </NavbarContent>
  </NavbarMenu>
</Navbar>
  );
}

export default React.memo(SalesAssociateNavbar);
