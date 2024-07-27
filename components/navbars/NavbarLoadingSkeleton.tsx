// components/NavbarLoadingSkeleton.tsx
import AppLogo from "@/components/AppLogo";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Skeleton,
} from "@nextui-org/react";
import React from "react";

export default function NavbarLoadingSkeleton() {
  return (
    <Navbar
      isBordered
      className="py-1 fixed top-0 left-0 right-0 z-50"
      maxWidth="full"
    >
      <NavbarBrand>
        <AppLogo />
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="w-24 h-8 rounded-lg" />
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-10 h-8 rounded-full" />
        ))}
      </NavbarContent>
    </Navbar>
  );
}
