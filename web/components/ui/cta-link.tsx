import Link from "next/link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from "@/lib/utils";

// The "Meet the full team" look (rotating border-glow pill) generalized
// into one component, so every prompt-to-action CTA site-wide shares it
// instead of each page rebuilding the Link+HoverBorderGradient pairing.
export function CtaLink({
  href,
  children,
  variant = "dark",
  external,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const pill = (
    <HoverBorderGradient
      as="div"
      variant={variant}
      className={cn("font-heading flex items-center gap-2 font-semibold", className)}
    >
      {children}
    </HoverBorderGradient>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={onClick}>
        {pill}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick}>
      {pill}
    </Link>
  );
}
