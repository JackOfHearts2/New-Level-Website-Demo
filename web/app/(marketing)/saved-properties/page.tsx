import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { CardActions } from "@/components/property/card-actions";
import { SignInPromptButton } from "@/components/sign-in-prompt-button";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Saved Properties · New Level",
};

// Registry of the property_slug values SaveButton/CardActions can write to
// saved_properties — currently just the one real listing. Extend this
// alongside PROPERTY_SPECS/OTHER_PROPERTIES as more properties go live.
const SAVEABLE_PROPERTIES: Record<string, { href: string; title: string; sub: string }> = {
  "nw-87th-street": { href: "/property", title: PROPERTY.siteName, sub: PROPERTY.address },
};

export default async function SavedPropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <PageHero
          eyebrow="Your Account"
          heading="Saved Properties"
          sub="Sign in to see properties you've saved."
        />
        <section className="mx-auto max-w-md px-6 pb-24 text-center">
          <GlowCard className="p-8">
            <p className="text-foreground text-sm">
              Once you&apos;re signed in, properties you save (using the heart icon on a listing)
              show up here.
            </p>
            <div className="mt-6 flex justify-center">
              <SignInPromptButton />
            </div>
          </GlowCard>
        </section>
        <CrossNav current="properties" />
      </>
    );
  }

  const { data: saved } = await supabase
    .from("saved_properties")
    .select("property_slug")
    .eq("user_id", user.id);

  const slugs = (saved ?? []).map((r) => r.property_slug as string);

  return (
    <>
      <PageHero
        eyebrow="Your Account"
        heading="Saved Properties"
        sub={
          slugs.length > 0
            ? "Properties you've saved while browsing."
            : "You haven't saved any properties yet."
        }
      />
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {slugs.length === 0 ? (
          <div className="text-center">
            <p className="text-foreground text-sm">
              Tap the heart icon on any listing to save it here.
            </p>
            <div className="mt-6 flex justify-center">
              <CtaLink href="/properties">Browse properties</CtaLink>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {slugs.map((slug) => {
              const info = SAVEABLE_PROPERTIES[slug];
              if (!info) return null;
              return (
                <div key={slug} className="relative">
                  <GlowCard
                    href={info.href}
                    className="group hover:-translate-y-1 block overflow-hidden p-0 transition-transform duration-300"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src="/photos/00.jpg"
                        alt={info.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold">{info.title}</h3>
                      <p className="text-foreground text-sm">{info.sub}</p>
                    </div>
                  </GlowCard>
                  <CardActions propertySlug={slug} href={info.href} shareTitle={info.title} />
                </div>
              );
            })}
          </div>
        )}
      </section>
      <CrossNav current="properties" />
    </>
  );
}
