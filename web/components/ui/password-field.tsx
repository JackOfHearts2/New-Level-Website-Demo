"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** A password `<input>` with a show/hide toggle — client ask (2026-08-27):
 *  "the little hid/unhide toggle for when they type their password is
 *  essential." Matches this project's plain border-border input styling
 *  (not the shadcn Input component, which every raw password field in
 *  this app already skips in favor of inline classes) so it drops in
 *  wherever a bare `<input type="password">` was. LoginForm's floating-
 *  label password field has different-enough markup that it gets its own
 *  toggle button inline rather than using this. */
export function PasswordField({
  className,
  inputClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { inputClassName?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "border-border bg-background w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          inputClassName
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
