"use client";

import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShare } from "@/lib/use-share";

export function ShareButton({
  href,
  title,
  className,
}: {
  href: string;
  title: string;
  className?: string;
}) {
  const { share, copied } = useShare(
    typeof window !== "undefined" ? `${window.location.origin}${href}` : href,
    title
  );

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "font-heading inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted",
        className
      )}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
