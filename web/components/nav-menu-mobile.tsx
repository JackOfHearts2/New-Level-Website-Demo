"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_MENU } from "@/lib/content";

export function NavMenuMobile({ onNavigate }: { onNavigate?: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="space-y-1 text-base">
      {NAV_MENU.map((item, i) => {
        const hasChildren = "children" in item && item.children;
        return (
          <li key={item.href}>
            <div className="flex items-center justify-between">
              <Link
                href={item.href}
                onClick={onNavigate}
                className="text-foreground hover:text-foreground font-heading block py-2 font-medium duration-150"
              >
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  aria-expanded={openIndex === i}
                  aria-label={`${item.label} submenu`}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="text-foreground hover:text-foreground p-2"
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-150",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>
            {hasChildren && openIndex === i && (
              <ul className="border-border ml-3 space-y-1 border-l pl-3">
                {item.children!.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className="text-foreground hover:text-foreground block py-1.5 text-sm"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
