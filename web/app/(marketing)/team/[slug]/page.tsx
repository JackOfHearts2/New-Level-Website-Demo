import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Quote } from "lucide-react";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEAM } from "@/lib/content";

export function generateStaticParams() {
  return TEAM.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = TEAM.find((m) => m.slug === slug);
  if (!member) return {};
  return { title: `${member.name} · New Level` };
}

// Each team member's own small landing/bio page — reachable from a photo
// on the homepage carousel or a row on the full /team roster (see
// team-roster.tsx and team-image-accordion.tsx). Placeholder profiles are
// flagged plainly rather than reading as real hires; Shelley's copy reuses
// the real migrated bio/contact info instead of inventing new text for the
// one real person on the team.
export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = TEAM.find((m) => m.slug === slug);
  if (!member) notFound();

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pt-32 pb-20 sm:pt-40">
        <Link
          href="/team"
          className="text-foreground hover:text-primary mb-8 inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Back to the team
        </Link>

        <GlowCard className="grid overflow-hidden p-0 md:grid-cols-2">
          <div className="relative aspect-4/3 md:aspect-auto md:min-h-[520px]">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className={cn("object-cover", member.photoPosition === "top" && "object-top")}
              priority
            />
          </div>

          <div className="flex flex-col justify-center gap-5 p-8 sm:p-10 md:p-14">
            <div className="flex flex-wrap items-center gap-2">
              <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                {member.role}
              </ShinePill>
              {member.placeholder && (
                <span className="border-border text-foreground rounded-full border px-3 py-1 text-xs font-medium">
                  Placeholder profile
                </span>
              )}
            </div>

            <h1 className="font-heading text-4xl font-bold text-balance md:text-5xl">
              {member.name}
            </h1>

            <div className="relative pl-9">
              <Quote className="text-primary/25 absolute top-0 left-0 size-7" aria-hidden />
              <p className="font-heading text-xl italic text-balance">{member.quote}</p>
            </div>

            <p className="text-foreground">{member.bio}</p>

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={`mailto:${member.email}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
              >
                <Mail />
                Email
              </a>
              <a
                href={`tel:${member.phone}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
              >
                <Phone />
                {member.phone}
              </a>
            </div>
          </div>
        </GlowCard>
      </section>

      <CrossNav current="team" />
    </>
  );
}
