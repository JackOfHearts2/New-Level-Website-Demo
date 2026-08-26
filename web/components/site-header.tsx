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
import { SiteSearch } from "@/components/site-search";

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
        {/* max-w-6xl (was max-w-5xl): the bigger logo plus the new Blog nav
            item made the row too wide for max-w-5xl at typical desktop
            widths, so the utility icons (theme/profile/View Properties)
            were wrapping onto their own line directly under the logo
            instead of sitting beside the nav links. */}
        <div className="bg-background/70 mx-auto mt-2 max-w-6xl rounded-2xl border px-6 backdrop-blur-lg transition-all duration-300 lg:px-5">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:flex-nowrap lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <div className="relative h-16 w-64">
                  <Image
                    src={logoUrl}
                    alt="New Level"
                    fill
                    sizes="256px"
                    className="object-contain object-left dark:hidden"
                  />
                  <Image
                    src={logoUrlDark}
                    alt="New Level"
                    fill
                    sizes="256px"
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
            <div className="bg-background group-data-[state=active]:flex mb-6 hidden max-h-[70vh] w-full flex-wrap items-center space-y-8 overflow-y-auto rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:max-h-none lg:w-fit lg:justify-end lg:gap-6 lg:space-y-0 lg:overflow-visible lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              {/* w-full: this block used to size to its own intrinsic
                  content width inside a justify-end panel, leaving an empty
                  gap on the left half of the phone screen — it needs to
                  claim the panel's full width itself instead. */}
              <div className="w-full lg:hidden">
                <NavMenuMobile onNavigate={() => setMenuState(false)} />
              </div>
              {/* justify-end: this row used to sit left-aligned, directly
                  under the nav list (and visually under the logo above it)
                  — client asked for it pinned to the right side of the
                  panel instead. */}
              <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:flex-nowrap md:w-fit">
                <SiteSearch />
                <ThemeToggle />
                <ProfileMenu />
                {/* hidden below xl: even after trimming NavMenu's own gap,
                    the full row (bigger logo + 7-item nav + icons + this
                    button) still doesn't fit in the narrow 1024–1279px
                    range (e.g. iPad landscape) — genuinely confirmed via a
                    real bounding-box check, not just the page-level
                    scrollWidth sweep, which doesn't catch overflow on a
                    position:fixed element. "Properties" is already in the
                    nav itself, so dropping this one button there is a safe
                    trim rather than reintroducing the wrap-under-logo bug. */}
                <Link
                  href="/properties"
                  className={cn(buttonVariants({ size: "sm" }), "font-heading hidden xl:inline-flex")}
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
