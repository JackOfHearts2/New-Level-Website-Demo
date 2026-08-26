"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Flag,
  Users,
  BarChart3,
  Image as MediaIcon,
  Settings,
  LayoutGrid,
  List,
  Building2,
} from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { saveDashboardView } from "@/app/admin/(dashboard)/actions";

const ICONS = {
  approvals: ClipboardCheck,
  reports: Flag,
  staff: Users,
  analytics: BarChart3,
  content: MediaIcon,
  settings: Settings,
  properties: Building2,
} as const;
type IconKey = keyof typeof ICONS;

export type StatItem = { href: string; label: string; value: string | number; icon: IconKey };
export type NavTileItem = { href: string; title: string; description: string; icon: IconKey };
export type ActivityItem = { id: string; summary: string; actorLabel: string; timeAgo: string };

/** Dashboard home layout, toggleable between two preset views — client
 *  landed here (2026-08-26) after discussing free-form drag/resize vs.
 *  something simpler: "we could just set it with our own format, and
 *  they can toggle between different views." Overview is the CRM-style
 *  stat-tile grid (the two screenshots the client shared); Compact is a
 *  denser single-column list of the same data — same underlying
 *  data/props either way, just two render paths. */
export function DashboardView({
  initialView,
  stats,
  navTiles,
  activity,
}: {
  initialView: "overview" | "compact";
  stats: StatItem[];
  navTiles: NavTileItem[];
  activity: ActivityItem[] | null;
}) {
  const [view, setView] = useState(initialView);

  function setViewAndSave(next: "overview" | "compact") {
    setView(next);
    saveDashboardView(next);
  }

  const toggle = (
    <div className="border-border flex items-center gap-1 rounded-lg border p-1">
      <button
        type="button"
        onClick={() => setViewAndSave("overview")}
        aria-pressed={view === "overview"}
        aria-label="Overview layout"
        title="Overview"
        className={`flex size-7 items-center justify-center rounded-md ${view === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        <LayoutGrid className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setViewAndSave("compact")}
        aria-pressed={view === "compact"}
        aria-label="Compact layout"
        title="Compact"
        className={`flex size-7 items-center justify-center rounded-md ${view === "compact" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        <List className="size-3.5" />
      </button>
    </div>
  );

  if (view === "compact") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Dashboard view</h2>
          {toggle}
        </div>

        <GlowCard className="block divide-y divide-border p-0">
          {[...stats, ...navTiles.map((n) => ({ href: n.href, label: n.title, value: n.description, icon: n.icon }))].map(
            (row) => {
              const Icon = ICONS[row.icon];
              return (
                <Link
                  key={row.href}
                  href={row.href}
                  className="hover:bg-muted flex items-center gap-3 p-4 transition-colors"
                >
                  <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{row.label}</span>
                  <span className="text-muted-foreground text-sm">{row.value}</span>
                </Link>
              );
            }
          )}
        </GlowCard>

        {activity && (
          <GlowCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold">Recent Activity</h3>
              <Link href="/admin/activity" className="text-primary text-xs font-semibold">
                View all
              </Link>
            </div>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
            ) : (
              <ul className="divide-border divide-y">
                {activity.map((row) => (
                  <li key={row.id} className="py-2 text-sm">
                    <p className="truncate">{row.summary}</p>
                    <p className="text-muted-foreground text-xs">
                      {row.actorLabel} · {row.timeAgo}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </GlowCard>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">{toggle}</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <GlowCard key={s.href} href={s.href} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{s.label}</p>
              <p className="font-heading mt-1 text-2xl font-bold">{s.value}</p>
            </GlowCard>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          {navTiles.map((n) => {
            const Icon = ICONS[n.icon];
            return (
              <GlowCard key={n.href} href={n.href} className="flex items-start gap-3 p-5">
                <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <div>
                  <h2 className="font-heading font-semibold">{n.title}</h2>
                  <p className="text-muted-foreground mt-0.5 text-sm">{n.description}</p>
                </div>
              </GlowCard>
            );
          })}
        </div>

        {activity && (
          <GlowCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold">Recent Activity</h3>
              <Link href="/admin/activity" className="text-primary text-xs font-semibold">
                View all
              </Link>
            </div>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((row) => (
                  <li key={row.id} className="text-sm">
                    <p className="truncate">{row.summary}</p>
                    <p className="text-muted-foreground text-xs">
                      {row.actorLabel} · {row.timeAgo}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </GlowCard>
        )}
      </div>
    </div>
  );
}
