"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "@/components/profile-menu";

const ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/properties", icon: Building2, label: "Properties" },
  { href: "/contact", icon: Mail, label: "Contact" },
];

// Fixed bottom quick-access bar, mobile only (md:hidden) — a supplement to
// the hamburger menu, not a replacement: the hamburger still covers full
// site navigation, this covers the handful of things worth one tap away.
export function MobileDock() {
  const pathname = usePathname();

  // /property already has its own fixed-bottom StickyBookingBar at the
  // same inset-x-0 bottom-4 position — rendering both would stack two
  // competing fixed bars on top of each other on mobile.
  if (pathname === "/property") return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:hidden"
    >
      <div className="bg-background/80 border-border flex items-center gap-1 rounded-full border p-1.5 shadow-lg backdrop-blur-xl">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex size-11 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
            </Link>
          );
        })}
        <div className="border-border mx-0.5 h-6 border-l" />
        <div className="flex size-11 items-center justify-center">
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
}
