"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";
import { NavMenu } from "@/components/nav-menu";
import { NavMenuMobile } from "@/components/nav-menu-mobile";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/profile-menu";
import { GALLERY_STRIP } from "@/lib/content";

// How long each hero background image stays up before crossfading to the
// next — 18s lands in the middle of the "every 15 to 20 seconds" the client
// asked for. Only images for now (no video source exists yet); each frame
// is just a URL string, so a video frame type can slot in later without
// reworking the rotation/crossfade mechanics.
const HERO_ROTATION_MS = 18000;
const HERO_FADE_MS = 1500;

function useHeroRotation(images: string[]) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, HERO_ROTATION_MS);
    return () => clearInterval(id);
  }, [images.length]);
  return index;
}

// A soft 12px fade+blur read as too subtle to register — replaced with a
// large-travel spring overshoot (no blur, which softens motion rather than
// announcing it) so each hero element visibly launches into place instead
// of quietly appearing.
const transitionVariants = {
  container: {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 70,
      scale: 0.85,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 18,
        mass: 0.9,
      },
    },
  },
};

export function HeroSection({
  logoUrl,
  logoUrlDark,
  heroBgUrl,
}: {
  logoUrl: string;
  logoUrlDark: string;
  heroBgUrl: string | null;
}) {
  // heroBgUrl (the admin-uploadable slot from getSiteContent()) leads the
  // rotation so an admin upload still visibly matters, followed by the same
  // curated photo set used elsewhere (GALLERY_STRIP) — deduped in case the
  // default heroBgUrl already points at one of those files.
  const rotationImages = React.useMemo(() => {
    const gallery = GALLERY_STRIP.map((n) => `/photos/${n}.jpg`);
    const list = heroBgUrl ? [heroBgUrl, ...gallery] : gallery;
    return Array.from(new Set(list));
  }, [heroBgUrl]);
  const activeIndex = useHeroRotation(rotationImages);

  return (
    <>
      <HeroHeader logoUrl={logoUrl} logoUrlDark={logoUrlDark} />
      <main className="overflow-hidden">
        {rotationImages.length > 0 && (
          // A real property photo by default (see getSiteContent() in
          // lib/site-content.ts), layered under the existing glow —
          // rotates through a curated set of real photos every ~18s
          // (crossfaded, not a hard cut) rather than staying static.
          <div aria-hidden className="absolute inset-0 -z-10 size-full overflow-hidden">
            {rotationImages.map((src, i) => (
              <div
                key={src}
                className="absolute inset-0 size-full bg-cover bg-center opacity-0 transition-opacity ease-in-out"
                style={{
                  backgroundImage: `url(${src})`,
                  opacity: i === activeIndex ? 0.25 : 0,
                  transitionDuration: `${HERO_FADE_MS}ms`,
                }}
              />
            ))}
          </div>
        )}
        {/* Decorative depth layer — the original reference used a stock night-sky
            photo here; swapped for a brand-green glow (same AnimatedGroup
            mechanism/timing, New Level content instead of stock imagery). */}
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-60 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[50rem] -translate-y-[250px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(102,60%,60%,.14)_0,hsla(102,60%,40%,.04)_50%,hsla(102,60%,30%,0)_80%)]" />
          <div className="h-[50rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(102,60%,60%,.1)_0,hsla(102,60%,30%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="/about"
                    className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300"
                  >
                    <span className="text-foreground font-heading text-sm font-semibold">
                      New Level · Real Estate. Redefined.
                    </span>
                    <span className="border-background block h-4 w-0.5 border-l bg-white"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>

                  <h1 className="font-heading mt-8 max-w-4xl mx-auto text-balance text-6xl font-bold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Spaces for the moments that matter.
                  </h1>
                  {/* The Explore Properties / Request a Tour CTA row that
                      used to sit here has been pulled per client feedback,
                      pending a better home for it elsewhere on the page. */}
                  <p className="mx-auto mt-8 mb-12 max-w-2xl text-balance text-lg text-muted-foreground">
                    A South Florida Real Estate group matching standout
                    properties to the moments they&apos;re made for —
                    corporate offsites, family gatherings, private events,
                    retreats and extended stays.
                  </p>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const HeroHeader = ({
  logoUrl,
  logoUrlDark,
}: {
  logoUrl: string;
  logoUrlDark: string;
}) => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        data-state={menuState ? "active" : undefined}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/70 max-w-5xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <div className="relative h-14 w-60">
                  {/* fill + object-contain instead of fixed width/height —
                      an admin-uploaded logo isn't guaranteed to match the
                      original asset's aspect ratio, and fixed dimensions
                      would stretch it. */}
                  <Image
                    src={logoUrl}
                    alt="New Level"
                    fill
                    sizes="240px"
                    priority
                    className="object-contain object-left dark:hidden"
                  />
                  <Image
                    src={logoUrlDark}
                    alt="New Level"
                    fill
                    sizes="240px"
                    priority
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

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden max-h-[70vh] w-full flex-wrap items-center space-y-8 overflow-y-auto rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:max-h-none lg:w-fit lg:justify-end lg:gap-6 lg:space-y-0 lg:overflow-visible lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              {/* max-h + overflow-y-auto below lg: an expanded accordion
                  item can grow tall enough for the fixed MobileDock to
                  cover the CTA — same fix as SiteHeader's panel (this hero
                  has its own separate nav markup). w-full on the block
                  below: it used to size to its own intrinsic content width,
                  leaving an empty gap on the left half of the phone screen —
                  it needs to claim the panel's full width itself instead. */}
              <div className="w-full lg:hidden">
                <NavMenuMobile onNavigate={() => setMenuState(false)} />
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:flex-nowrap md:w-fit">
                <ThemeToggle />
                <ProfileMenu />
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "font-heading",
                    isScrolled && "lg:hidden"
                  )}
                >
                  <span>Contact</span>
                </Link>
                <Link
                  href="/properties"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "font-heading",
                    isScrolled ? "lg:inline-flex" : "hidden"
                  )}
                >
                  <span>View Properties</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
