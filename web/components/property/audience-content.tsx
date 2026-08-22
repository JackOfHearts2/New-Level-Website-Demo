"use client";

import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { AUDIENCES, AUDIENCE_PHOTOS } from "@/lib/content";
import { FaqList } from "@/components/faq-list";
import { ShineBox } from "@/components/ui/shine-shape";
import { useBooking } from "./booking-context";

export function AudienceContent() {
  const { state } = useBooking();

  if (!state.audience) {
    return (
      <section id="audienceContent" className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <p className="text-foreground">
          Choose what brings you here above to see details tailored to your visit.
        </p>
      </section>
    );
  }

  const a = AUDIENCES[state.audience];
  const photos = AUDIENCE_PHOTOS[state.audience];

  return (
    <section id="audienceContent" className="mx-auto max-w-7xl px-6 pb-16">
      {/* Overview */}
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-heading text-3xl font-bold text-balance md:text-4xl">
            {a.headline}
          </h2>
          <p className="text-foreground mt-4 text-balance">{a.overview}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {a.facts.map((fact) => (
              <ShineBox key={fact.k} className="border-border rounded-xl border p-4">
                <div className="text-foreground text-sm">{fact.k}</div>
                <div className="font-heading font-semibold">{fact.v}</div>
              </ShineBox>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={`/photos/${photos.overview}.jpg`}
            alt={a.headline}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* What's included */}
      <div className="mt-16">
        <h3 className="font-heading text-xl font-bold">What&apos;s included</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {a.included.map((item) => (
            <div key={item.t} className="flex gap-3">
              <CircleCheck className="text-primary mt-0.5 size-5 shrink-0" />
              <div>
                <div className="font-heading text-sm font-semibold">{item.t}</div>
                <div className="text-foreground text-sm">{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h3 className="font-heading text-xl font-bold">How it works</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {a.steps.map((step, i) => (
            <div key={step.t}>
              <div className="font-heading text-primary text-2xl font-bold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-heading mt-2 text-sm font-semibold">{step.t}</div>
              <div className="text-foreground mt-1 text-sm">{step.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience FAQ */}
      <div className="mt-16">
        <h3 className="font-heading text-xl font-bold">Questions from guests like you</h3>
        <div className="mt-6">
          <FaqList faqs={a.faqs} />
        </div>
      </div>
    </section>
  );
}
