"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NavMenu } from "@/components/nav-menu";
import { NavMenuMobile } from "@/components/nav-menu-mobile";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/profile-menu";

export function SiteHeader({
  logoUrl,
  logoUrlDark,
}: {
  logoUrl: string;
  logoUrlDark: string;
}) {
  const [menuState, setMenuState] = React.useState(false);

  return (
    <header>
      <nav data-state={menuState ? "active" : undefined} className="fixed z-20 w-full px-2 group">
        {/* Always the "scrolled" glass-pill treatment from the homepage nav —
            there's no hero to be transparent over on these pages. */}
        <div className="bg-background/70 mx-auto mt-2 max-w-5xl rounded-2xl border px-6 backdrop-blur-lg transition-all duration-300 lg:px-5">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <div className="relative h-9 w-40">
                  <Image
                    src={logoUrl}
                    alt="New Level"
                    fill
                    sizes="160px"
                    className="object-contain object-left dark:hidden"
                  />
                  <Image
                    src={logoUrlDark}
                    alt="New Level"
                    fill
                    sizes="160px"
                    className="hidden object-contain object-left dark:block"
                  />
                </div>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="hidden lg:flex lg:flex-1 lg:justify-center">
              <NavMenu />
            </div>

            {/* max-h + overflow-y-auto below lg: with a deep accordion item
                (Properties/Services) expanded on a short phone viewport,
                this panel could grow tall enough for the fixed MobileDock
                to render on top of "View Properties" — it needs to scroll
                internally instead of growing past the fold. */}
            <div className="bg-background group-data-[state=active]:flex mb-6 hidden max-h-[70vh] w-full flex-wrap items-center justify-end space-y-8 overflow-y-auto rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:max-h-none lg:w-fit lg:gap-6 lg:space-y-0 lg:overflow-visible lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <NavMenuMobile onNavigate={() => setMenuState(false)} />
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:flex-nowrap md:w-fit">
                <ThemeToggle />
                <ProfileMenu />
                <Link
                  href="/properties"
                  className={cn(buttonVariants({ size: "sm" }), "font-heading")}
                >
                  View Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
