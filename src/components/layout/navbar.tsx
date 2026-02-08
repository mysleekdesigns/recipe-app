"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchTrigger } from "./search-bar";
import { ThemeToggle } from "../common/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/meal-plan", label: "Meal Plan" },
  { href: "/shopping", label: "Shopping Lists" },
  { href: "/categories", label: "Categories" },
];

export function Navbar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-surface">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-bold">
          <span className="text-text-primary">RECIPE</span>
          <span className="text-primary">APP</span>
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive
                    ? "font-bold text-primary"
                    : "font-normal text-text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-2 md:flex">
          <SearchTrigger />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center gap-1 text-xl font-bold">
                    <span className="text-text-primary">RECIPE</span>
                    <span className="text-primary">APP</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "text-lg transition-colors hover:text-primary",
                        isActive
                          ? "font-bold text-primary"
                          : "font-normal text-text-primary"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-4 pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    <User className="mr-2 h-5 w-5" />
                    User Profile
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
