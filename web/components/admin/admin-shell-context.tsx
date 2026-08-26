"use client";

import { createContext, useContext, useState } from "react";

type AdminShellValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  troubleshootRequestId: number;
  requestTroubleshoot: () => void;
};

const AdminShellContext = createContext<AdminShellValue>({
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  troubleshootRequestId: 0,
  requestTroubleshoot: () => {},
});

/** Shares state between siblings under the server-rendered admin layout
 *  (AdminSidebar, AdminTopBar, TroubleshootWidget) without lifting it into
 *  a server component.
 *  - mobileNavOpen: the off-canvas drawer's open state (client ask,
 *    2026-08-26: the admin/management side "is completely jumbled on
 *    mobile... nothing is where it needs to be" — the sidebar was a
 *    fixed-width flex item with no responsive behavior at all below
 *    desktop widths).
 *  - troubleshootRequestId: an incrementing counter AdminSidebar's desktop
 *    "Report a problem" row bumps via requestTroubleshoot() to open
 *    TroubleshootWidget's modal from outside its own component tree. This
 *    replaced a `position: fixed` desktop trigger that kept colliding with
 *    AdminSidebar's own bottom-anchored profile-menu/collapse-button stack
 *    — see the TroubleshootWidget comment for the fuller history. A plain
 *    boolean would miss a second click while the modal's already open;
 *    an incrementing id lets the effect fire on every request. */
export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [troubleshootRequestId, setTroubleshootRequestId] = useState(0);
  const requestTroubleshoot = () => setTroubleshootRequestId((n) => n + 1);
  return (
    <AdminShellContext.Provider
      value={{ mobileNavOpen, setMobileNavOpen, troubleshootRequestId, requestTroubleshoot }}
    >
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  return useContext(AdminShellContext);
}
