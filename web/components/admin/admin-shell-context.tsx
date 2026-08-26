"use client";

import { createContext, useContext, useState } from "react";

type AdminShellValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

const AdminShellContext = createContext<AdminShellValue>({
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
});

/** Shares the mobile nav drawer's open state between AdminTopBar (renders
 *  the hamburger trigger) and AdminSidebar (renders the drawer itself) —
 *  they're siblings under the server-rendered admin layout, so this is the
 *  simplest way to connect them without lifting state into a server
 *  component. Client ask (2026-08-26): the admin/management side "is
 *  completely jumbled on mobile... nothing is where it needs to be" — the
 *  sidebar was a fixed-width flex item with no responsive behavior at all
 *  below desktop widths. */
export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <AdminShellContext.Provider value={{ mobileNavOpen, setMobileNavOpen }}>{children}</AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  return useContext(AdminShellContext);
}
