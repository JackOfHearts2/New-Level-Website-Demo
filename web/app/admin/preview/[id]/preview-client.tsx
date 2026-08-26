"use client";

import { useRouter } from "next/navigation";
import { SitePreview } from "@/components/site-preview";
import type { SiteContent } from "@/lib/site-content";

type ResolvedContent = Omit<SiteContent, "images"> & {
  images: { logoUrl: string; logoUrlDark: string; heroBgUrl: string };
};

export function PreviewPageClient({ content }: { content: ResolvedContent }) {
  const router = useRouter();
  return <SitePreview content={content} onClose={() => router.push("/admin/approvals")} />;
}
