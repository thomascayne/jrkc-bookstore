// components/CustomerNavbar.tsx
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
} from '@nextui-org/react';
import { BiCategory } from 'react-icons/bi';
import { FaRegUser } from 'react-icons/fa';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { RiShoppingCart2Line } from 'react-icons/ri';
import { VscSignIn, VscSignOut } from 'react-icons/vsc';
import AppLogo from '@/components/AppLogo';
import ThemeSwitch, { Theme } from '@/components/ThemeSwitcher';
import { Role, ROLES, getRoleColor } from '@/utils/roles';
import RoleSwitcher from '@/components/RoleSwitcher';
import { FaChevronDown } from 'react-icons/fa';
import useSignOut from '@/hooks/useSignOut';
import { fetchBookCategories } from '@/utils/bookCategoriesApi';
import { BookCategory } from '@/interfaces/BookCategory';
import CartIcon from '@/components/CartIcon';
import { useSidePanel } from '@/contexts/SidePanelContext';
import CartContent from '@/components/CartContent';
import { useStore } from '@tanstack/react-store';
import { cartStore, getCartItemCount } from '@/stores/cartStore';
import SearchBar from '@/components/SearchBar';

interface CustomerNavbarProps {
  emulatedRole: Role | null;
  isAdmin: boolean;
  onRoleChange: (role: Role | null) => void;
  user: User | null;
}

function CustomerNavbar({
  emulatedRole,
  isAdmin,
  onRoleChange,
  user,
}: CustomerNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const { openRightPanel } = useSidePanel();
  const currentPath = usePathname();
  const router = useRouter();
  const signOut = useSignOut();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_URL;
  const url = `${apiUrl}?q=subject:fiction&orderBy=relevance&maxResults=40&key=${apiKey}`;

  const [bookCategories, setBookCategories] = useState<BookCategory[]>([]);
  const cartItemCount = useStore(cartStore, getCartItemCount);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await fetchBookCategories();
        setBookCategories(categories);
      } catch (error) {
        console.error('Error fetching book categories:', error);
      }
    };

    fetchCategories();
  }, []);

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

  const handleCategorySelect = async (key: string, label: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      localStorage.setItem('categoryBooks', JSON.stringify(data.items));
      router.push(
        `/category/${encodeURIComponent(key)}?label=${encodeURIComponent(
          label,
        )}`,
      );
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const userMenuItems = useMemo(
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

  const menuItems = useMemo(
    () => [{ item: 'Cart', icon: <RiShoppingCart2Line />, special: true }],
    [],
  );

  const navbarStyle = useMemo(
    () => ({
      backgroundColor: getRoleColor(emulatedRole || ROLES.ADMIN),
      color: 'black',
      transition: 'background-color 0.3s ease',
    }),
    [emulatedRole],
  );

  /**
   * Handles the click event on the cart button.
   * When the cart is empty, it redirects to the cart page.
   * or it opens the shopping cart panel.
   *
   * @return {void} No return value.
   */
  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (cartItemCount === 0) {
      router.push('/cart');
    } else {
      if (currentPath && currentPath !== '/cart') {
        openRightPanel(
          <CartContent currentPath={currentPath} />,
          'w-full sm:w-[400px] md:w-[480px] lg:w-[560px] xl:w-[640px]',
          false,
        );
      }
    }
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Navbar
      className="fixed top-0 left-0 right-0 w-full z-50 shadow-lg"
      isBordered
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
      position="static"
      style={isAdmin && emulatedRole ? navbarStyle : {}}
    >
      <div className="flex gap-2 w-36 sm:max-w-60 md:w-full justify-start mr-6 md:mr-4">
        <NavbarContent className="flex !flex-none !flex-shrink-0">
          <NavbarBrand>
            <Link
              href="/"
              className="border-transparent hover:border-current border-1 rounded-md p-1"
            >
              <AppLogo />
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex this-is-for-when-menu-is-close-on-md-and-up basis-0 flex-grow-0">
          <Dropdown backdrop="blur" radius="none">
            <NavbarItem className="hidden sm:flex">
              <DropdownTrigger>
                <Button
                  disableRipple
                  className="flex border-transparent hover:border-current border-1 rounded-md p-1 items-center"
                  radius="sm"
                  variant="light"
                  endContent={<FaChevronDown />}
                >
                  <BiCategory className="mr-1" />
                  <span>Categories</span>
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu
              aria-label="Book Categories"
              className="p-0"
              itemClasses={{
                base: [
                  'data-[hover=true]:bg-default-100',
                  'min-w-[120px]',
                  'whitespace-nowrap',
                ],
              }}
              items={bookCategories}
              classNames={{
                list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-[280px] sm:w-[560px] lg:w-[840px] xl:w-[1120px]',
              }}
              onAction={(key) => {
                const category = bookCategories.find((cat) => cat.key === key);

                if (category) {
                  handleCategorySelect(category.key, category.label);
                }
              }}
            >
              {(category) => (
                <DropdownItem
                  key={category.key}
                  className="rounded-none"
                  variant="faded"
                >
                  <Link
                    href={`/category/${encodeURIComponent(category.key)}`}
                    className="flex items-center p-0 w-full"
                  >
                    <span>{category.label}</span>
                  </Link>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </div>

      <SearchBar onSearch={handleSearch} className="!w-full" />

      <div className="flex gap-0">
        <NavbarContent
          className="flex-grow basis-0 gap-1 ml-auto"
          justify="end"
        >
          <NavbarItem>
            {isAdmin && (
              <RoleSwitcher
                user={user}
                emulatedRole={emulatedRole}
                onRoleChange={onRoleChange}
              />
            )}
          </NavbarItem>

          {/***
           * NEW MENU HERE
           *    |
           *    V
           */}

          <NavbarItem className="hidden">
            <Link
              color="foreground"
              href="#"
              className="relative flex border-transparent hover:border-current border-1 rounded-md p-1"
              onClick={handleCartClick}
            >
              <Badge
                className="top-0 right-[-5px]"
                color="danger"
                content={cartItemCount}
                isInvisible={cartItemCount === 0}
                placement="top-right"
                shape="circle"
              >
                <span className="cart-only-show-with-this-question-mark">
                  &nbsp;
                </span>
                <CartIcon />
              </Badge>
            </Link>
          </NavbarItem>

          <NavbarItem className="p-0 !justify-end">
            <ThemeSwitch
              onThemeChange={handleThemeChange}
              initialTheme={theme}
            />
          </NavbarItem>

          <NavbarContent className="hidden sm:flex gap-0 !justify-end">
            {userMenuItems.map((item, index) => (
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
            className="lg:hidden"
          />
        </NavbarContent>
      </div>

      <NavbarMenu className="this-is-for-when-the-menu-is-open-on-smaller-screens flex flex-col sm:hidden">
        <NavbarMenuItem>
          <Link
            className="hover:bg-default-300 text-blue-500 dark:hover:bg-gray-200 dark:hover:text-black p-2 w-full flex"
            href="#"
            onClick={handleCartClick}
          >
            <Badge
              color="danger"
              content={cartItemCount}
              isInvisible={cartItemCount === 0}
              shape="circle"
            >
              <CartIcon />
            </Badge>
            <span className="ml-2">Cart</span>
          </Link>
        </NavbarMenuItem>

        <Dropdown backdrop="blur" radius="none">
          <DropdownTrigger>
            <Button
              disableRipple
              className="w-full cursor-pointer px-2 text-lg justify-start hover:bg-default-300 text-blue-500 dark:hover:bg-gray-200 dark:hover:text-black"
              radius="none"
              variant="light"
              endContent={<FaChevronDown />}
            >
              <BiCategory className="mr-1" />
              <span>Categories</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Book Categories"
            className="p-0"
            itemClasses={{
              base: [
                'data-[hover=true]:bg-default-100',
                'min-w-[120px]',
                'whitespace-nowrap',
              ],
            }}
            items={bookCategories}
            classNames={{
              list: 'grid grid-cols-2 sm:grid-cols-2 gap-2 py-2 px-4',
            }}
            onAction={(key) => {
              const category = bookCategories.find((cat) => cat.key === key);

              if (category) {
                handleCategorySelect(category.key, category.label);
              }
            }}
          >
            {(category) => (
              <DropdownItem
                key={category.key}
                className="rounded-none"
                variant="faded"
              >
                <Link
                  href={`/category/${encodeURIComponent(category.key)}`}
                  className="flex items-center p-0 w-full"
                >
                  <span>{category.label}</span>
                </Link>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
          {userMenuItems.map((item, index) => (
            <NavbarItem key={`${item.item}-${index}`} className="w-full justify-start">
              <Link
                href={item.href}
                onClick={item.onClick}
                className="hover:bg-default-300 text-blue-500 dark:hover:bg-gray-200 dark:hover:text-black p-2 w-full flex text-lg"
              >
                {item.icon}
                <span className="ml-1">{item.item}</span>
              </Link>
            </NavbarItem>
          ))}
      </NavbarMenu>
    </Navbar>
  );
}

export default React.memo(CustomerNavbar);
