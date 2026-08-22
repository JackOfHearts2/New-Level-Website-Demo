"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

// SSR/hydration can't know the real theme (no DOM), so this assumes "light"
// for that first render only — see useHasMounted below, which hides the
// icon entirely until just after hydration instead of ever showing it wrong.
function getServerSnapshot() {
  return false;
}

function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
  listeners.forEach((l) => l());
}

// Flips from false -> true exactly once, right after hydration, with no
// setState-in-effect: server/first-hydration render always sees false
// (matching, so no mismatch warning), every render after that sees true.
// By the time it flips, getSnapshot() above already reflects the real
// class the blocking init script set before paint — so isDark is already
// correct the first moment the icon actually appears, no wrong-icon flash.
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const hasMounted = useHasMounted();
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!hasMounted) {
    return <div className="size-8" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setDark(!isDark)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
